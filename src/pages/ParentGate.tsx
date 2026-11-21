import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  clearPinFailures,
  getPinLockRemainingMs,
  isPinLocked,
  PIN_GUARD,
  recordPinFailure,
} from '../security/pinGuard'
import { openParentSession } from '../security/parentSession'
import { useApp, unlockNewSession } from '../store/AppContext'
import { DEFAULT_PIN } from '../types'

type Step = 'enter' | 'must-change'

export function ParentGate() {
  const { settings, checkPin, changePin, pinReady } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('enter')
  const [pin, setPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [lockMs, setLockMs] = useState(() => getPinLockRemainingMs())

  useEffect(() => {
    if (lockMs <= 0) return
    const id = window.setInterval(() => {
      const left = getPinLockRemainingMs()
      setLockMs(left)
    }, 500)
    return () => window.clearInterval(id)
  }, [lockMs])

  const finishUnlock = () => {
    clearPinFailures()
    openParentSession()
    unlockNewSession()
    navigate('/parent/dashboard')
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!pinReady || busy) return
    if (isPinLocked()) {
      setLockMs(getPinLockRemainingMs())
      setError('Too many tries. Wait a moment, then try again.')
      return
    }

    setBusy(true)
    const ok = await checkPin(pin)
    setBusy(false)

    if (ok) {
      setPin('')
      // First Grown-ups visit with starter PIN: must set a new one before tools open
      if (settings.pinIsDefault) {
        setStep('must-change')
        setError('')
        return
      }
      finishUnlock()
      return
    }

    const result = recordPinFailure()
    setPin('')
    if (result.locked) {
      setLockMs(result.remainingMs)
      setError(
        `Too many tries. Locked for ${Math.ceil(result.remainingMs / 1000)} seconds.`,
      )
    } else {
      setError('That PIN did not match. Try again.')
    }
  }

  const onChangeDefault = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    if (newPin.length < 4) {
      setError('New PIN needs at least 4 digits.')
      return
    }
    if (newPin === DEFAULT_PIN) {
      setError(`Choose a PIN other than the starter ${DEFAULT_PIN}.`)
      return
    }
    if (confirmPin !== newPin) {
      setError('PIN and confirm do not match.')
      return
    }
    setBusy(true)
    await changePin(newPin)
    setBusy(false)
    setNewPin('')
    setConfirmPin('')
    finishUnlock()
  }

  const locked = lockMs > 0

  if (step === 'must-change') {
    return (
      <section className="parent-gate">
        <Link to="/" className="back-link">
          ← Home
        </Link>
        <h1>Set your PIN</h1>
        <p>
          Starter PIN <strong>{DEFAULT_PIN}</strong> worked. Choose a new 4–6 digit PIN before Grown-ups
          tools open. This is required on the first visit.
        </p>
        <form onSubmit={(e) => void onChangeDefault(e)} className="pin-form">
          <label htmlFor="new-pin">New PIN</label>
          <input
            id="new-pin"
            className="pin-input"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={newPin}
            disabled={busy}
            onChange={(e) => {
              setNewPin(e.target.value.replace(/\D/g, ''))
              setError('')
            }}
            autoComplete="new-password"
            autoFocus
          />
          <label htmlFor="confirm-pin">Confirm PIN</label>
          <input
            id="confirm-pin"
            className="pin-input"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={confirmPin}
            disabled={busy}
            onChange={(e) => {
              setConfirmPin(e.target.value.replace(/\D/g, ''))
              setError('')
            }}
            autoComplete="new-password"
          />
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save PIN & continue'}
          </button>
        </form>
        <p className="fine-print">
          Soft Steps stores a salted hash only — never the digits in plain text.
        </p>
      </section>
    )
  }

  return (
    <section className="parent-gate">
      <Link to="/" className="back-link">
        ← Home
      </Link>
      <h1>Grown-up area</h1>
      <p>Enter the PIN to change settings, view progress, or unlock a new session.</p>
      {settings.pinIsDefault ? (
        <p className="form-error" role="status">
          First visit: after <strong>{DEFAULT_PIN}</strong>, you’ll set a new PIN before tools open.
        </p>
      ) : null}
      <form onSubmit={(e) => void onSubmit(e)} className="pin-form">
        <label htmlFor="pin">PIN</label>
        <input
          id="pin"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={pin}
          disabled={locked || !pinReady || busy}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ''))
            setError('')
          }}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="pin-input"
        />
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" className="btn btn-primary" disabled={locked || !pinReady || busy}>
          {busy ? 'Checking…' : locked ? `Wait ${Math.ceil(lockMs / 1000)}s` : 'Unlock'}
        </button>
      </form>
      <p className="fine-print">
        PIN is stored as a salted PBKDF2 hash on this device (not plain text). Unlock lasts 15
        minutes max, or 5 minutes idle. After {PIN_GUARD.MAX_ATTEMPTS} wrong tries, unlock pauses
        (longer if repeated the same day).
        {settings.pinIsDefault
          ? ` First-time starter is ${DEFAULT_PIN} — you must replace it after unlock.`
          : ' Default PIN was already changed on this device.'}
      </p>
    </section>
  )
}
