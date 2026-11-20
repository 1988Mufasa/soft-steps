import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SCHEDULE_LIBRARY } from '../../data/aac'
import { useApp } from '../../store/AppContext'
import type { ScheduleSlot } from '../../types'

export function ScheduleBoardPage() {
  const { settings, updateSettings } = useApp()
  const [editing, setEditing] = useState<'first' | 'then' | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(settings.schedule.timerSeconds)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    setSecondsLeft(settings.schedule.timerSeconds)
    setRunning(false)
  }, [settings.schedule.timerSeconds])

  useEffect(() => {
    if (!running) return
    if (secondsLeft <= 0) {
      setRunning(false)
      return
    }
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(id)
  }, [running, secondsLeft])

  const pick = (slot: ScheduleSlot) => {
    if (!editing) return
    updateSettings({
      schedule: {
        ...settings.schedule,
        [editing]: slot,
      },
    })
    setEditing(null)
  }

  const onUpload = (which: 'first' | 'then', file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const current = settings.schedule[which] ?? {
        id: 'custom',
        label: 'Photo',
        emoji: '📷',
      }
      updateSettings({
        schedule: {
          ...settings.schedule,
          [which]: { ...current, photoDataUrl: String(reader.result), label: current.label || 'Photo' },
        },
      })
    }
    reader.readAsDataURL(file)
  }

  const total = settings.schedule.timerSeconds || 1
  const pct = Math.max(0, (secondsLeft / total) * 100)

  return (
    <section className="care-page">
      <header className="activity-header">
        <Link to="/" className="back-link">
          ← Home
        </Link>
        <div className="activity-meta">
          <p className="eyebrow offline-tag">Offline</p>
          <h1>First / Then</h1>
        </div>
        <span className="age-badge">Schedule</span>
      </header>

      <div className="first-then">
        {(['first', 'then'] as const).map((key) => {
          const slot = settings.schedule[key]
          return (
            <button
              key={key}
              type="button"
              className="ft-card"
              onClick={() => setEditing(key)}
              aria-label={`Edit ${key}`}
            >
              <span className="ft-label">{key === 'first' ? 'First' : 'Then'}</span>
              {slot?.photoDataUrl ? (
                <img src={slot.photoDataUrl} alt="" className="ft-photo" />
              ) : (
                <span className="ft-emoji">{slot?.emoji ?? '➕'}</span>
              )}
              <span className="ft-title">{slot?.label ?? 'Choose'}</span>
            </button>
          )
        })}
      </div>

      <div className="timer-panel">
        <div
          className="pie-timer"
          style={{
            background: `conic-gradient(var(--accent) ${pct * 3.6}deg, rgba(74,99,90,0.15) 0)`,
          }}
          aria-label={`${secondsLeft} seconds left`}
        >
          <div className="pie-hole">{secondsLeft}s</div>
        </div>
        <div className="confirm-row">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setSecondsLeft(settings.schedule.timerSeconds)
              setRunning(true)
            }}
          >
            Start visual timer
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setRunning(false)}>
            Pause
          </button>
        </div>
        <div className="tool-picker wrap">
          {[30, 60, 120, 300].map((s) => (
            <button
              key={s}
              type="button"
              className={`chip ${settings.schedule.timerSeconds === s ? 'is-active' : ''}`}
              onClick={() => {
                updateSettings({ schedule: { ...settings.schedule, timerSeconds: s } })
                setSecondsLeft(s)
                setRunning(false)
              }}
            >
              {s < 60 ? `${s}s` : `${s / 60}m`}
            </button>
          ))}
        </div>
      </div>

      {editing ? (
        <div className="online-panel">
          <h2>Choose {editing}</h2>
          <div className="aac-grid compact">
            {SCHEDULE_LIBRARY.map((item) => (
              <button
                key={item.id}
                type="button"
                className="aac-card"
                onClick={() => pick({ ...item })}
              >
                <span className="aac-emoji">{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <label className="upload-line">
            Add a real photo (stays on this device)
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => onUpload(editing, e.target.files?.[0] ?? null)}
            />
          </label>
          <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
            Cancel
          </button>
        </div>
      ) : null}
    </section>
  )
}
