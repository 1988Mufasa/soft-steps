import { useMemo, useState, type FormEvent } from 'react'
import { useApp } from '../store/AppContext'

const WORD: Record<string, string> = {
  '0': 'Zero',
  '1': 'One',
  '2': 'Two',
  '3': 'Three',
  '4': 'Four',
  '5': 'Five',
  '6': 'Six',
  '7': 'Seven',
  '8': 'Eight',
  '9': 'Nine',
}

function randomDigits(n = 3) {
  let out = ''
  for (let i = 0; i < n; i++) out += String(Math.floor(Math.random() * 10))
  return out
}

type Mode = 'pin' | 'words'

type Props = {
  onVerified: () => void
  onCancel: () => void
}

/**
 * Adult verification after the padlock hold — grown-up PIN or spelled-out numbers.
 * Kids rarely complete both the 4s hold and this prompt by accident.
 */
export function AdultUnlockGate({ onVerified, onCancel }: Props) {
  const { checkPin, pinReady } = useApp()
  const [mode, setMode] = useState<Mode>('pin')
  const challenge = useMemo(() => randomDigits(3), [])
  const [pin, setPin] = useState('')
  const [wordsAnswer, setWordsAnswer] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const wordsPrompt = challenge
    .split('')
    .map((d) => WORD[d])
    .join(' - ')

  const submitPin = async (e: FormEvent) => {
    e.preventDefault()
    if (!pinReady || busy) return
    setBusy(true)
    const ok = await checkPin(pin)
    setBusy(false)
    if (ok) {
      onVerified()
      return
    }
    setPin('')
    setError('That PIN did not match. Try again.')
  }

  const submitWords = (e: FormEvent) => {
    e.preventDefault()
    const digits = wordsAnswer.replace(/\D/g, '')
    if (digits === challenge) {
      onVerified()
      return
    }
    setWordsAnswer('')
    setError('Those numbers did not match. Try again.')
  }

  return (
    <div className="adult-gate-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="adult-gate-modal dash-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="adult-gate-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="adult-gate-title">Adult unlock</h2>
        <p className="fine-print">
          Hold finished. Confirm you’re a grown-up to unlock the communication board.
        </p>

        <div className="toggle-row wrap">
          <button
            type="button"
            className={`chip ${mode === 'pin' ? 'is-active' : ''}`}
            onClick={() => {
              setMode('pin')
              setError('')
            }}
          >
            Grown-up PIN
          </button>
          <button
            type="button"
            className={`chip ${mode === 'words' ? 'is-active' : ''}`}
            onClick={() => {
              setMode('words')
              setError('')
            }}
          >
            Spelled numbers
          </button>
        </div>

        {mode === 'pin' ? (
          <form onSubmit={(e) => void submitPin(e)} className="pin-form">
            <label htmlFor="adult-unlock-pin">PIN</label>
            <input
              id="adult-unlock-pin"
              className="pin-input"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              disabled={busy || !pinReady}
              autoComplete="off"
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ''))
                setError('')
              }}
            />
            {error ? <p className="form-error">{error}</p> : null}
            <div className="confirm-row">
              <button type="submit" className="btn btn-primary" disabled={busy || !pinReady}>
                {busy ? 'Checking…' : 'Unlock board'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={submitWords} className="pin-form">
            <p className="adult-gate-words" aria-live="polite">
              Enter the numbers: <strong>{wordsPrompt}</strong>
            </p>
            <label htmlFor="adult-unlock-words">Digits</label>
            <input
              id="adult-unlock-words"
              className="pin-input"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={3}
              value={wordsAnswer}
              autoComplete="off"
              placeholder="e.g. 472"
              onChange={(e) => {
                setWordsAnswer(e.target.value.replace(/\D/g, ''))
                setError('')
              }}
            />
            {error ? <p className="form-error">{error}</p> : null}
            <div className="confirm-row">
              <button type="submit" className="btn btn-primary">
                Unlock board
              </button>
              <button type="button" className="btn btn-ghost" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
