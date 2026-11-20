import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp, unlockNewSession } from '../store/AppContext'
import { DEFAULT_PIN } from '../types'

export function ParentGate() {
  const { settings } = useApp()
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (pin === settings.pin) {
      sessionStorage.setItem('soft-steps-parent-ok', '1')
      unlockNewSession()
      navigate('/parent/dashboard')
      return
    }
    setError('That PIN did not match. Try again.')
    setPin('')
  }

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
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ''))
            setError('')
          }}
          autoComplete="off"
          className="pin-input"
        />
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" className="btn btn-primary">
          Unlock
        </button>
      </form>
      <p className="fine-print">Default PIN is {DEFAULT_PIN} until you change it.</p>
    </section>
  )
}
