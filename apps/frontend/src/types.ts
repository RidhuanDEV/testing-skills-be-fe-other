export type OrderStatus = 'PENDING' | 'SETTLED' | 'CANCELLED'
export type ActiveTab = 'orders' | 'a11y-lab' | 'sso-session'

export interface OrderSummary {
  readonly id: string
  readonly tenantId: string
  readonly customerName: string
  readonly totalCents: number
  readonly status: OrderStatus
}

export interface AsyncExportJob {
  readonly jobId: string
  readonly status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  readonly createdAt: string
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseOrderList(raw: unknown): OrderSummary[] {
  if (!isPlainObject(raw) || !Array.isArray(raw['items'])) return []
  const items: OrderSummary[] = []
  for (const entry of raw['items']) {
    if (!isPlainObject(entry)) continue
    const { id, tenantId, customerName, totalCents, status } = entry
    if (
      typeof id === 'string' &&
      typeof tenantId === 'string' &&
      typeof customerName === 'string' &&
      typeof totalCents === 'number' &&
      (status === 'PENDING' || status === 'SETTLED' || status === 'CANCELLED')
    ) {
      items.push({ id, tenantId, customerName, totalCents, status })
    }
  }
  return items
}

export function parseExportJob(raw: unknown): AsyncExportJob | null {
  if (!isPlainObject(raw)) return null
  const { jobId, status, createdAt } = raw
  if (
    typeof jobId === 'string' &&
    typeof createdAt === 'string' &&
    (status === 'QUEUED' || status === 'PROCESSING' || status === 'COMPLETED' || status === 'FAILED')
  ) {
    return { jobId, status, createdAt }
  }
  return null
}
