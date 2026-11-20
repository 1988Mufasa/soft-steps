import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  openCheckoutUrl,
  startSecureCheckout,
  type CheckoutPlan,
} from '../security/payments'

/**
 * Billing UI — Soft Steps never shows card inputs.
 * Payment details are entered only on Stripe Checkout.
 */
export function ParentBilling() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState<CheckoutPlan | null>(null)

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
          <li>Soft Steps never asks for card numbers, CVV, or bank details.</li>
          <li>Checkout opens on Stripe’s secure page (PCI DSS SAQ A).</li>
          <li>Our API only creates a Checkout Session — it never stores PAN/CVV.</li>
          <li>Webhook events are signature-verified; secrets stay on the server.</li>
        </ul>
      </article>

      <div className="dash-grid">
        <article className="dash-card">
          <h2>One-time support</h2>
          <p>Thank-you contribution. Card entry happens on Stripe, not here.</p>
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy !== null}
            onClick={() => void checkout('supporter-once')}
          >
            {busy === 'supporter-once' ? 'Starting…' : 'Continue to Stripe'}
          </button>
        </article>
        <article className="dash-card">
          <h2>Monthly support</h2>
          <p>Optional subscription. Cancel anytime in Stripe’s customer portal later.</p>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={busy !== null}
            onClick={() => void checkout('supporter-month')}
          >
            {busy === 'supporter-month' ? 'Starting…' : 'Continue to Stripe'}
          </button>
        </article>
      </div>

      {status ? <p className="form-error security-status">{status}</p> : null}
    </section>
  )
}
