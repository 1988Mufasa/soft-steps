import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp, unlockNewSession } from '../store/AppContext'
import type {
  AgeBand,
  CareModuleId,
  InterestTheme,
  ModuleId,
  OnlineActivityId,
} from '../types'
import { DEFAULT_INTEREST_CHECKLIST, SAMPLE_STORIES } from '../types'

const MODULE_LABELS: { id: ModuleId; label: string }[] = [
  { id: 'abc', label: 'ABCs' },
  { id: 'shapes', label: 'Shapes' },
  { id: 'colors', label: 'Colors' },
  { id: 'numbers', label: 'Numbers' },
]

const CARE_LABELS: { id: CareModuleId; label: string }[] = [
  { id: 'calm', label: 'Calm toolkit / Meltdown Mode' },
  { id: 'feelings', label: 'Feelings check-in' },
  { id: 'schedule', label: 'First / Then routines' },
  { id: 'stories', label: 'Social stories' },
  { id: 'talk', label: 'Talk board (AAC)' },
  { id: 'friends', label: 'Social cues' },
  { id: 'interest', label: 'Interest rewards' },
]

const ONLINE_LABELS: { id: OnlineActivityId; label: string }[] = [
  { id: 'mix-quiz', label: 'Mix quiz' },
  { id: 'gentle-timer', label: 'Gentle timer' },
  { id: 'multi-match', label: 'Multi-step match' },
  { id: 'sync-demo', label: 'Progress sync demo' },
]

const INTERESTS: { id: InterestTheme; label: string }[] = [
  { id: 'trains', label: 'Trains' },
  { id: 'dinosaurs', label: 'Dinosaurs' },
  { id: 'animals', label: 'Animals' },
  { id: 'space', label: 'Space' },
  { id: 'patterns', label: 'Math patterns' },
]

export function ParentDashboard() {
  const navigate = useNavigate()
  const {
    settings,
    progress,
    updateSettings,
    setEnabledModule,
    setEnabledCareModule,
    setEnabledOnlineActivity,
    resetProgress,
    changePin,
  } = useApp()
  const [newPin, setNewPin] = useState('')
  const [saved, setSaved] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('soft-steps-parent-ok') !== '1') {
      navigate('/parent', { replace: true })
    }
  }, [navigate])

  const onSavePin = async (e: FormEvent) => {
    e.preventDefault()
    if (newPin.length < 4) {
      setSaved('PIN needs at least 4 digits.')
      return
    }
    await changePin(newPin)
    setNewPin('')
    setSaved('PIN updated and stored as a salted hash on this device.')
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
        </article>

        <article className="dash-card">
          <h2>Practice modules</h2>
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
        </article>

        <article className="dash-card">
          <h2>Care & routines</h2>
          <ul className="module-toggles">
            {CARE_LABELS.map((m) => (
              <li key={m.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.enabledCareModules[m.id]}
                    onChange={(e) => setEnabledCareModule(m.id, e.target.checked)}
                  />
                  {m.label}
                </label>
              </li>
            ))}
          </ul>
        </article>

        <article className="dash-card">
          <h2>Online features</h2>
          <label className="check-line">
            <input
              type="checkbox"
              checked={settings.onlineExtrasEnabled}
              onChange={(e) => updateSettings({ onlineExtrasEnabled: e.target.checked })}
            />
            Enable all online extras
          </label>
          <ul className="module-toggles">
            {ONLINE_LABELS.map((a) => (
              <li key={a.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.enabledOnlineActivities[a.id]}
                    disabled={!settings.onlineExtrasEnabled}
                    onChange={(e) => setEnabledOnlineActivity(a.id, e.target.checked)}
                  />
                  {a.label}
                </label>
              </li>
            ))}
          </ul>
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
            Soft sound / voice
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
          <label className="check-line">
            <input
              type="checkbox"
              checked={settings.sensory.dimColors}
              onChange={(e) =>
                updateSettings({ sensory: { ...settings.sensory, dimColors: e.target.checked } })
              }
            />
            Dim colors
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={settings.sensory.disableSuddenAnimations}
              onChange={(e) =>
                updateSettings({
                  sensory: { ...settings.sensory, disableSuddenAnimations: e.target.checked },
                })
              }
            />
            Disable sudden animations
          </label>
        </article>

        <article className="dash-card">
          <h2>Special interest</h2>
          <div className="toggle-row wrap">
            {INTERESTS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`chip ${settings.interestTheme === t.id ? 'is-active' : ''}`}
                onClick={() => {
                  updateSettings({
                    interestTheme: t.id,
                    interestChecklist: DEFAULT_INTEREST_CHECKLIST.map((c) => ({ ...c })),
                  })
                  setSaved(`Interest set to ${t.label}.`)
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              updateSettings({
                stories: SAMPLE_STORIES.map((s) => ({
                  ...s,
                  pages: s.pages.map((p) => ({ ...p })),
                })),
              })
              setSaved('Sample social stories restored.')
            }}
          >
            Reset sample stories
          </button>
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
          <h2>Practice progress</h2>
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
              Reset practice progress…
            </button>
          ) : (
            <div className="confirm-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  resetProgress()
                  setConfirmReset(false)
                  setSaved('Practice progress cleared.')
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
          {settings.pinIsDefault ? (
            <p className="form-error">Still using the first-time default — change it now.</p>
          ) : (
            <p>PIN is hashed with PBKDF2. Soft Steps never stores the digits in plain text.</p>
          )}
          <form onSubmit={(e) => void onSavePin(e)} className="pin-form inline">
            <input
              className="pin-input"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              aria-label="New PIN"
              autoComplete="new-password"
            />
            <button type="submit" className="btn btn-secondary">
              Save PIN
            </button>
          </form>
        </article>

        <article className="dash-card security-card">
          <h2>Security & payments</h2>
          <p>
            Card numbers never touch Soft Steps. Support payments use Stripe-hosted Checkout only.
          </p>
          <Link to="/parent/billing" className="btn btn-primary">
            Open secure billing
          </Link>
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
