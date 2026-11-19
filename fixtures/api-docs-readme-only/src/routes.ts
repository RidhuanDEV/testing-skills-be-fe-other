export interface InvoiceDraftInput {
  readonly customerId: string
  readonly amountCents: number
  readonly currency: 'IDR' | 'USD'
}

export interface InvoiceRecord extends InvoiceDraftInput {
  readonly id: string
  readonly status: 'DRAFT' | 'VOID'
}

export const BILLING_ROUTES = [
  { method: 'GET', path: '/health' },
  { method: 'GET', path: '/invoices' },
  { method: 'POST', path: '/invoices' },
  { method: 'POST', path: '/invoices/:id/void' },
] as const
