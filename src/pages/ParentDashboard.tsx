import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp, unlockNewSession } from '../store/AppContext'
import type { AgeBand, ModuleId } from '../types'

const MODULE_LABELS: { id: ModuleId; label: string }[] = [
  { id: 'abc', label: 'ABCs' },
  { id: 'shapes', label: 'Shapes' },
  { id: 'colors', label: 'Colors' },
  { id: 'numbers', label: 'Numbers' },
]

export function ParentDashboard() {
  const navigate = useNavigate()
  const {
    settings,
    progress,
    updateSettings,
    setEnabledModule,
    resetProgress,
    changePin,
  } = useApp()
  const [newPin, setNewPin] = useState(settings.pin)
  const [saved, setSaved] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('soft-steps-parent-ok') !== '1') {
      navigate('/parent', { replace: true })
    }
  }, [navigate])

  const onSavePin = (e: FormEvent) => {
    e.preventDefault()
    if (newPin.length < 4) {
      setSaved('PIN needs at least 4 digits.')
      return
    }
    changePin(newPin)
    setSaved('PIN updated.')
  }

  return (
    <section className="parent-dash">
      <header className="activity-header">
        <Link to="/" className="back-link">
          ← Home
        </Link>
        <div className="activity-meta">
          <p className="eyebrow">Parent / Teacher</p>
          <h1>Controls</h1>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            sessionStorage.removeItem('soft-steps-parent-ok')
            navigate('/')
          }}
        >
          Lock
        </button>
      </header>

      <div className="dash-grid">
        <article className="dash-card">
          <h2>Age band & difficulty</h2>
          <div className="toggle-row">
            {(['3-6', '7-12'] as AgeBand[]).map((band) => (
              <button
                key={band}
                type="button"
                className={`chip ${settings.ageBand === band ? 'is-active' : ''}`}
                onClick={() => {
                  updateSettings({ ageBand: band })
                  setSaved(`Age band set to ${band}.`)
                }}
              >
                Ages {band}
              </button>
            ))}
          </div>
          <p className="fine-print">
            3–6 uses fewer choices and simpler prompts. 7–12 adds more options and word cues.
          </p>
        </article>

        <article className="dash-card">
          <h2>Modules</h2>
          <ul className="module-toggles">
            {MODULE_LABELS.map((m) => (
              <li key={m.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.enabledModules[m.id]}
                    onChange={(e) => setEnabledModule(m.id, e.target.checked)}
                  />
                  {m.label}
                </label>
              </li>
            ))}
          </ul>
          <label className="check-line">
            <input
              type="checkbox"
              checked={settings.onlineExtrasEnabled}
              onChange={(e) => updateSettings({ onlineExtrasEnabled: e.target.checked })}
            />
            Enable online extras
          </label>
        </article>

        <article className="dash-card">
          <h2>Sensory preferences</h2>
          <label className="check-line">
            <input
              type="checkbox"
              checked={settings.sensory.soundOn}
              onChange={(e) =>
                updateSettings({ sensory: { ...settings.sensory, soundOn: e.target.checked } })
              }
            />
            Soft sound feedback
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={settings.sensory.reducedMotion}
              onChange={(e) =>
                updateSettings({
                  sensory: { ...settings.sensory, reducedMotion: e.target.checked },
                })
              }
            />
            Reduced motion
          </label>
        </article>

        <article className="dash-card">
          <h2>Session limit</h2>
          <div className="toggle-row wrap">
            {[null, 10, 15, 20].map((mins) => (
              <button
                key={String(mins)}
                type="button"
                className={`chip ${settings.sessionLimitMinutes === mins ? 'is-active' : ''}`}
                onClick={() => {
                  updateSettings({ sessionLimitMinutes: mins })
                  unlockNewSession()
                  setSaved(mins ? `Session limit ${mins} minutes.` : 'Session limit cleared.')
                }}
              >
                {mins ? `${mins} min` : 'No limit'}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              unlockNewSession()
              setSaved('New session started.')
            }}
          >
            Start new session now
          </button>
        </article>

        <article className="dash-card">
          <h2>Progress</h2>
          <ul className="progress-list">
            {MODULE_LABELS.map((m) => {
              const p = progress[m.id]
              const rate = p.attempts ? Math.round((p.correct / p.attempts) * 100) : 0
              return (
                <li key={m.id}>
                  <strong>{m.label}</strong>
                  <span>
                    {p.correct}/{p.attempts} correct ({rate}%) · best streak {p.bestStreak}
                  </span>
                </li>
              )
            })}
          </ul>
          {!confirmReset ? (
            <button type="button" className="btn btn-ghost" onClick={() => setConfirmReset(true)}>
              Reset progress…
            </button>
          ) : (
            <div className="confirm-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  resetProgress()
                  setConfirmReset(false)
                  setSaved('Progress cleared.')
                }}
              >
                Yes, reset
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </div>
          )}
        </article>

        <article className="dash-card">
          <h2>Change PIN</h2>
          <form onSubmit={onSavePin} className="pin-form inline">
            <input
              className="pin-input"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              aria-label="New PIN"
            />
            <button type="submit" className="btn btn-secondary">
              Save PIN
            </button>
          </form>
        </article>
      </div>

      {saved ? (
        <p className="save-toast" role="status">
          {saved}
        </p>
      ) : null}
    </section>
  )
}
