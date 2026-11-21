import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { speakAacButton, speakAacSentence, speakAboutMe } from '../../audio/aacSpeech'
import {
  FITZGERALD_COLORS,
  buttonsForCategory,
  fringeCategories,
  gridColumns,
  resolveAacVisual,
  visibleCategories,
  type AacButton,
  type AacPrefs,
} from '../../data/aacPresets'
import { useAacTouch } from '../../hooks/useAacTouch'
import { useApp } from '../../store/AppContext'

/**
 * Full AAC communicator — fixed positions, core+fringe, Fitzgerald colors,
 * sentence strip, About Me, touch accommodations.
 */
export function TalkAac() {
  const navigate = useNavigate()
  const { settings } = useApp()
  const library = settings.aacLibrary
  const prefs = library.prefs
  const allCats = useMemo(() => visibleCategories(library), [library])
  const fringe = useMemo(() => fringeCategories(library), [library])
  const coreButtons = useMemo(() => buttonsForCategory(library, 'core'), [library])

  const [categoryId, setCategoryId] = useState(() => fringe[0]?.id ?? 'core')
  const [message, setMessage] = useState<AacButton[]>([])
  const [editHold, setEditHold] = useState(0)
  const editTimer = useRef<number | null>(null)
  const editTick = useRef<number | null>(null)

  const activeCat = allCats.find((c) => c.id === categoryId) ?? allCats[0]
  const showPinnedCore = prefs.corePinned && activeCat?.id !== 'core'
  const fringeButtons = useMemo(
    () => (activeCat ? buttonsForCategory(library, activeCat.id) : []),
    [library, activeCat],
  )

  const activate = (btn: AacButton) => {
    if (prefs.speakOnTap) speakAacButton(btn, settings.sensory.soundOn, prefs)
    if (prefs.messageBar) setMessage((m) => [...m, btn].slice(-16))
  }

  const speakMessage = () => {
    if (!message.length) return
    speakAacSentence(message, settings.sensory.soundOn, prefs)
  }

  const cols = gridColumns(prefs.gridLayout)
  const gridClass = `aac-comm-grid layout-${prefs.gridLayout} cols-${cols} ${
    prefs.largeButtons ? 'is-large' : ''
  }`

  const clearEditHold = () => {
    if (editTimer.current != null) window.clearTimeout(editTimer.current)
    if (editTick.current != null) window.clearInterval(editTick.current)
    editTimer.current = null
    editTick.current = null
    setEditHold(0)
  }

  const startEditHold = () => {
    clearEditHold()
    const started = Date.now()
    editTick.current = window.setInterval(() => {
      setEditHold(Math.min(3, Math.ceil((Date.now() - started) / 1000)))
    }, 100)
    editTimer.current = window.setTimeout(() => {
      clearEditHold()
      navigate('/talk/edit')
    }, 3000)
  }

  return (
    <section className="care-page aac-comm">
      {prefs.messageBar ? (
        <div className="aac-sentence-strip" aria-label="Sentence strip">
          <button
            type="button"
            className="aac-sentence-window"
            onClick={speakMessage}
            disabled={!message.length}
            aria-label={
              message.length
                ? `Speak message: ${message.map((b) => b.label).join(' ')}`
                : 'Sentence strip empty'
            }
          >
            {message.length ? (
              message.map((b, i) => {
                const visual = resolveAacVisual(b, prefs.displayMode)
                return (
                  <span
                    key={`${b.id}-${i}`}
                    className="aac-sentence-chip"
                    style={
                      prefs.colorCoding
                        ? {
                            background: FITZGERALD_COLORS[b.partOfSpeech].bg,
                            borderColor: FITZGERALD_COLORS[b.partOfSpeech].border,
                          }
                        : undefined
                    }
                  >
                    {visual.src ? (
                      <img src={visual.src} alt="" />
                    ) : (
                      <span aria-hidden="true">{visual.emoji}</span>
                    )}
                    <em>{b.label}</em>
                  </span>
                )
              })
            ) : (
              <span className="aac-sentence-placeholder">
                I + want + water… tap words, then tap here to speak
              </span>
            )}
          </button>
          <div className="aac-sentence-actions">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={!message.length}
              onClick={() => setMessage((m) => m.slice(0, -1))}
              aria-label="Backspace — remove last word"
            >
              Backspace
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={!message.length}
              onClick={() => setMessage([])}
              aria-label="Clear all words"
            >
              Clear all
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

      <header className="activity-header">
        <Link to="/" className="back-link">
          ← Home
        </Link>
        <div className="activity-meta">
          <p className="eyebrow offline-tag">AAC · Offline</p>
          <h1>Talk</h1>
        </div>
        <button
          type="button"
          className="btn btn-ghost aac-edit-link"
          onPointerDown={startEditHold}
          onPointerUp={clearEditHold}
          onPointerLeave={clearEditHold}
          onPointerCancel={clearEditHold}
          aria-label="Hold 3 seconds to open AAC editor"
        >
          {editHold > 0 ? `Hold… ${editHold}/3` : 'Edit'}
        </button>
      </header>

      {prefs.aboutMeEnabled ? (
        <button
          type="button"
          className="aac-about-me"
          onClick={() => speakAboutMe(prefs.aboutMeText, settings.sensory.soundOn, prefs)}
          aria-label="About me — emergency info"
        >
          <span aria-hidden="true">ℹ️</span> About me
        </button>
      ) : null}

      {showPinnedCore ? (
        <div className="aac-core-pin" aria-label="Core words — always here">
          <p className="aac-section-label">Core words</p>
          <div
            className={`aac-comm-grid cols-4 is-core ${prefs.largeButtons ? 'is-large' : ''}`}
            role="list"
          >
            {coreButtons.map((btn) => (
              <AacWordButton key={btn.id} btn={btn} prefs={prefs} onActivate={() => activate(btn)} />
            ))}
          </div>
        </div>
      ) : null}

      <nav className="aac-cat-tabs" aria-label="Word folders">
        {allCats.map((c) => (
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

      <p className="aac-section-label">
        {activeCat?.id === 'core'
          ? 'Core words (fixed spots)'
          : `${activeCat?.title ?? 'Words'} folder`}
      </p>

      <div className={gridClass} role="list">
        {(activeCat?.id === 'core' ? coreButtons : fringeButtons).map((btn) => (
          <AacWordButton key={btn.id} btn={btn} prefs={prefs} onActivate={() => activate(btn)} />
        ))}
        {(activeCat?.id === 'core' ? coreButtons : fringeButtons).length === 0 ? (
          <p className="empty-note">
            No words here yet. Grown-ups can add some in Edit (hold Edit 3 seconds).
          </p>
        ) : null}
      </div>

      <p className="fine-print aac-motor-note">
        Button positions stay fixed so muscle memory can grow. Grown-ups: hold Edit → PIN to
        customize.
      </p>
    </section>
  )
}

function AacWordButton({
  btn,
  prefs,
  onActivate,
}: {
  btn: AacButton
  prefs: AacPrefs
  onActivate: () => void
}) {
  const visual = resolveAacVisual(btn, prefs.displayMode)
  const touch = useAacTouch({
    delayMs: prefs.touchDelayMs,
    trigger: prefs.touchTrigger,
    animations: prefs.buttonAnimations,
    onActivate,
  })
  const colors = FITZGERALD_COLORS[btn.partOfSpeech]
  const style: CSSProperties | undefined = prefs.colorCoding
    ? {
        background: colors.bg,
        borderColor: colors.border,
        borderWidth: 3,
        borderStyle: 'solid',
      }
    : undefined

  return (
    <button
      type="button"
      className={`aac-comm-card ${touch.className}`}
      role="listitem"
      style={style}
      aria-label={btn.speak || btn.label}
      onPointerDown={touch.onPointerDown}
      onPointerUp={touch.onPointerUp}
      onPointerCancel={touch.onPointerCancel}
      onPointerLeave={touch.onPointerLeave}
    >
      {visual.src ? (
        <img
          src={visual.src}
          alt=""
          className={`aac-comm-img ${visual.kind === 'sign' ? 'is-sign' : ''}`}
          draggable={false}
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
      {btn.audioDataUrl ? (
        <span className="aac-voice-badge" aria-hidden="true">
          🎙️
        </span>
      ) : null}
    </button>
  )
}
