import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { speakText } from '../../audio/calmAudio'
import {
  buttonsForCategory,
  resolveAacVisual,
  visibleCategories,
  type AacButton,
} from '../../data/aacPresets'
import { useApp } from '../../store/AppContext'

/**
 * Full AAC communicator for non-verbal kids — large tap grid, message bar,
 * presets + family photos / sign images from Grown-ups editor.
 */
export function TalkAac() {
  const { settings } = useApp()
  const library = settings.aacLibrary
  const prefs = library.prefs
  const cats = useMemo(() => visibleCategories(library), [library])
  const [categoryId, setCategoryId] = useState(cats[0]?.id ?? 'core')
  const [message, setMessage] = useState<AacButton[]>([])

  const activeCat = cats.find((c) => c.id === categoryId) ?? cats[0]
  const buttons = useMemo(
    () => (activeCat ? buttonsForCategory(library, activeCat.id) : []),
    [library, activeCat],
  )

  const speakButton = (btn: AacButton) => {
    const text = (btn.speak || btn.label).trim()
    if (prefs.speakOnTap) speakText(text, settings.sensory.soundOn)
    if (prefs.messageBar) setMessage((m) => [...m, btn].slice(-12))
  }

  const speakMessage = () => {
    if (!message.length) return
    const text = message.map((b) => b.speak || b.label).join('. ')
    speakText(text, settings.sensory.soundOn)
  }

  const cols = prefs.columns
  const gridClass = `aac-comm-grid cols-${cols} ${prefs.largeButtons ? 'is-large' : ''}`

  return (
    <section className="care-page aac-comm">
      <header className="activity-header">
        <Link to="/" className="back-link">
          ← Home
        </Link>
        <div className="activity-meta">
          <p className="eyebrow offline-tag">AAC</p>
          <h1>Talk</h1>
        </div>
        <Link to="/talk/edit" className="btn btn-ghost aac-edit-link">
          Edit
        </Link>
      </header>

      <p className="prompt">
        Tap a word to speak. Grown-ups can add photos, sign pictures, and new words in Edit.
      </p>

      <nav className="aac-cat-tabs" aria-label="AAC categories">
        {cats.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`chip ${activeCat?.id === c.id ? 'is-active' : ''}`}
            onClick={() => setCategoryId(c.id)}
          >
            <span aria-hidden="true">{c.emoji}</span> {c.title}
          </button>
        ))}
      </nav>

      <div className={gridClass} role="list">
        {buttons.map((btn) => {
          const visual = resolveAacVisual(btn, prefs.displayMode)
          return (
            <button
              key={btn.id}
              type="button"
              className="aac-comm-card"
              role="listitem"
              onClick={() => speakButton(btn)}
              aria-label={btn.speak || btn.label}
            >
              {visual.src ? (
                <img
                  src={visual.src}
                  alt=""
                  className={`aac-comm-img ${visual.kind === 'sign' ? 'is-sign' : ''}`}
                />
              ) : (
                <span className="aac-comm-emoji" aria-hidden="true">
                  {visual.emoji}
                </span>
              )}
              {prefs.showLabels ? <span className="aac-comm-label">{btn.label}</span> : null}
              {visual.kind === 'sign' ? (
                <span className="aac-sign-badge" aria-hidden="true">
                  ✋
                </span>
              ) : null}
            </button>
          )
        })}
        {buttons.length === 0 ? (
          <p className="empty-note">No words in this category yet. Grown-ups can add some in Edit.</p>
        ) : null}
      </div>

      {prefs.messageBar ? (
        <div className="aac-message-bar" aria-live="polite">
          <div className="aac-message-words">
            {message.length
              ? message.map((b, i) => (
                  <span key={`${b.id}-${i}`} className="aac-message-chip">
                    {b.label}
                  </span>
                ))
              : 'Your message builds here.'}
          </div>
          <div className="aac-message-actions">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={!message.length}
              onClick={() => setMessage((m) => m.slice(0, -1))}
              aria-label="Delete last word"
            >
              ⌫
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={!message.length}
              onClick={() => setMessage([])}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!message.length}
              onClick={speakMessage}
            >
              Speak
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
