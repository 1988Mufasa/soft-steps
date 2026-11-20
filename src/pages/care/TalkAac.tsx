import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { speakText } from '../../audio/calmAudio'
import { AAC_BOARDS, boardForHour } from '../../data/aac'
import { useApp } from '../../store/AppContext'

export function TalkAac() {
  const { settings } = useApp()
  const auto = useMemo(() => boardForHour(), [])
  const [boardId, setBoardId] = useState(auto.id)
  const [spoken, setSpoken] = useState<string[]>([])

  const board = AAC_BOARDS.find((b) => b.id === boardId) ?? auto

  return (
    <section className="care-page">
      <header className="activity-header">
        <Link to="/" className="back-link">
          ← Home
        </Link>
        <div className="activity-meta">
          <p className="eyebrow offline-tag">Offline AAC</p>
          <h1>Talk board</h1>
        </div>
        <span className="age-badge">{board.title}</span>
      </header>

      <p className="prompt">
        Words change by time of day. Works without Wi‑Fi. Tap a card to speak.
      </p>

      <div className="tool-picker wrap">
        {AAC_BOARDS.map((b) => (
          <button
            key={b.id}
            type="button"
            className={`chip ${boardId === b.id ? 'is-active' : ''}`}
            onClick={() => setBoardId(b.id)}
          >
            {b.title}
          </button>
        ))}
      </div>

      <div className="aac-grid">
        {board.cards.map((card) => (
          <button
            key={card.id}
            type="button"
            className="aac-card"
            onClick={() => {
              speakText(card.label, settings.sensory.soundOn)
              setSpoken((s) => [...s.slice(-6), card.label])
            }}
          >
            <span className="aac-emoji" aria-hidden="true">
              {card.emoji}
            </span>
            <span>{card.label}</span>
          </button>
        ))}
      </div>

      <div className="aac-strip" aria-live="polite">
        {spoken.length ? spoken.join(' · ') : 'Your message appears here.'}
        {spoken.length ? (
          <button type="button" className="btn btn-ghost" onClick={() => setSpoken([])}>
            Clear
          </button>
        ) : null}
      </div>

      <p className="fine-print">
        Location-based boards are demo-ready later; time-of-day boards work fully offline now.
      </p>
    </section>
  )
}
