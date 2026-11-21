import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  clearPinFailures,
  getPinLockRemainingMs,
  isPinLocked,
  PIN_GUARD,
  recordPinFailure,
} from '../security/pinGuard'
import { openParentSession } from '../security/parentSession'
import { useApp } from '../store/AppContext'

type Props = {
  onUnlock: () => void
  onCancel?: () => void
  title?: string
}

/** PIN gate for sensitive grown-up surfaces (routine builder, etc.). */
export function ParentLock({ onUnlock, onCancel, title = 'Grown-up unlock' }: Props) {
  const { checkPin, pinReady, settings } = useApp()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [lockMs, setLockMs] = useState(() => getPinLockRemainingMs())

  useEffect(() => {
    if (lockMs <= 0) return
    const id = window.setInterval(() => setLockMs(getPinLockRemainingMs()), 500)
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
      openParentSession()
      setPin('')
      onUnlock()
      return
    }
    const result = recordPinFailure()
    setPin('')
    if (result.locked) {
      setLockMs(result.remainingMs)
      setError(`Too many tries. Locked for ${Math.ceil(result.remainingMs / 1000)} seconds.`)
    } else {
      setError('That PIN did not match. Try again.')
    }
  }

  const locked = lockMs > 0

  return (
    <div className="parent-lock">
      <h1>{title}</h1>
      <p>Enter the grown-up PIN to continue. Math shortcuts are disabled for stronger security.</p>
      <form onSubmit={(e) => void onSubmit(e)} className="pin-form">
        <label htmlFor="builder-pin">PIN</label>
        <input
          id="builder-pin"
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
          className="pin-input"
        />
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" className="btn btn-primary" disabled={locked || !pinReady || busy}>
          {busy ? 'Checking…' : locked ? `Wait ${Math.ceil(lockMs / 1000)}s` : 'Unlock'}
        </button>
        {onCancel ? (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </form>
      <p className="fine-print">
        After {PIN_GUARD.MAX_ATTEMPTS} wrong tries, unlock pauses (longer if repeated).
        {settings.pinIsDefault ? ' Default PIN is still 1234 — change it in Grown-ups.' : ''}
      </p>
    </div>
  )
}

export function LockedGate({
  unlocked,
  onUnlock,
  onCancel,
  children,
}: {
  unlocked: boolean
  onUnlock: () => void
  onCancel?: () => void
  children: ReactNode
}) {
  if (!unlocked) {
    return <ParentLock onUnlock={onUnlock} onCancel={onCancel} />
  }
  return <>{children}</>
}
