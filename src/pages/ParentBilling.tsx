import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PurchaseCodeGate } from '../components/PurchaseCodeGate'
import {
  openCheckoutUrl,
  startSecureCheckout,
  type CheckoutPlan,
} from '../security/payments'

/**
 * Billing UI — Soft Steps never shows card inputs.
 * Payment details are entered only on Stripe Checkout.
 * Every purchase first requires a visible 4-digit grown-up code.
 */
export function ParentBilling() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState<CheckoutPlan | null>(null)
  const [pendingPlan, setPendingPlan] = useState<CheckoutPlan | null>(null)

  useEffect(() => {
    if (sessionStorage.getItem('soft-steps-parent-ok') !== '1') {
      navigate('/parent', { replace: true })
    }
  }, [navigate])

  const checkout = async (plan: CheckoutPlan) => {
    setBusy(plan)
    setStatus('')
    const result = await startSecureCheckout(plan)
    setBusy(null)
    setPendingPlan(null)
    if (!result.ok) {
      setStatus(result.error)
      return
    }
    if (result.mode === 'demo') {
      setStatus(
        'Demo mode: Stripe keys are not set yet. No card was charged. Add STRIPE_SECRET_KEY on the API server for live Checkout.',
      )
      return
    }
    openCheckoutUrl(result.url)
  }

  const requestPurchase = (plan: CheckoutPlan) => {
    setStatus('')
    setPendingPlan(plan)
  }

  return (
    <section className="parent-dash">
      <header className="activity-header">
        <Link to="/parent/dashboard" className="back-link">
          ← Controls
        </Link>
        <div className="activity-meta">
          <p className="eyebrow">Secure payments</p>
          <h1>Support Soft Steps</h1>
        </div>
        <span />
      </header>

      <article className="dash-card security-card">
        <h2>How your payment stays safe</h2>
        <ul className="security-list">
          <li>Before every purchase, Soft Steps shows 4 random numbers you must type in.</li>
          <li>Soft Steps never asks for card numbers, CVV, or bank details.</li>
          <li>Checkout opens on Stripe’s secure page (PCI DSS SAQ A).</li>
          <li>Our API only creates a Checkout Session — it never stores PAN/CVV.</li>
        </ul>
      </article>

      {pendingPlan ? (
        <article className="dash-card">
          <PurchaseCodeGate
            onCancel={() => setPendingPlan(null)}
            onVerified={() => void checkout(pendingPlan)}
          />
        </article>
      ) : (
        <div className="dash-grid">
          <article className="dash-card">
            <h2>One-time support</h2>
            <p>Thank-you contribution. Card entry happens on Stripe, not here.</p>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy !== null}
              onClick={() => requestPurchase('supporter-once')}
            >
              {busy === 'supporter-once' ? 'Starting…' : 'Buy — verify grown-up first'}
            </button>
          </article>
          <article className="dash-card">
            <h2>Monthly support</h2>
            <p>Optional subscription. Cancel anytime in Stripe’s customer portal later.</p>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={busy !== null}
              onClick={() => requestPurchase('supporter-month')}
            >
              {busy === 'supporter-month' ? 'Starting…' : 'Subscribe — verify grown-up first'}
            </button>
          </article>
        </div>
      )}

      {status ? <p className="form-error security-status">{status}</p> : null}
    </section>
  )
}
