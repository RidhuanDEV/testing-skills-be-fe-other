import { DatabaseSync } from 'node:sqlite'
import type { ExportJob, OrderRecord, OrderStatus, SearchDocument, TenantId } from './types.js'
import { isOrderStatus, isRecord, isTenantId } from './types.js'

export interface AppStore {
  readonly db: DatabaseSync
  readonly exportJobs: Map<string, ExportJob>
  readonly processedWebhooks: Set<string>
  readonly outboxEvents: Array<{ readonly seq: number; readonly tenantId: TenantId; readonly type: string; readonly orderId: string }>
}

function readOrderRow(row: unknown): OrderRecord | null {
  if (!isRecord(row)) return null
  const {
    id,
    tenant_id,
    customer_name,
    subtotal_cents,
    discount_pct,
    total_cents,
    status,
    version,
    idempotency_key,
    created_at,
  } = row
  if (
    typeof id !== 'string' ||
    !isTenantId(tenant_id) ||
    typeof customer_name !== 'string' ||
    typeof subtotal_cents !== 'number' ||
    typeof discount_pct !== 'number' ||
    typeof total_cents !== 'number' ||
    !isOrderStatus(status) ||
    typeof version !== 'number' ||
    typeof idempotency_key !== 'string' ||
    typeof created_at !== 'string'
  ) {
    return null
  }
  return {
    id,
    tenantId: tenant_id,
    customerName: customer_name,
    subtotalCents: subtotal_cents,
    discountPct: discount_pct,
    totalCents: total_cents,
    status,
    version,
    idempotencyKey: idempotency_key,
    createdAt: created_at,
  }
}

function readSearchDocRow(row: unknown): SearchDocument | null {
  if (!isRecord(row)) return null
  const { id, tenant_id, title, body, legal_hold, erased } = row
  if (
    typeof id !== 'string' ||
    !isTenantId(tenant_id) ||
    typeof title !== 'string' ||
    typeof body !== 'string' ||
    typeof legal_hold !== 'number' ||
    typeof erased !== 'number'
  ) {
    return null
  }
  return {
    id,
    tenantId: tenant_id,
    title,
    body,
    legalHold: legal_hold === 1,
    erased: erased === 1,
  }
}

export function createStore(sqlitePath: string = ':memory:'): AppStore {
  const db = new DatabaseSync(sqlitePath)
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      subtotal_cents INTEGER NOT NULL,
      discount_pct REAL NOT NULL,
      total_cents INTEGER NOT NULL,
      status TEXT NOT NULL,
      version INTEGER NOT NULL,
      idempotency_key TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS search_docs (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      legal_hold INTEGER NOT NULL DEFAULT 0,
      erased INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS erasure_tombstones (
      seq INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_id TEXT NOT NULL,
      tenant_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `)

  const countRow = db.prepare('SELECT COUNT(*) AS cnt FROM orders').get()
  const existingCount = isRecord(countRow) && typeof countRow.cnt === 'number' ? countRow.cnt : 0
  if (existingCount === 0) {
    const insertOrder = db.prepare(`
      INSERT INTO orders (id, tenant_id, customer_name, subtotal_cents, discount_pct, total_cents, status, version, idempotency_key, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    insertOrder.run('ord-101', 't-alpha', 'PT Nusantara Alpha', 100000, 10, 90000, 'SETTLED', 2, 'idem-seed-101', '2026-11-18T08:00:00Z')
    insertOrder.run('ord-102', 't-alpha', 'CV Maju Jaya', 250000, 0, 250000, 'PENDING', 1, 'idem-seed-102', '2026-11-19T07:00:00Z')
    insertOrder.run('ord-201', 't-beta', 'PT Beta Logistik', 500000, 5, 475000, 'SETTLED', 2, 'idem-seed-201', '2026-11-19T07:30:00Z')

    const insertDoc = db.prepare(`
      INSERT INTO search_docs (id, tenant_id, title, body, legal_hold, erased)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    insertDoc.run('doc-a1', 't-alpha', 'Kebijakan Refund Alpha', 'Prosedur pengembalian dana untuk pesanan tenant alpha.', 0, 0)
    insertDoc.run('doc-a2', 't-alpha', 'Arsip Audit Legal Alpha', 'Dokumen audit pajak yang berada dalam legal hold aktif.', 1, 0)
    insertDoc.run('doc-b1', 't-beta', 'Rahasia Harga Beta', 'Daftar harga khusus kontrak tenant beta (dilarang bocor ke alpha).', 0, 0)
  }

  return {
    db,
    exportJobs: new Map<string, ExportJob>(),
    processedWebhooks: new Set<string>(),
    outboxEvents: [
      { seq: 1, tenantId: 't-alpha', type: 'ORDER_SETTLED', orderId: 'ord-101' },
      { seq: 2, tenantId: 't-beta', type: 'ORDER_SETTLED', orderId: 'ord-201' },
    ],
  }
}

export function listOrdersByTenant(store: AppStore, tenantId: TenantId, status?: OrderStatus): OrderRecord[] {
  const rows = status
    ? store.db
        .prepare('SELECT * FROM orders WHERE tenant_id = ? AND status = ? ORDER BY created_at DESC')
        .all(tenantId, status)
    : store.db
        .prepare('SELECT * FROM orders WHERE tenant_id = ? ORDER BY created_at DESC')
        .all(tenantId)
  const parsed: OrderRecord[] = []
  for (const row of rows) {
    const item = readOrderRow(row)
    if (item) parsed.push(item)
  }
  return parsed
}

export function getOrderById(store: AppStore, orderId: string): OrderRecord | null {
  return readOrderRow(store.db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId))
}

export function getOrderByIdempotencyKey(store: AppStore, key: string): OrderRecord | null {
  return readOrderRow(store.db.prepare('SELECT * FROM orders WHERE idempotency_key = ?').get(key))
}

export function searchDocumentsForTenant(store: AppStore, tenantId: TenantId, query: string): SearchDocument[] {
  const pattern = `%${query.trim().toLowerCase()}%`
  // Tenant ACL + non-erased pre-filter enforced in SQL before ranking/top-K
  const rows = store.db
    .prepare(
      `SELECT * FROM search_docs
       WHERE tenant_id = ? AND erased = 0 AND (LOWER(title) LIKE ? OR LOWER(body) LIKE ?)
       ORDER BY id ASC
       LIMIT 20`,
    )
    .all(tenantId, pattern, pattern)
  const docs: SearchDocument[] = []
  for (const row of rows) {
    const doc = readSearchDocRow(row)
    if (doc) docs.push(doc)
  }
  return docs
}

export function requestDocumentErasure(
  store: AppStore,
  tenantId: TenantId,
  docId: string,
): { readonly status: 'ERASED' | 'BLOCKED_LEGAL_HOLD' | 'NOT_FOUND' } {
  const doc = readSearchDocRow(
    store.db.prepare('SELECT * FROM search_docs WHERE id = ? AND tenant_id = ?').get(docId, tenantId),
  )
  if (!doc) return { status: 'NOT_FOUND' }
  if (doc.legalHold) return { status: 'BLOCKED_LEGAL_HOLD' }

  store.db.prepare('UPDATE search_docs SET erased = 1 WHERE id = ? AND tenant_id = ?').run(docId, tenantId)
  store.db
    .prepare('INSERT INTO erasure_tombstones (doc_id, tenant_id, created_at) VALUES (?, ?, ?)')
    .run(docId, tenantId, new Date().toISOString())
  return { status: 'ERASED' }
}
