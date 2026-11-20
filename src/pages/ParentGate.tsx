import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  clearPinFailures,
  getPinLockRemainingMs,
  isPinLocked,
  PIN_GUARD,
  recordPinFailure,
} from '../security/pinGuard'
import { useApp, unlockNewSession } from '../store/AppContext'

export function ParentGate() {
  const { settings, checkPin, pinReady } = useApp()
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
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
      clearPinFailures()
      sessionStorage.setItem('soft-steps-parent-ok', '1')
      unlockNewSession()
      navigate('/parent/dashboard')
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

  const locked = lockMs > 0

  return (
    <section className="parent-gate">
      <Link to="/" className="back-link">
        ← Home
      </Link>
      <h1>Grown-up area</h1>
      <p>Enter the PIN to change settings, view progress, or unlock a new session.</p>
      <form onSubmit={onSubmit} className="pin-form">
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
        PIN is stored as a salted hash on this device (not plain text). After{' '}
        {PIN_GUARD.MAX_ATTEMPTS} wrong tries, unlock pauses briefly.
        {settings.pinIsDefault
          ? ' First-time default is still 1234 — change it in Parent tools.'
          : ' Default PIN was already changed on this device.'}
      </p>
    </section>
  )
}
