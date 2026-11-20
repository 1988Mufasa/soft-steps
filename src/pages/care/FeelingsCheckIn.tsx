import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { speakText } from '../../audio/calmAudio'
import { useApp } from '../../store/AppContext'

const BODY = [
  { id: 'heart', label: 'Heart', emoji: '💗' },
  { id: 'tummy', label: 'Tummy', emoji: '🫧' },
  { id: 'hands', label: 'Hands', emoji: '✋' },
  { id: 'head', label: 'Head', emoji: '🧠' },
]

const FEELINGS = [
  { id: 'calm', label: 'Calm', emoji: '😌', color: '#7EB8A8' },
  { id: 'happy', label: 'Happy', emoji: '😊', color: '#F6E7A1' },
  { id: 'worried', label: 'Worried', emoji: '😟', color: '#C9B27A' },
  { id: 'mad', label: 'Mad', emoji: '😠', color: '#E08E6D' },
  { id: 'sad', label: 'Sad', emoji: '😢', color: '#5BA4B5' },
  { id: 'tired', label: 'Tired', emoji: '😴', color: '#A0B5AE' },
]

export function FeelingsCheckIn() {
  const { settings } = useApp()
  const [bodyLevel, setBodyLevel] = useState(2)
  const [bodyPart, setBodyPart] = useState('heart')
  const [feeling, setFeeling] = useState('calm')

  const suggestion = useMemo(() => {
    if (feeling === 'mad' || feeling === 'worried' || bodyLevel >= 4) {
      return {
        title: 'Try Quiet Mode',
        path: '/meltdown',
        blurb: 'One-tap calming tools with no words.',
      }
    }
    if (feeling === 'tired' || feeling === 'sad') {
      return {
        title: 'Calm toolkit',
        path: '/calm',
        blurb: 'Soft breathing or bubbles.',
      }
    }
    if (feeling === 'happy' || feeling === 'calm') {
      return {
        title: 'First / Then',
        path: '/schedule',
        blurb: 'See what comes next.',
      }
    }
    return {
      title: 'Talk board',
      path: '/talk',
      blurb: 'Say what you need.',
    }
  }, [feeling, bodyLevel])

  const face = FEELINGS.find((f) => f.id === feeling) ?? FEELINGS[0]

  return (
    <section className="care-page">
      <header className="activity-header">
        <Link to="/" className="back-link">
          ← Home
        </Link>
        <div className="activity-meta">
          <p className="eyebrow offline-tag">Offline</p>
          <h1>Feelings check-in</h1>
        </div>
        <span className="age-badge" aria-hidden="true">
          {face.emoji}
        </span>
      </header>

      <p className="prompt">
        How does your body feel? Then pick a matching emotion. For full AAC + needs, open{' '}
        <Link to="/check-in">AAC &amp; check-in</Link>.
      </p>

      <div className="tool-picker wrap">
        {BODY.map((b) => (
          <button
            key={b.id}
            type="button"
            className={`chip ${bodyPart === b.id ? 'is-active' : ''}`}
            onClick={() => setBodyPart(b.id)}
          >
            {b.emoji} {b.label}
          </button>
        ))}
      </div>

      <label className="slider-block">
        <span>Body signal strength</span>
        <input
          type="range"
          min={1}
          max={5}
          value={bodyLevel}
          onChange={(e) => setBodyLevel(Number(e.target.value))}
        />
        <span className="fine-print">1 soft · 5 strong</span>
      </label>

      <div className="feeling-face" style={{ borderColor: face.color }}>
        <span className="feeling-emoji">{face.emoji}</span>
        <strong>{face.label}</strong>
      </div>

      <div className="aac-grid compact">
        {FEELINGS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`aac-card ${feeling === f.id ? 'is-selected' : ''}`}
            onClick={() => {
              setFeeling(f.id)
              speakText(`I feel ${f.label}.`, settings.sensory.soundOn)
            }}
          >
            <span className="aac-emoji">{f.emoji}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      <Link to={suggestion.path} className="online-card coping-card">
        <div>
          <strong>Suggested: {suggestion.title}</strong>
          <p>{suggestion.blurb}</p>
        </div>
        <span className="chev">→</span>
      </Link>

      {!settings.sensory.soundOn ? (
        <p className="fine-print">Sound is muted in Parent tools.</p>
      ) : null}
    </section>
  )
}
