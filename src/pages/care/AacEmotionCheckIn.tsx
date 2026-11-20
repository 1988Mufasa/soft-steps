import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { speakText } from '../../audio/calmAudio'
import {
  BODY_STRENGTH_LABELS,
  buildCheckInSentence,
  CHECKIN_BODY,
  CHECKIN_FEELINGS,
  CHECKIN_NEEDS,
  saveCheckIn,
  type SavedCheckIn,
} from '../../data/checkIn'
import { useApp } from '../../store/AppContext'

type Step = 'body' | 'feeling' | 'need' | 'done'

const SUGGEST_PATH: Record<string, { path: string; title: string }> = {
  meltdown: { path: '/meltdown', title: 'Quiet calm' },
  calm: { path: '/calm', title: 'Calm toolkit' },
  talk: { path: '/talk', title: 'Talk board' },
  schedule: { path: '/schedule', title: 'First / Then' },
}

export function AacEmotionCheckIn() {
  const { settings } = useApp()
  const soundOn = settings.sensory.soundOn
  const [step, setStep] = useState<Step>('body')
  const [bodyId, setBodyId] = useState(CHECKIN_BODY[0].id)
  const [bodyLevel, setBodyLevel] = useState(2)
  const [feelingId, setFeelingId] = useState('okay')
  const [needId, setNeedId] = useState(CHECKIN_NEEDS[0].id)
  const [message, setMessage] = useState<string[]>([])
  const [saved, setSaved] = useState<SavedCheckIn | null>(null)

  const feelings = useMemo(
    () => CHECKIN_FEELINGS.filter((f) => f.ages.includes(settings.ageBand)),
    [settings.ageBand],
  )

  const body = CHECKIN_BODY.find((b) => b.id === bodyId) ?? CHECKIN_BODY[0]
  const feeling = feelings.find((f) => f.id === feelingId) ?? feelings[0] ?? CHECKIN_FEELINGS[0]
  const need = CHECKIN_NEEDS.find((n) => n.id === needId) ?? CHECKIN_NEEDS[0]
  const strength = BODY_STRENGTH_LABELS[bodyLevel] || 'medium'

  const pushSpeak = (text: string) => {
    speakText(text, soundOn)
    setMessage((m) => [...m.slice(-5), text])
  }

  const sentence = buildCheckInSentence({
    feelingSpeak: feeling.speak,
    bodySpeak: body.speak,
    strength,
    needSpeak: need.speak,
  })

  const finish = () => {
    const entry: SavedCheckIn = {
      at: new Date().toISOString(),
      feelingId: feeling.id,
      feelingLabel: feeling.label,
      bodyId: body.id,
      bodyLabel: body.label,
      bodyLevel,
      needId: need.id,
      needLabel: need.label,
      sentence,
    }
    saveCheckIn(entry)
    setSaved(entry)
    speakText(sentence, soundOn)
    setMessage([sentence])
    setStep('done')
  }

  const reset = () => {
    setStep('body')
    setMessage([])
    setSaved(null)
    setBodyLevel(2)
    setFeelingId(feelings[0]?.id ?? 'okay')
    setNeedId(CHECKIN_NEEDS[0].id)
  }

  const suggest = need.suggest ? SUGGEST_PATH[need.suggest] : null

  return (
    <section className="care-page checkin-page">
      <header className="activity-header">
        <Link to="/" className="back-link">
          ← Home
        </Link>
        <div className="activity-meta">
          <p className="eyebrow offline-tag">Offline AAC</p>
          <h1>Check-in</h1>
        </div>
        <span className="age-badge">Ages {settings.ageBand}</span>
      </header>

      <p className="prompt">
        AAC communication + emotion check-in. Tap cards to speak. Works without Wi‑Fi.
      </p>

      <ol className="checkin-steps" aria-label="Check-in steps">
        <li className={step === 'body' ? 'is-current' : 'is-done'}>Body</li>
        <li
          className={
            step === 'feeling' ? 'is-current' : step === 'body' ? '' : 'is-done'
          }
        >
          Feeling
        </li>
        <li
          className={
            step === 'need' ? 'is-current' : step === 'done' ? 'is-done' : ''
          }
        >
          Need
        </li>
        <li className={step === 'done' ? 'is-current' : ''}>Share</li>
      </ol>

      {step === 'body' ? (
        <div className="checkin-panel">
          <h2>1. Where do you feel it?</h2>
          <div className="aac-grid">
            {CHECKIN_BODY.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`aac-card ${bodyId === b.id ? 'is-selected' : ''}`}
                onClick={() => {
                  setBodyId(b.id)
                  pushSpeak(b.speak)
                }}
              >
                <span className="aac-emoji" aria-hidden="true">
                  {b.emoji}
                </span>
                <span>{b.label}</span>
              </button>
            ))}
          </div>
          <label className="slider-block">
            <span>How strong? ({strength})</span>
            <input
              type="range"
              min={1}
              max={5}
              value={bodyLevel}
              onChange={(e) => setBodyLevel(Number(e.target.value))}
            />
          </label>
          <button type="button" className="btn btn-primary" onClick={() => setStep('feeling')}>
            Next: feeling
          </button>
        </div>
      ) : null}

      {step === 'feeling' ? (
        <div className="checkin-panel">
          <h2>2. How do you feel?</h2>
          <div className="feeling-face" style={{ borderColor: feeling.color }}>
            <span className="feeling-emoji">{feeling.emoji}</span>
            <strong>{feeling.label}</strong>
          </div>
          <div className="aac-grid compact">
            {feelings.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`aac-card ${feelingId === f.id ? 'is-selected' : ''}`}
                onClick={() => {
                  setFeelingId(f.id)
                  pushSpeak(f.speak)
                }}
              >
                <span className="aac-emoji" aria-hidden="true">
                  {f.emoji}
                </span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>
          <div className="confirm-row">
            <button type="button" className="btn btn-ghost" onClick={() => setStep('body')}>
              Back
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setStep('need')}>
              Next: what I need
            </button>
          </div>
        </div>
      ) : null}

      {step === 'need' ? (
        <div className="checkin-panel">
          <h2>3. What do you need?</h2>
          <div className="aac-grid">
            {CHECKIN_NEEDS.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`aac-card ${needId === n.id ? 'is-selected' : ''}`}
                onClick={() => {
                  setNeedId(n.id)
                  pushSpeak(n.speak)
                }}
              >
                <span className="aac-emoji" aria-hidden="true">
                  {n.emoji}
                </span>
                <span>{n.label}</span>
              </button>
            ))}
          </div>
          <div className="confirm-row">
            <button type="button" className="btn btn-ghost" onClick={() => setStep('feeling')}>
              Back
            </button>
            <button type="button" className="btn btn-primary" onClick={finish}>
              Speak my check-in
            </button>
          </div>
        </div>
      ) : null}

      {step === 'done' && saved ? (
        <div className="checkin-panel">
          <h2>Your check-in</h2>
          <article className="checkin-summary" style={{ borderColor: feeling.color }}>
            <p className="checkin-summary-emojis" aria-hidden="true">
              {body.emoji} {feeling.emoji} {need.emoji}
            </p>
            <p className="checkin-summary-text">{saved.sentence}</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => speakText(saved.sentence, soundOn)}
            >
              Say it again
            </button>
          </article>

          {suggest ? (
            <Link to={suggest.path} className="online-card coping-card">
              <div>
                <strong>Suggested: {suggest.title}</strong>
                <p>A gentle next step for this feeling.</p>
              </div>
              <span className="chev">→</span>
            </Link>
          ) : null}

          <div className="confirm-row">
            <Link to="/talk" className="btn btn-secondary">
              Open talk board
            </Link>
            <button type="button" className="btn btn-primary" onClick={reset}>
              New check-in
            </button>
          </div>
        </div>
      ) : null}

      <div className="aac-strip" aria-live="polite">
        {message.length ? message.join(' · ') : 'Taps appear here as you speak.'}
        {message.length ? (
          <button type="button" className="btn btn-ghost" onClick={() => setMessage([])}>
            Clear
          </button>
        ) : null}
      </div>

      <p className="fine-print">
        Also available: separate Feelings and Talk board tools from Home. Check-ins save on this
        device for grown-ups to review later.
      </p>
    </section>
  )
}
