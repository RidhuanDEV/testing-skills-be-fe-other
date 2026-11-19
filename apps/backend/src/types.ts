export type OrderStatus = 'PENDING' | 'SETTLED' | 'CANCELLED'
export type TenantId = 't-alpha' | 't-beta'

export interface OrderRecord {
  readonly id: string
  readonly tenantId: TenantId
  readonly customerName: string
  readonly subtotalCents: number
  readonly discountPct: number
  readonly totalCents: number
  readonly status: OrderStatus
  readonly version: number
  readonly idempotencyKey: string
  readonly createdAt: string
}

export interface SearchDocument {
  readonly id: string
  readonly tenantId: TenantId
  readonly title: string
  readonly body: string
  readonly legalHold: boolean
  readonly erased: boolean
}

export interface ExportJob {
  readonly jobId: string
  readonly tenantId: TenantId
  readonly status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  readonly createdAt: string
}

export interface WebhookEventPayload {
  readonly eventId: string
  readonly orderId: string
  readonly eventSeq: number
  readonly nextStatus: OrderStatus
}

export interface CheckoutInput {
  readonly orderId: string
  readonly customerName: string
  readonly subtotalCents: number
  readonly discountPct: number
  readonly idempotencyKey: string
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return value === 'PENDING' || value === 'SETTLED' || value === 'CANCELLED'
}

export function isTenantId(value: unknown): value is TenantId {
  return value === 't-alpha' || value === 't-beta'
}

export function parseCheckoutInput(raw: unknown): CheckoutInput | null {
  if (!isRecord(raw)) return null
  const { orderId, customerName, subtotalCents, discountPct, idempotencyKey } = raw
  if (
    typeof orderId !== 'string' ||
    !orderId.trim() ||
    typeof customerName !== 'string' ||
    !customerName.trim() ||
    typeof subtotalCents !== 'number' ||
    !Number.isInteger(subtotalCents) ||
    subtotalCents < 0 ||
    typeof discountPct !== 'number' ||
    !Number.isFinite(discountPct) ||
    discountPct < 0 ||
    discountPct > 100 ||
    typeof idempotencyKey !== 'string' ||
    !idempotencyKey.trim()
  ) {
    return null
  }
  return {
    orderId: orderId.trim(),
    customerName: customerName.trim(),
    subtotalCents,
    discountPct,
    idempotencyKey: idempotencyKey.trim(),
  }
}

export function parseWebhookEventPayload(raw: unknown): WebhookEventPayload | null {
  if (!isRecord(raw)) return null
  const { eventId, orderId, eventSeq, nextStatus } = raw
  if (
    typeof eventId !== 'string' ||
    !eventId.trim() ||
    typeof orderId !== 'string' ||
    !orderId.trim() ||
    typeof eventSeq !== 'number' ||
    !Number.isInteger(eventSeq) ||
    eventSeq < 1 ||
    !isOrderStatus(nextStatus)
  ) {
    return null
  }
  return {
    eventId: eventId.trim(),
    orderId: orderId.trim(),
    eventSeq,
    nextStatus,
  }
}
