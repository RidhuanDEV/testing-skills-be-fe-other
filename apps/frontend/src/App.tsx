import { useEffect, useRef, useState } from 'react'
import type { ActiveTab, AsyncExportJob, OrderStatus, OrderSummary } from './types'
import { parseExportJob, parseOrderList } from './types'

const API_BASE = 'http://localhost:4000'

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('orders')
  const [token, setToken] = useState<string>('sso-alpha-admin')
  const [statusFilter, setStatusFilter] = useState<'' | OrderStatus>('')
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [exportJob, setExportJob] = useState<AsyncExportJob | null>(null)
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  const modalTriggerRef = useRef<HTMLButtonElement | null>(null)
  const modalCloseRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!modalOpen) return
    modalCloseRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModalOpen(false)
        modalTriggerRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [modalOpen])

  async function loadOrders() {
    setLoading(true)
    setErrorMsg('')
    try {
      const query = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : ''
      const res = await fetch(`${API_BASE}/api/v1/orders${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) {
        setOrders([])
        setErrorMsg('Session expired (401). Switch to SSO Session tab and re-authenticate with a valid token.')
        return
      }
      if (!res.ok) {
        setErrorMsg(`Request failed with HTTP ${res.status}.`)
        return
      }
      const data: unknown = await res.json()
      setOrders(parseOrderList(data))
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to reach backend at http://localhost:4000')
    } finally {
      setLoading(false)
    }
  }

  async function startAsyncExport() {
    setErrorMsg('')
    try {
      const res = await fetch(`${API_BASE}/api/v1/jobs/export`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) {
        setErrorMsg('Export rejected (401). Re-authenticate first.')
        return
      }
      if (res.status === 202) {
        const data: unknown = await res.json()
        setExportJob(parseExportJob(data))
        return
      }
      setErrorMsg(`Unexpected export response HTTP ${res.status}.`)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error starting export')
    }
  }

  function closeModal() {
    setModalOpen(false)
    modalTriggerRef.current?.focus()
  }

  return (
    <div className="shell">
      <header>
        <h1>Shadow Army Ops Console</h1>
        <p className="subtitle">
          Strict-TS React fixture for API contracts, HTTP 202 pending states, accessibility checks, and SSO recovery.
        </p>
      </header>

      <nav className="tabs" role="tablist" aria-label="Console sections">
        <button
          type="button"
          role="tab"
          className="tab-btn"
          aria-selected={activeTab === 'orders'}
          onClick={() => setActiveTab('orders')}
        >
          Orders &amp; Async 202 Export
        </button>
        <button
          type="button"
          role="tab"
          className="tab-btn"
          aria-selected={activeTab === 'a11y-lab'}
          onClick={() => setActiveTab('a11y-lab')}
        >
          Accessibility &amp; Focus Lab
        </button>
        <button
          type="button"
          role="tab"
          className="tab-btn"
          aria-selected={activeTab === 'sso-session'}
          onClick={() => setActiveTab('sso-session')}
        >
          SSO Session Recovery
        </button>
      </nav>

      <main>
        {activeTab === 'orders' && (
          <section className="panel" aria-labelledby="orders-heading">
            <h2 id="orders-heading">Tenant Orders</h2>
            <div className="row">
              <div className="field">
                <label htmlFor="status-filter">Order status filter</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === '' || val === 'PENDING' || val === 'SETTLED' || val === 'CANCELLED') {
                      setStatusFilter(val)
                    }
                  }}
                >
                  <option value="">All statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="SETTLED">SETTLED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <button type="button" className="btn btn-primary" onClick={() => void loadOrders()} disabled={loading}>
                {loading ? 'Loading orders...' : 'Load Orders'}
              </button>
              <button type="button" className="btn" onClick={() => void startAsyncExport()}>
                Queue CSV Export (HTTP 202)
              </button>
            </div>

            {exportJob && (
              <p role="status" aria-live="polite">
                Export job <code>{exportJob.jobId}</code> is{' '}
                <span className="badge badge-warn">{exportJob.status}</span> — accepted (HTTP 202), waiting for worker
                completion.
              </p>
            )}

            {errorMsg && (
              <div role="alert" className="alert-error">
                {errorMsg}
              </div>
            )}

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Order ID</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Total (cents)</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={4}>No orders loaded yet. Click Load Orders with backend running on port 4000.</td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord.id}>
                        <td>{ord.id}</td>
                        <td>{ord.customerName}</td>
                        <td>{ord.totalCents}</td>
                        <td>
                          <span className="badge badge-ok">{ord.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'a11y-lab' && (
          <>
            <section className="panel" aria-labelledby="a11y-good-heading">
              <h2 id="a11y-good-heading">Accessible Reference Form &amp; Dialog</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                }}
              >
                <div className="row">
                  <div className="field">
                    <label htmlFor="contact-email">Work email</label>
                    <input id="contact-email" type="email" autoComplete="email" required />
                  </div>
                  <button
                    ref={modalTriggerRef}
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setModalOpen(true)}
                  >
                    Open Confirmation Dialog
                  </button>
                </div>
              </form>
            </section>

            {/* Deliberate seeded defect for Scenario 09 (C04): placeholder-only inputs with no programmatic label */}
            <section className="panel" aria-labelledby="a11y-legacy-heading">
              <h2 id="a11y-legacy-heading">Legacy Form Fixture (Intentional A11y Defect)</h2>
              <p className="subtitle">
                Intentionally omits labels on inputs so accessibility audit skills must flag and fix them.
              </p>
              <div className="row">
                <input type="text" placeholder="Enter invoice number" />
                <input type="text" placeholder="Enter billing PIC" />
              </div>
            </section>
          </>
        )}

        {activeTab === 'sso-session' && (
          <section className="panel" aria-labelledby="sso-heading">
            <h2 id="sso-heading">Mandatory Tenant SSO Token Selector</h2>
            <p className="subtitle">
              Role and tenant are always resolved server-side via <code>ridhuan-sso-client</code>. Select an expired or
              valid test token to verify 401 recovery.
            </p>
            <div className="row">
              <div className="field">
                <label htmlFor="sso-token-select">Active test Bearer token</label>
                <select id="sso-token-select" value={token} onChange={(e) => setToken(e.target.value)}>
                  <option value="sso-alpha-admin">sso-alpha-admin (t-alpha / admin)</option>
                  <option value="sso-alpha-viewer">sso-alpha-viewer (t-alpha / viewer)</option>
                  <option value="sso-beta-admin">sso-beta-admin (t-beta / admin)</option>
                  <option value="expired-invalid-token">expired-invalid-token (triggers 401)</option>
                </select>
              </div>
            </div>
          </section>
        )}
      </main>

      {modalOpen && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <h3 id="modal-title">Confirm Action</h3>
            <p>Press Escape or click Close to verify focus returns cleanly to the trigger button.</p>
            <button ref={modalCloseRef} type="button" className="btn btn-primary" onClick={closeModal}>
              Close Dialog
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
