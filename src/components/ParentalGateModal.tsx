import { useId, useState } from 'react'
import { createParentalChallenge, type ParentalChallenge } from '../utils/parentalGateChallenge'

type Props = {
  onVerified: () => void
  onCancel: () => void
  title?: string
  blurb?: string
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'] as const

/**
 * Kids Category / Families parental gate — randomized adult math or spelled-number
 * challenge with a large on-screen keypad. Not a static PIN or tap-hold alone.
 */
export function ParentalGateModal({
  onVerified,
  onCancel,
  title = 'Grown-up check',
  blurb = 'Answer this question so Soft Steps knows a grown-up is opening a protected tool or link.',
}: Props) {
  const titleId = useId()
  const [challenge, setChallenge] = useState<ParentalChallenge>(() => createParentalChallenge())
  const [entry, setEntry] = useState('')
  const [error, setError] = useState(false)

  const trySubmit = (digits: string) => {
    if (!digits) return
    if (digits === challenge.answer) {
      onVerified()
      return
    }
    setError(true)
    // New challenge on every incorrect attempt
    window.setTimeout(() => {
      setChallenge(createParentalChallenge())
      setEntry('')
    }, 280)
  }

  const press = (key: (typeof KEYS)[number]) => {
    if (key === 'clear') {
      setEntry('')
      setError(false)
      return
    }
    if (key === 'back') {
      setEntry((v) => v.slice(0, -1))
      setError(false)
      return
    }
    setEntry((v) => {
      const next = (v + key).slice(0, challenge.answer.length)
      if (next.length >= challenge.answer.length) {
        // Defer so UI paints the last digit
        window.setTimeout(() => trySubmit(next), 40)
      }
      return next
    })
    setError(false)
  }

  return (
    <div className="adult-gate-backdrop parental-gate-backdrop" role="presentation" onClick={onCancel}>
      <div
        className={`adult-gate-modal dash-card parental-gate-modal ${error ? 'is-error' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId}>{title}</h2>
        <p className="fine-print">{blurb}</p>

        <p className="parental-gate-prompt" aria-live="polite">
          {challenge.prompt}
        </p>

        <div
          className={`parental-gate-display ${error ? 'is-error' : ''}`}
          aria-live="polite"
          aria-label={entry ? `Entered ${entry}` : 'Answer empty'}
        >
          {entry ? entry : '· · ·'}
        </div>
        {error ? (
          <p className="form-error" role="alert">
            Not quite — try a new question.
          </p>
        ) : null}

        <div className="parental-gate-pad" role="group" aria-label="Number pad">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className={`parental-gate-key ${key === 'clear' || key === 'back' ? 'is-meta' : ''}`}
              onClick={() => press(key)}
              aria-label={
                key === 'clear' ? 'Clear' : key === 'back' ? 'Backspace' : `Digit ${key}`
              }
            >
              {key === 'clear' ? 'Clear' : key === 'back' ? '⌫' : key}
            </button>
          ))}
        </div>

        <div className="confirm-row">
          <button
            type="button"
            className="btn btn-primary"
            disabled={!entry}
            onClick={() => trySubmit(entry)}
          >
            Continue
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
