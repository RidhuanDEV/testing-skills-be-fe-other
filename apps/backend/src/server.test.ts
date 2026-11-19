import assert from 'node:assert/strict'
import http from 'node:http'
import test from 'node:test'
import { resetRevokedSsoSessions, revokeSsoSession } from 'ridhuan-sso-client'
import { createApp } from './server.js'
import { calculateDiscountedTotalCents } from './services/checkout.js'
import { isRecord } from './types.js'

async function startEphemeralServer(): Promise<{ readonly baseUrl: string; readonly close: () => Promise<void> }> {
  const { app } = createApp()
  const server = http.createServer(app)
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve())
  })
  const addr = server.address()
  if (!addr || typeof addr === 'string') {
    throw new Error('Failed to bind ephemeral port')
  }
  return {
    baseUrl: `http://127.0.0.1:${addr.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()))
      }),
  }
}

test('discount rounding boundaries use deterministic half-up cents (T22)', () => {
  assert.equal(calculateDiscountedTotalCents(100, 0), 100)
  assert.equal(calculateDiscountedTotalCents(100, 100), 0)
  assert.equal(calculateDiscountedTotalCents(105, 10), 94)
})

test('backend enforces SSO RBAC, tenant isolation, idempotency, search ACL, legal hold, 202 & SSE', async (t) => {
  resetRevokedSsoSessions()
  const srv = await startEphemeralServer()
  t.after(async () => {
    resetRevokedSsoSessions()
    await srv.close()
  })

  // 1. Spoofed client headers without valid Bearer token -> 401
  const unauth = await fetch(`${srv.baseUrl}/api/v1/orders`, {
    headers: { 'X-Username': 'arman.alpha', 'X-Role': 'admin' },
  })
  assert.equal(unauth.status, 401)

  // 2. Viewer cannot call admin-export and cannot access another tenant
  const viewerEscalate = await fetch(`${srv.baseUrl}/api/v1/tenants/t-alpha/admin-export`, {
    headers: { Authorization: 'Bearer sso-alpha-viewer', 'X-Role': 'admin' },
  })
  assert.equal(viewerEscalate.status, 403)

  const crossTenant = await fetch(`${srv.baseUrl}/api/v1/tenants/t-beta/admin-export`, {
    headers: { Authorization: 'Bearer sso-alpha-admin' },
  })
  assert.equal(crossTenant.status, 403)

  const ownAdminExport = await fetch(`${srv.baseUrl}/api/v1/tenants/t-alpha/admin-export`, {
    headers: { Authorization: 'Bearer sso-alpha-admin' },
  })
  assert.equal(ownAdminExport.status, 200)

  // 3. Idempotent checkout + stale webhook rejection (T06 / E04)
  const payload = {
    orderId: 'ord-999',
    customerName: 'PT Uji Coba',
    subtotalCents: 105,
    discountPct: 10,
    idempotencyKey: 'idem-999',
  }
  const create1 = await fetch(`${srv.baseUrl}/api/v1/orders`, {
    method: 'POST',
    headers: { Authorization: 'Bearer sso-alpha-admin', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  assert.equal(create1.status, 201)
  const create2 = await fetch(`${srv.baseUrl}/api/v1/orders`, {
    method: 'POST',
    headers: { Authorization: 'Bearer sso-alpha-admin', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  assert.equal(create2.status, 200)

  const whSettle = await fetch(`${srv.baseUrl}/api/v1/webhooks/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId: 'evt-2', orderId: 'ord-999', eventSeq: 2, nextStatus: 'SETTLED' }),
  })
  assert.equal(whSettle.status, 200)
  const whStale = await fetch(`${srv.baseUrl}/api/v1/webhooks/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId: 'evt-1', orderId: 'ord-999', eventSeq: 1, nextStatus: 'PENDING' }),
  })
  const whStaleBody: unknown = await whStale.json()
  assert.ok(isRecord(whStaleBody) && whStaleBody['result'] === 'STALE_IGNORED')

  // 4. Search ACL pre-filter + erasure + legal hold protection (T19 / E08)
  const searchAlpha = await fetch(`${srv.baseUrl}/api/v1/search?q=beta`, {
    headers: { Authorization: 'Bearer sso-alpha-admin' },
  })
  const searchAlphaJson: unknown = await searchAlpha.json()
  assert.ok(isRecord(searchAlphaJson) && Array.isArray(searchAlphaJson['results']) && searchAlphaJson['results'].length === 0)

  const eraseLegalHold = await fetch(`${srv.baseUrl}/api/v1/search/docs/doc-a2`, {
    method: 'DELETE',
    headers: { Authorization: 'Bearer sso-alpha-admin' },
  })
  assert.equal(eraseLegalHold.status, 409)

  const eraseNormal = await fetch(`${srv.baseUrl}/api/v1/search/docs/doc-a1`, {
    method: 'DELETE',
    headers: { Authorization: 'Bearer sso-alpha-admin' },
  })
  assert.equal(eraseNormal.status, 200)

  // 5. HTTP 202 async export stays QUEUED (D10)
  const jobRes = await fetch(`${srv.baseUrl}/api/v1/jobs/export`, {
    method: 'POST',
    headers: { Authorization: 'Bearer sso-alpha-admin' },
  })
  assert.equal(jobRes.status, 202)
  const jobJson: unknown = await jobRes.json()
  assert.ok(isRecord(jobJson) && jobJson['status'] === 'QUEUED')

  // 6. SSE stream respects tenant boundary and mid-session revocation (T15)
  const sseOk = await fetch(`${srv.baseUrl}/api/v1/events/stream?lastEventId=0`, {
    headers: { Authorization: 'Bearer sso-alpha-admin' },
  })
  assert.equal(sseOk.status, 200)
  const sseText = await sseOk.text()
  assert.match(sseText, /ord-101/)
  assert.doesNotMatch(sseText, /ord-201/)

  revokeSsoSession('sess-alpha-2')
  const sseRevoked = await fetch(`${srv.baseUrl}/api/v1/events/stream?lastEventId=0`, {
    headers: { Authorization: 'Bearer sso-alpha-admin' },
  })
  assert.equal(sseRevoked.status, 401)
})
