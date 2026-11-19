import express from 'express'
import type { Express, Request, Response } from 'express'
import { verifySsoBearerToken } from 'ridhuan-sso-client'
import type { VerifiedSsoClaims } from 'ridhuan-sso-client'
import type { AppStore } from './db.js'
import {
  createStore,
  getOrderById,
  listOrdersByTenant,
  requestDocumentErasure,
  searchDocumentsForTenant,
} from './db.js'
import { applyPaymentWebhook, createOrderIdempotently } from './services/checkout.js'
import type { ExportJob } from './types.js'
import { isOrderStatus, isTenantId, parseCheckoutInput, parseWebhookEventPayload } from './types.js'

function authenticate(req: Request, res: Response): VerifiedSsoClaims | null {
  // Always derive identity from verified SSO claims; never trust X-Username or X-Role headers
  const claims = verifySsoBearerToken(req.header('authorization'))
  if (!claims) {
    res.status(401).json({ error: 'unauthorized', message: 'Valid Bearer SSO token required' })
    return null
  }
  return claims
}

function readSingleQueryString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export function createApp(existingStore?: AppStore): { readonly app: Express; readonly store: AppStore } {
  const store = existingStore ?? createStore(':memory:')
  const app = express()
  app.use(express.json())

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Last-Event-ID')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    if (req.method === 'OPTIONS') {
      res.status(204).end()
      return
    }
    next()
  })

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'shadow-test-backend' })
  })

  app.get('/api/v1/me', (req, res) => {
    const claims = authenticate(req, res)
    if (!claims) return
    res.json({
      sub: claims.sub,
      username: claims.username,
      role: claims.role,
      tenantId: claims.tenantId,
    })
  })

  // Clean orders endpoint honoring ?status= filter + tenant isolation
  app.get('/api/v1/orders', (req, res) => {
    const claims = authenticate(req, res)
    if (!claims) return
    const rawStatus = readSingleQueryString(req.query['status'])
    if (rawStatus !== undefined && !isOrderStatus(rawStatus)) {
      res.status(400).json({ error: 'invalid_status', allowed: ['PENDING', 'SETTLED', 'CANCELLED'] })
      return
    }
    const items = listOrdersByTenant(store, claims.tenantId, rawStatus)
    res.json({ items })
  })

  // Deliberate seeded bug fixture for Scenario 06 (E03): accepts ?status= but silently ignores it!
  app.get('/api/v1/orders/legacy-list', (req, res) => {
    const claims = authenticate(req, res)
    if (!claims) return
    const items = listOrdersByTenant(store, claims.tenantId)
    res.json({ items, fixtureNote: 'intentional_e03_ignored_query_param_fixture' })
  })

  app.post('/api/v1/orders', (req, res) => {
    const claims = authenticate(req, res)
    if (!claims) return
    const input = parseCheckoutInput(req.body)
    if (!input) {
      res.status(400).json({ error: 'invalid_checkout_payload' })
      return
    }
    const outcome = createOrderIdempotently(store, claims.tenantId, input)
    res.status(outcome.created ? 201 : 200).json(outcome)
  })

  app.post('/api/v1/webhooks/payment', (req, res) => {
    const payload = parseWebhookEventPayload(req.body)
    if (!payload) {
      res.status(400).json({ error: 'invalid_webhook_payload' })
      return
    }
    const outcome = applyPaymentWebhook(store, payload)
    if (outcome.result === 'NOT_FOUND') {
      res.status(404).json(outcome)
      return
    }
    res.status(200).json(outcome)
  })

  // Admin-only tenant-bound export (T20 / C06)
  app.get('/api/v1/tenants/:tenantId/admin-export', (req, res) => {
    const claims = authenticate(req, res)
    if (!claims) return
    const targetTenant = req.params['tenantId']
    if (!isTenantId(targetTenant) || targetTenant !== claims.tenantId) {
      res.status(403).json({ error: 'cross_tenant_denied' })
      return
    }
    if (claims.role !== 'admin') {
      res.status(403).json({ error: 'insufficient_role' })
      return
    }
    res.json({
      tenantId: claims.tenantId,
      exportedBy: claims.username,
      orders: listOrdersByTenant(store, claims.tenantId),
    })
  })

  // Async HTTP 202 job creation (D10 / Doherty UX fixture)
  app.post('/api/v1/jobs/export', (req, res) => {
    const claims = authenticate(req, res)
    if (!claims) return
    const jobId = `job-${Date.now()}-${store.exportJobs.size + 1}`
    const job: ExportJob = {
      jobId,
      tenantId: claims.tenantId,
      status: 'QUEUED',
      createdAt: new Date().toISOString(),
    }
    store.exportJobs.set(jobId, job)
    res.status(202).json(job)
  })

  app.get('/api/v1/jobs/:jobId', (req, res) => {
    const claims = authenticate(req, res)
    if (!claims) return
    const jobId = req.params['jobId']
    const job = typeof jobId === 'string' ? store.exportJobs.get(jobId) : undefined
    if (!job || job.tenantId !== claims.tenantId) {
      res.status(404).json({ error: 'job_not_found' })
      return
    }
    res.json(job)
  })

  // Search with tenant ACL pre-filter + erasure tombstone handling (T19 / E08)
  app.get('/api/v1/search', (req, res) => {
    const claims = authenticate(req, res)
    if (!claims) return
    const q = readSingleQueryString(req.query['q']) ?? ''
    const results = searchDocumentsForTenant(store, claims.tenantId, q)
    res.json({ query: q, tenantId: claims.tenantId, results })
  })

  app.delete('/api/v1/search/docs/:docId', (req, res) => {
    const claims = authenticate(req, res)
    if (!claims) return
    if (claims.role !== 'admin') {
      res.status(403).json({ error: 'insufficient_role' })
      return
    }
    const docId = req.params['docId'] ?? ''
    const outcome = requestDocumentErasure(store, claims.tenantId, docId)
    if (outcome.status === 'NOT_FOUND') {
      res.status(404).json(outcome)
      return
    }
    if (outcome.status === 'BLOCKED_LEGAL_HOLD') {
      res.status(409).json(outcome)
      return
    }
    res.status(200).json(outcome)
  })

  // Deliberate N+1 query fixture for Scenario 06 (shadow-debug / shadow-perf)
  app.get('/api/v1/reports/n-plus-one', (req, res) => {
    const claims = authenticate(req, res)
    if (!claims) return
    const orders = listOrdersByTenant(store, claims.tenantId)
    let queryCount = 1
    const hydrated = orders.map((order) => {
      queryCount += 1
      const fresh = getOrderById(store, order.id)
      return fresh ?? order
    })
    res.json({ queryCount, items: hydrated, fixtureNote: 'intentional_n_plus_one_fixture' })
  })

  // SSE stream with Last-Event-ID resumption & mid-session auth check (T15)
  app.get('/api/v1/events/stream', (req, res) => {
    const claims = authenticate(req, res)
    if (!claims) return
    const rawLastId = req.header('last-event-id') ?? readSingleQueryString(req.query['lastEventId']) ?? '0'
    const lastSeq = Number.parseInt(rawLastId, 10)
    const afterSeq = Number.isNaN(lastSeq) ? 0 : lastSeq

    res.status(200)
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const matchingEvents = store.outboxEvents.filter(
      (evt) => evt.tenantId === claims.tenantId && evt.seq > afterSeq,
    )
    for (const evt of matchingEvents) {
      res.write(`id: ${evt.seq}\nevent: ${evt.type}\ndata: ${JSON.stringify(evt)}\n\n`)
    }
    res.end()
  })

  return { app, store }
}
