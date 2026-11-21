import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { speakAacButton, speakAacSentence, speakAboutMe } from '../../audio/aacSpeech'
import { speakText as speakCalm } from '../../audio/calmAudio'
import { AacBoardLock } from '../../components/AacBoardLock'
import { AacWordFormsPopover } from '../../components/AacWordFormsPopover'
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
import { wordFormsFor } from '../../data/aacWordForms'
import { useAacTouch } from '../../hooks/useAacTouch'
import { useApp } from '../../store/AppContext'
import { isParentSessionValid } from '../../security/parentSession'
import { AacSetup } from './AacSetup'

/**
 * Age-adaptive AAC communicator — fixed slots, mask/unmask, model mode,
 * word-forms hold, lock-to-board.
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
  const [glowId, setGlowId] = useState<string | null>(null)
  const [formsFor, setFormsFor] = useState<AacButton | null>(null)
  const editTimer = useRef<number | null>(null)
  const editTick = useRef<number | null>(null)
  const glowTimer = useRef<number | null>(null)

  const needsSetup = !prefs.setupComplete

  const folderButtons = useMemo(
    () => (folderId ? buttonsForCategory(library, folderId) : []),
    [library, folderId],
  )
  const activeFolder = fringe.find((c) => c.id === folderId)

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

  const patchPrefs = (patch: Partial<AacPrefs>) => {
    updateSettings({
      aacLibrary: {
        ...library,
        prefs: { ...library.prefs, ...patch },
      },
    })
  }

  const flashGlow = (id: string) => {
    setGlowId(id)
    if (glowTimer.current != null) window.clearTimeout(glowTimer.current)
    glowTimer.current = window.setTimeout(() => setGlowId(null), 700)
  }

  const activate = (btn: AacButton, speakOverride?: string) => {
    if (btn.masked) return
    flashGlow(btn.id)
    const spoken = (speakOverride || btn.speak || btn.label).trim()
    if (prefs.speakOnTap || prefs.audioLabels || prefs.modelMode) {
      if (speakOverride) {
        speakCalm(spoken, settings.sensory.soundOn, {
          pitch: prefs.speechPitch,
          rate: prefs.speechRate,
        })
      } else {
        speakAacButton(
          speakOverride ? { ...btn, speak: speakOverride, label: speakOverride } : btn,
          settings.sensory.soundOn,
          prefs,
        )
      }
    }
    // Model mode: highlight + speak only — do not fill the child's sentence strip
    if (prefs.modelMode) return
    if (prefs.messageBar) {
      const chip: AacButton = speakOverride
        ? { ...btn, label: speakOverride, speak: speakOverride, id: `${btn.id}-form-${speakOverride}` }
        : btn
      setMessage((m) => [...m, chip].slice(-16))
    }
  }

  const speakMessage = () => {
    if (!message.length || prefs.modelMode) return
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

  const openForms = (btn: AacButton) => {
    if (!prefs.wordFormsEnabled || locked) return
    const forms = btn.forms?.length ? btn.forms : wordFormsFor(btn.id, btn.label)
    if (forms.length <= 1) return
    setFormsFor(btn)
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
      } ${prefs.modelMode ? 'is-model-mode' : ''}`}
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
            disabled={!message.length || prefs.modelMode}
            aria-label={
              message.length
                ? `Speak message: ${message.map((b) => b.label).join(' ')}`
                : prefs.modelMode
                  ? 'Model mode — sentence strip paused'
                  : 'Sentence strip empty'
            }
          >
            {prefs.modelMode ? (
              <span className="aac-sentence-placeholder">Model mode — taps glow, strip stays clear</span>
            ) : message.length ? (
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
          {!prefs.modelMode ? (
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
          ) : null}
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
              {prefs.modelMode ? ' · Model' : ''}
            </p>
            <h1>Talk</h1>
          </div>
          <div className="aac-header-actions">
            <button
              type="button"
              className={`chip ${prefs.modelMode ? 'is-active' : ''}`}
              onClick={() => patchPrefs({ modelMode: !prefs.modelMode })}
              aria-pressed={prefs.modelMode}
              title="Modeling highlight — taps glow without filling the sentence strip"
            >
              Model
            </button>
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
          </div>
        </header>
      ) : null}

      {!locked && needsSetup ? (
        <p className="aac-setup-hint" role="status">
          Grown-ups: hold <strong>Edit</strong> for setup. Use <strong>Model</strong> while teaching.
          Mask words in Edit so slots stay put.
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
            {coreButtons.map((btn) =>
              btn.masked && prefs.showMaskedSlots ? (
                <div
                  key={btn.id}
                  className="aac-comm-card is-masked-slot"
                  style={{ gridRow: (btn.row ?? 0) + 1, gridColumn: (btn.col ?? 0) + 1 }}
                  aria-hidden="true"
                  title="Masked — reserved for later"
                />
              ) : btn.masked ? null : (
                <AacWordButton
                  key={btn.id}
                  btn={btn}
                  prefs={prefs}
                  glowing={glowId === btn.id}
                  onActivate={() => activate(btn)}
                  onLongPress={() => openForms(btn)}
                  absolute
                />
              ),
            )}
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
                    glowing={glowId === btn.id}
                    onActivate={() => activate(btn)}
                    onLongPress={() => openForms(btn)}
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
          Hold a word for grammar forms. Model mode glows without filling the strip. Mask in Edit
          keeps permanent slots empty until you unmask.
        </p>
      ) : null}

      {formsFor ? (
        <AacWordFormsPopover
          baseLabel={formsFor.label}
          anchorLabel={formsFor.label}
          forms={formsFor.forms?.length ? formsFor.forms : wordFormsFor(formsFor.id, formsFor.label)}
          onPick={(form) => {
            setFormsFor(null)
            activate(formsFor, form)
          }}
          onClose={() => setFormsFor(null)}
        />
      ) : null}
    </section>
  )
}

function AacWordButton({
  btn,
  prefs,
  onActivate,
  onLongPress,
  absolute,
  glowing,
}: {
  btn: AacButton
  prefs: AacPrefs
  onActivate: () => void
  onLongPress?: () => void
  absolute?: boolean
  glowing?: boolean
}) {
  const visual = resolveAacVisual(btn, prefs.displayMode)
  const forms = btn.forms?.length ? btn.forms : wordFormsFor(btn.id, btn.label)
  const canForms = Boolean(prefs.wordFormsEnabled && forms.length > 1 && onLongPress)
  const touch = useAacTouch({
    delayMs: prefs.touchDelayMs,
    trigger: prefs.touchTrigger,
    animations: prefs.buttonAnimations,
    onActivate,
    onLongPress: canForms ? onLongPress : undefined,
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
      className={`aac-comm-card ${touch.className} ${prefs.highContrast ? 'is-contrast' : ''} ${
        glowing ? 'is-model-glow' : ''
      }`}
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
