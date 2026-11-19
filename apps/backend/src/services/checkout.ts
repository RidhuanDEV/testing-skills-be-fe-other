import type { AppStore } from '../db.js'
import { getOrderById, getOrderByIdempotencyKey } from '../db.js'
import type { CheckoutInput, OrderRecord, TenantId, WebhookEventPayload } from '../types.js'

export function calculateDiscountedTotalCents(subtotalCents: number, discountPct: number): number {
  const rawDiscount = (subtotalCents * discountPct) / 100
  const roundedDiscount = Math.floor(rawDiscount + 0.5)
  return Math.max(0, subtotalCents - roundedDiscount)
}

export function createOrderIdempotently(
  store: AppStore,
  tenantId: TenantId,
  input: CheckoutInput,
): { readonly created: boolean; readonly order: OrderRecord } {
  const existing = getOrderByIdempotencyKey(store, input.idempotencyKey)
  if (existing) {
    return { created: false, order: existing }
  }

  const totalCents = calculateDiscountedTotalCents(input.subtotalCents, input.discountPct)
  const createdAt = new Date().toISOString()

  store.db
    .prepare(
      `INSERT INTO orders (id, tenant_id, customer_name, subtotal_cents, discount_pct, total_cents, status, version, idempotency_key, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING', 1, ?, ?)`,
    )
    .run(
      input.orderId,
      tenantId,
      input.customerName,
      input.subtotalCents,
      input.discountPct,
      totalCents,
      input.idempotencyKey,
      createdAt,
    )

  // Emit outbox event strictly AFTER DB commit (E09 invariant)
  store.outboxEvents.push({
    seq: store.outboxEvents.length + 1,
    tenantId,
    type: 'ORDER_CREATED',
    orderId: input.orderId,
  })

  const createdOrder = getOrderById(store, input.orderId)
  if (!createdOrder) {
    throw new Error('Failed to load newly inserted order')
  }
  return { created: true, order: createdOrder }
}

export function applyPaymentWebhook(
  store: AppStore,
  payload: WebhookEventPayload,
): { readonly result: 'APPLIED' | 'DUPLICATE_IGNORED' | 'STALE_IGNORED' | 'NOT_FOUND'; readonly order: OrderRecord | null } {
  if (store.processedWebhooks.has(payload.eventId)) {
    return { result: 'DUPLICATE_IGNORED', order: getOrderById(store, payload.orderId) }
  }

  const order = getOrderById(store, payload.orderId)
  if (!order) {
    return { result: 'NOT_FOUND', order: null }
  }

  if (payload.eventSeq <= order.version) {
    store.processedWebhooks.add(payload.eventId)
    return { result: 'STALE_IGNORED', order }
  }

  store.db
    .prepare('UPDATE orders SET status = ?, version = ? WHERE id = ?')
    .run(payload.nextStatus, payload.eventSeq, payload.orderId)
  store.processedWebhooks.add(payload.eventId)

  store.outboxEvents.push({
    seq: store.outboxEvents.length + 1,
    tenantId: order.tenantId,
    type: `ORDER_${payload.nextStatus}`,
    orderId: order.id,
  })

  return { result: 'APPLIED', order: getOrderById(store, payload.orderId) }
}
