import { useMemo, useState, type FormEvent } from 'react'

type Props = {
  onVerified: () => void
  onCancel: () => void
}

function makeCode(): string {
  const digits = new Uint32Array(4)
  crypto.getRandomValues(digits)
  return Array.from(digits, (n) => String(n % 10)).join('')
}

/**
 * Grown-up purchase gate: shows 4 random digits (visible) and requires the
 * parent to type the same digits before the Stripe buyer screen opens.
 */
export function PurchaseCodeGate({ onVerified, onCancel }: Props) {
  const [code] = useState(() => makeCode())
  const [entry, setEntry] = useState('')
  const [error, setError] = useState('')

  const digits = useMemo(() => code.split(''), [code])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (entry === code) {
      onVerified()
      return
    }
    setError('Those numbers do not match. Check the code above and try again.')
    setEntry('')
  }

  return (
    <div className="purchase-code-gate" role="dialog" aria-labelledby="purchase-code-title">
      <h2 id="purchase-code-title">Grown-up check before purchase</h2>
      <p>
        Enter the 4 numbers shown below. You can see them while you type — this
        keeps little hands from opening the buyer screen by accident.
      </p>

      <div className="purchase-code-display" aria-label={`Code ${digits.join(' ')}`}>
        {digits.map((d, i) => (
          <span key={`${d}-${i}`} className="purchase-code-digit">
            {d}
          </span>
        ))}
      </div>

      <form className="pin-form" onSubmit={onSubmit}>
        <label htmlFor="purchase-code-input">Type the numbers</label>
        <input
          id="purchase-code-input"
          className="pin-input purchase-code-input"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          // Visible digits — not password masking
          type="text"
          value={entry}
          onChange={(e) => {
            setEntry(e.target.value.replace(/\D/g, '').slice(0, 4))
            setError('')
          }}
          aria-describedby="purchase-code-help"
        />
        <p id="purchase-code-help" className="fine-print">
          Numbers stay visible so parents can check as they type.
        </p>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="confirm-row">
          <button type="submit" className="btn btn-primary" disabled={entry.length !== 4}>
            Continue to buyer screen
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
