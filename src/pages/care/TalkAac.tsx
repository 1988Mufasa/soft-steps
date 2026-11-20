import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { speakText } from '../../audio/calmAudio'
import { AAC_BOARDS, boardForHour } from '../../data/aac'
import { useApp } from '../../store/AppContext'

export function TalkAac() {
  const { settings, updateSettings } = useApp()
  const auto = useMemo(() => boardForHour(), [])
  const [boardId, setBoardId] = useState(auto.id)
  const [spoken, setSpoken] = useState<string[]>([])
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [emoji, setEmoji] = useState('💬')
  const [photo, setPhoto] = useState<string | undefined>()

  const board = AAC_BOARDS.find((b) => b.id === boardId) ?? auto
  const custom = settings.customAacCards

  const onPhoto = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(String(reader.result))
    reader.readAsDataURL(file)
  }

  const addCustom = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = label.trim()
    if (!trimmed) return
    updateSettings({
      customAacCards: [
        {
          id: `custom-${Date.now()}`,
          label: trimmed,
          emoji: emoji.trim() || '💬',
          photoDataUrl: photo,
        },
        ...custom,
      ].slice(0, 24),
    })
    setLabel('')
    setEmoji('💬')
    setPhoto(undefined)
    setAdding(false)
  }

  const removeCustom = (id: string) => {
    updateSettings({ customAacCards: custom.filter((c) => c.id !== id) })
  }

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
        Words change by time of day. Add your own photos &amp; phrases — works without Wi‑Fi.
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

      {custom.length > 0 ? (
        <>
          <h2 className="aac-section-title">Family phrases</h2>
          <div className="aac-grid">
            {custom.map((card) => (
              <div key={card.id} className="aac-custom-wrap">
                <button
                  type="button"
                  className="aac-card has-photo"
                  onClick={() => {
                    speakText(card.label, settings.sensory.soundOn)
                    setSpoken((s) => [...s.slice(-6), card.label])
                  }}
                >
                  {card.photoDataUrl ? (
                    <img src={card.photoDataUrl} alt="" className="aac-photo" />
                  ) : (
                    <span className="aac-emoji" aria-hidden="true">
                      {card.emoji}
                    </span>
                  )}
                  <span>{card.label}</span>
                </button>
                <button
                  type="button"
                  className="aac-remove"
                  aria-label={`Remove ${card.label}`}
                  onClick={() => removeCustom(card.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {!adding ? (
        <button type="button" className="btn btn-secondary" onClick={() => setAdding(true)}>
          Add family phrase / photo
        </button>
      ) : (
        <form className="aac-add-form" onSubmit={addCustom}>
          <label>
            Phrase
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={40}
              required
            />
          </label>
          <label>
            Emoji
            <input type="text" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={8} />
          </label>
          <label className="btn btn-ghost upload-btn">
            {photo ? 'Change photo' : 'Add photo'}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => onPhoto(e.target.files?.[0] ?? null)}
            />
          </label>
          {photo ? <img src={photo} alt="" className="aac-photo-preview" /> : null}
          <p className="fine-print">
            On a phone, this can open the camera. Photos stay on this device only.
          </p>
          <div className="confirm-row">
            <button type="submit" className="btn btn-primary">
              Save phrase
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <h2 className="aac-section-title">{board.title} board</h2>
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
    </section>
  )
}
