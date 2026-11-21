import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PurchaseCodeGate } from '../components/PurchaseCodeGate'
import { useParentSessionGuard } from '../hooks/useParentSessionGuard'
import { clearParentSession } from '../security/parentSession'
import {
  openCheckoutUrl,
  startSecureCheckout,
  type CheckoutPlan,
} from '../security/payments'
import { useApp } from '../store/AppContext'

/**
 * Billing UI — Soft Steps never shows card inputs.
 * Payment details are entered only on Stripe Checkout.
 * Purchases require Wi‑Fi / network — Checkout cannot start offline.
 * Every purchase first requires a visible 4-digit grown-up code.
 */
export function ParentBilling() {
  const navigate = useNavigate()
  const { online } = useApp()
  const { remainingMs } = useParentSessionGuard()
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState<CheckoutPlan | null>(null)
  const [pendingPlan, setPendingPlan] = useState<CheckoutPlan | null>(null)

  useEffect(() => {
    if (!online) {
      setPendingPlan(null)
      setBusy(null)
    }
  }, [online])

  const checkout = async (plan: CheckoutPlan) => {
    if (!navigator.onLine) {
      setPendingPlan(null)
      setStatus('Purchase needs Wi‑Fi. Connect to the internet, then try again.')
      return
    }
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
    if (!navigator.onLine) {
      setStatus('Purchase needs Wi‑Fi. Connect to the internet, then try again.')
      return
    }
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
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            clearParentSession()
            navigate('/')
          }}
        >
          Lock
        </button>
      </header>

      <p className="fine-print">
        Grown-up session · {Math.ceil(remainingMs / 60_000)} min left ·{' '}
        <span className={`net-badge ${online ? 'is-online' : 'is-offline'}`}>
          {online ? 'Online' : 'Offline'}
        </span>
      </p>

      <aside className={`video-wifi-banner ${online ? 'is-online' : 'is-offline'}`} role="status">
        {online
          ? 'Wi‑Fi connected — purchases can continue to Stripe Checkout.'
          : 'Wi‑Fi required — purchases can only be made while online.'}
      </aside>

      <article className="dash-card security-card">
        <h2>How your payment stays safe</h2>
        <ul className="security-list">
          <li>Purchases need a Wi‑Fi (or mobile data) connection — Checkout cannot start offline.</li>
          <li>Before every purchase, Soft Steps shows 4 random numbers you must type in.</li>
          <li>Soft Steps never asks for card numbers, CVV, or bank details.</li>
          <li>Checkout opens on Stripe’s secure page (PCI DSS SAQ A).</li>
          <li>Our API only creates a Checkout Session — it never stores PAN/CVV.</li>
        </ul>
      </article>

      {!online ? (
        <article className="dash-card">
          <h2>Connect to buy</h2>
          <p>
            Soft Steps learning tools still work offline. Support purchases open Stripe Checkout and
            need Wi‑Fi.
          </p>
          <button type="button" className="btn btn-primary" disabled>
            Purchase unavailable offline
          </button>
        </article>
      ) : pendingPlan ? (
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
