import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { speakAacButton, speakAacSentence, speakAboutMe } from '../../audio/aacSpeech'
import { AacBoardLock } from '../../components/AacBoardLock'
import {
  FITZGERALD_COLORS,
  buttonsForCategory,
  coreButtonsInViewport,
  fringeCategories,
  gridColumns,
  gridRows,
  layoutMeta,
  resolveAacVisual,
  type AacButton,
  type AacPrefs,
} from '../../data/aacPresets'
import { useAacTouch } from '../../hooks/useAacTouch'
import { useApp } from '../../store/AppContext'
import { isParentSessionValid } from '../../security/parentSession'
import { AacSetup } from './AacSetup'

/**
 * Age-adaptive AAC communicator — fixed motor-planning slots,
 * core on main screen, fringe folders as the child grows.
 * Optional Lock-to-board hides Home/Edit until a grown-up holds the padlock.
 */
export function TalkAac() {
  const navigate = useNavigate()
  const { settings, updateSettings } = useApp()
  const library = settings.aacLibrary
  const prefs = library.prefs
  const locked = prefs.boardLocked
  const fringe = useMemo(() => fringeCategories(library), [library])
  const coreButtons = useMemo(() => coreButtonsInViewport(library), [library])

  const [folderId, setFolderId] = useState<string | null>(null)
  const [message, setMessage] = useState<AacButton[]>([])
  const [editHold, setEditHold] = useState(0)
  const editTimer = useRef<number | null>(null)
  const editTick = useRef<number | null>(null)

  const needsSetup = !prefs.setupComplete

  const folderButtons = useMemo(
    () => (folderId ? buttonsForCategory(library, folderId) : []),
    [library, folderId],
  )
  const activeFolder = fringe.find((c) => c.id === folderId)

  // Trap browser back while locked (Home/Edit controls are already hidden)
  useEffect(() => {
    if (!locked) return
    const onPop = () => {
      window.history.pushState(null, '', window.location.href)
    }
    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [locked])

  const setBoardLocked = (boardLocked: boolean) => {
    updateSettings({
      aacLibrary: {
        ...library,
        prefs: { ...library.prefs, boardLocked },
      },
    })
  }

  const activate = (btn: AacButton) => {
    if (prefs.speakOnTap || prefs.audioLabels) {
      speakAacButton(btn, settings.sensory.soundOn, prefs)
    }
    if (prefs.messageBar) setMessage((m) => [...m, btn].slice(-16))
  }

  const speakMessage = () => {
    if (!message.length) return
    speakAacSentence(message, settings.sensory.soundOn, prefs)
  }

  const meta = layoutMeta(prefs.gridLayout)
  const cols = gridColumns(prefs.gridLayout)
  const rows = gridRows(prefs.gridLayout)

  const clearEditHold = () => {
    if (editTimer.current != null) window.clearTimeout(editTimer.current)
    if (editTick.current != null) window.clearInterval(editTick.current)
    editTimer.current = null
    editTick.current = null
    setEditHold(0)
  }

  const startEditHold = () => {
    if (locked) return
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

  if (needsSetup && isParentSessionValid() && !locked) {
    return (
      <section className="care-page aac-comm">
        <header className="activity-header">
          <Link to="/" className="back-link">
            ← Home
          </Link>
          <div className="activity-meta">
            <p className="eyebrow offline-tag">AAC setup</p>
            <h1>Talk</h1>
          </div>
        </header>
        <AacSetup />
      </section>
    )
  }

  return (
    <section
      className={`care-page aac-comm stage-${prefs.stage} ${prefs.highContrast ? 'is-contrast' : ''} ${
        locked ? 'is-board-locked' : ''
      }`}
    >
      <AacBoardLock
        locked={locked}
        onLock={() => setBoardLocked(true)}
        onUnlock={() => setBoardLocked(false)}
      />

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
                {prefs.stage === 'starter'
                  ? 'Tap Want, Help, More…'
                  : 'I + want + water… tap words, then tap here to speak'}
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

      {!locked ? (
        <header className="activity-header">
          <Link to="/" className="back-link">
            ← Home
          </Link>
          <div className="activity-meta">
            <p className="eyebrow offline-tag">
              AAC · {meta.label} · {prefs.ageRange}
            </p>
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
      ) : null}

      {!locked && needsSetup ? (
        <p className="aac-setup-hint" role="status">
          Grown-ups: hold <strong>Edit</strong> for 3 seconds to pick an age-recommended grid.
          Tap the padlock for Adult Communication Lock.
        </p>
      ) : null}

      {!locked && prefs.aboutMeEnabled ? (
        <button
          type="button"
          className="aac-about-me"
          onClick={() => speakAboutMe(prefs.aboutMeText, settings.sensory.soundOn, prefs)}
          aria-label="About me — emergency info"
        >
          <span aria-hidden="true">ℹ️</span> About me
        </button>
      ) : null}

      <div className="aac-board-shell">
        <div className="aac-core-panel">
          <p className="aac-section-label">Core words · fixed spots</p>
          <div
            className={`aac-core-grid layout-${prefs.gridLayout} ${prefs.largeButtons ? 'is-large' : ''}`}
            style={
              {
                '--aac-cols': cols,
                '--aac-rows': rows,
              } as CSSProperties
            }
            role="list"
            aria-label="Core communication board"
          >
            {coreButtons.map((btn) => (
              <AacWordButton
                key={btn.id}
                btn={btn}
                prefs={prefs}
                onActivate={() => activate(btn)}
                absolute
              />
            ))}
          </div>
        </div>

        {prefs.showFolders && fringe.length > 0 ? (
          <aside className="aac-folder-panel" aria-label="Category folders">
            <p className="aac-section-label">Folders</p>
            <nav className="aac-cat-tabs aac-folder-tabs">
              {fringe.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`chip ${folderId === c.id ? 'is-active' : ''}`}
                  onClick={() => setFolderId((id) => (id === c.id ? null : c.id))}
                >
                  <span aria-hidden="true">{c.emoji}</span> {c.title}
                </button>
              ))}
            </nav>
            {folderId ? (
              <div
                className={`aac-comm-grid cols-${Math.min(cols, 3)} ${prefs.largeButtons ? 'is-large' : ''}`}
                role="list"
                aria-label={`${activeFolder?.title ?? 'Folder'} words`}
              >
                {folderButtons.map((btn) => (
                  <AacWordButton
                    key={btn.id}
                    btn={btn}
                    prefs={prefs}
                    onActivate={() => activate(btn)}
                  />
                ))}
                {folderButtons.length === 0 ? (
                  <p className="empty-note">No words in this folder yet.</p>
                ) : null}
              </div>
            ) : (
              <p className="fine-print">Open a folder for more words. Core stays put on the left.</p>
            )}
          </aside>
        ) : null}
      </div>

      {!locked ? (
        <p className="fine-print aac-motor-note">
          Positions never shuffle by use. Tap the padlock for Adult Communication Lock (hides Home
          &amp; Edit). Grown-ups unlock with a 4-second hold, then PIN or spelled numbers.
        </p>
      ) : null}
    </section>
  )
}

function AacWordButton({
  btn,
  prefs,
  onActivate,
  absolute,
}: {
  btn: AacButton
  prefs: AacPrefs
  onActivate: () => void
  absolute?: boolean
}) {
  const visual = resolveAacVisual(btn, prefs.displayMode)
  const touch = useAacTouch({
    delayMs: prefs.touchDelayMs,
    trigger: prefs.touchTrigger,
    animations: prefs.buttonAnimations,
    onActivate,
  })
  const colors = FITZGERALD_COLORS[btn.partOfSpeech]
  const style: CSSProperties = {
    ...(prefs.colorCoding
      ? {
          background: colors.bg,
          borderColor: colors.border,
          borderWidth: 3,
          borderStyle: 'solid',
        }
      : {}),
    ...(absolute && typeof btn.row === 'number' && typeof btn.col === 'number'
      ? {
          gridRow: btn.row + 1,
          gridColumn: btn.col + 1,
        }
      : {}),
  }

  return (
    <button
      type="button"
      className={`aac-comm-card ${touch.className} ${prefs.highContrast ? 'is-contrast' : ''}`}
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
      {prefs.showLabels || prefs.audioLabels ? (
        <span className="aac-comm-label">{btn.label}</span>
      ) : null}
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
