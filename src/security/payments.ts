/**
 * Payment client — Soft Steps NEVER collects or stores card numbers, CVV, or bank details.
 * Cards are entered only on Stripe-hosted Checkout (PCI SAQ A).
 */

export type CheckoutPlan = 'supporter-once' | 'supporter-month'

export type CheckoutResult =
  | { ok: true; url: string; mode: 'stripe' | 'demo' }
  | { ok: false; error: string }

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') || ''

/** Reject any accidental attempt to send card fields from this app. */
export function assertNoCardPayload(body: Record<string, unknown>) {
  const banned = [
    'card',
    'cardNumber',
    'number',
    'cvv',
    'cvc',
    'exp',
    'expiry',
    'pan',
    'account_number',
    'routing',
  ]
  for (const key of Object.keys(body)) {
    if (banned.some((b) => key.toLowerCase().includes(b.toLowerCase()))) {
      throw new Error('Card data must never be sent to Soft Steps servers.')
    }
  }
}

export async function startSecureCheckout(plan: CheckoutPlan): Promise<CheckoutResult> {
  const payload = { plan }
  assertNoCardPayload(payload)

  const endpoint = `${API_BASE}/api/checkout/session`
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'omit',
    })

    const data = (await res.json().catch(() => ({}))) as {
      url?: string
      mode?: 'stripe' | 'demo'
      error?: string
    }

    if (!res.ok || !data.url) {
      return {
        ok: false,
        error:
          data.error ||
          'Checkout is unavailable. Start the secure API server or set Stripe keys.',
      }
    }

    return { ok: true, url: data.url, mode: data.mode || 'stripe' }
  } catch {
    return {
      ok: false,
      error:
        'Could not reach the secure payment API. Run `npm run server` and set STRIPE keys for live checkout.',
    }
  }
}

export function openCheckoutUrl(url: string) {
  // Prefer top-level navigation so Stripe hosts the card form, not Soft Steps.
  window.location.assign(url)
}
