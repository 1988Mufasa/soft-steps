import { useEffect, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AacPhotoCapture } from '../../components/AacPhotoCapture'
import { LockedGate } from '../../components/ParentLock'
import { VoicePicker } from '../../components/VoicePicker'
import {
  AAC_BOARD_CONTEXTS,
  AAC_STAGES,
  DEFAULT_ABOUT_ME,
  DEFAULT_ATTENTION_PHRASE,
  FITZGERALD_COLORS,
  GRID_LAYOUTS,
  PRESET_CATEGORIES,
  REPEAT_COOLDOWN_OPTIONS,
  applyStageToLibrary,
  buttonsForCategoryEditor,
  type AacBoardContextId,
  type AacButton,
  type AacCategory,
  type AacDisplayMode,
  type AacGridLayout,
  type AacLibrary,
  type AacPartOfSpeech,
  type AacPrefs,
  type AacStage,
} from '../../data/aacPresets'
import { QUICK_TALK_PACKS, packToStrip, parseQuickTalkList } from '../../data/aacQuickTalk'
import { isParentSessionValid } from '../../security/parentSession'
import { useApp } from '../../store/AppContext'
import {
  downloadAacBoard,
  libraryFromAacBoardFile,
  parseAacBoardFile,
} from '../../utils/aacBoardTransfer'
import { readPhotoAsDataUrl } from '../../utils/imageFile'
import { AacSetup } from './AacSetup'

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`
}

const POS_OPTIONS: { id: AacPartOfSpeech; label: string }[] = [
  { id: 'pronoun', label: 'Yellow · people / pronouns' },
  { id: 'verb', label: 'Green · verbs / actions' },
  { id: 'noun', label: 'Orange · nouns' },
  { id: 'adjective', label: 'Blue · feelings / adjectives' },
  { id: 'social', label: 'Pink–purple · social / quick responses' },
  { id: 'misc', label: 'Gray · other' },
]

/**
 * Grown-up AAC editor — parents, SLPs, educators customize the board.
 * PIN-gated so kids cannot erase vocabulary.
 */
export function AacEditor() {
  const navigate = useNavigate()
  const { settings, updateSettings } = useApp()
  const [unlocked, setUnlocked] = useState(() => isParentSessionValid())
  const library = settings.aacLibrary
  const [categoryId, setCategoryId] = useState(library.categories[0]?.id ?? 'core')
  const [editing, setEditing] = useState<AacButton | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [draftLabel, setDraftLabel] = useState('')
  const [draftSpeak, setDraftSpeak] = useState('')
  const [draftEmoji, setDraftEmoji] = useState('💬')
  const [draftCat, setDraftCat] = useState(categoryId)
  const [draftPos, setDraftPos] = useState<AacPartOfSpeech>('noun')
  const [draftPhoto, setDraftPhoto] = useState<string | undefined>()
  const [draftSign, setDraftSign] = useState<string | undefined>()
  const [draftAudio, setDraftAudio] = useState<string | undefined>()
  const [draftBoardContext, setDraftBoardContext] = useState<AacBoardContextId | 'both'>('both')
  const [recording, setRecording] = useState(false)
  const [photoCapture, setPhotoCapture] = useState<'photo' | 'sign' | null>(null)
  const [qtCustomTitle, setQtCustomTitle] = useState('Today’s lesson')
  const [qtCustomList, setQtCustomList] = useState('')
  const [msg, setMsg] = useState('')
  const [photoError, setPhotoError] = useState('')
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

  useEffect(() => {
    return () => {
      mediaRecorder.current?.stream.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const saveLibrary = (next: AacLibrary) => {
    updateSettings({
      aacLibrary: next,
      customAacCards: next.buttons
        .filter((b) => b.source === 'custom')
        .map((b) => ({
          id: b.id,
          label: b.label,
          emoji: b.emoji,
          photoDataUrl: b.photoDataUrl,
        })),
    })
  }

  const updatePrefs = (patch: Partial<AacPrefs>) => {
    saveLibrary({ ...library, prefs: { ...library.prefs, ...patch } })
    setMsg('Preferences saved.')
  }

  const buttonsInCat = buttonsForCategoryEditor(library, categoryId)

  const openNew = () => {
    setEditing(null)
    setDraftLabel('')
    setDraftSpeak('')
    setDraftEmoji('💬')
    setDraftCat(categoryId === 'core' ? 'family' : categoryId)
    setDraftPos('noun')
    setDraftPhoto(undefined)
    setDraftSign(undefined)
    setDraftAudio(undefined)
    setDraftBoardContext(library.prefs.activeBoardContext)
    setPhotoError('')
    setShowForm(true)
  }

  const openEdit = (btn: AacButton) => {
    setEditing(btn)
    setDraftLabel(btn.label)
    setDraftSpeak(btn.speak || '')
    setDraftEmoji(btn.emoji)
    setDraftCat(btn.categoryId)
    setDraftPos(btn.partOfSpeech)
    setDraftPhoto(btn.photoDataUrl)
    setDraftSign(btn.signPhotoDataUrl)
    setDraftAudio(btn.audioDataUrl)
    setDraftBoardContext(
      btn.categoryId === 'core' ? 'both' : (btn.boardContext ?? 'both'),
    )
    setPhotoError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
    setDraftLabel('')
    setDraftPhoto(undefined)
    setDraftSign(undefined)
    setDraftAudio(undefined)
    setPhotoCapture(null)
    stopRecording()
  }

  const onImage = (kind: 'photo' | 'sign', file: File | null) => {
    if (!file) return
    void readPhotoAsDataUrl(file).then((result) => {
      if (!result.ok) {
        setPhotoError(result.error)
        return
      }
      setPhotoError('')
      if (kind === 'photo') setDraftPhoto(result.dataUrl)
      else setDraftSign(result.dataUrl)
    })
  }

  const stopRecording = () => {
    try {
      mediaRecorder.current?.stop()
    } catch {
      /* ignore */
    }
    mediaRecorder.current?.stream.getTracks().forEach((t) => t.stop())
    mediaRecorder.current = null
    setRecording(false)
  }

  const startRecording = async () => {
    setPhotoError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunks.current = []
      const rec = new MediaRecorder(stream)
      mediaRecorder.current = rec
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data)
      }
      rec.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onloadend = () => {
          if (typeof reader.result === 'string') setDraftAudio(reader.result)
        }
        reader.readAsDataURL(blob)
        stream.getTracks().forEach((t) => t.stop())
        setRecording(false)
      }
      rec.start()
      setRecording(true)
      setMsg('Recording… release the mic when done.')
    } catch {
      setPhotoError('Microphone permission needed to record a voice clip.')
    }
  }

  const onMicPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    void startRecording()
  }

  const onMicPointerUp = () => {
    if (recording) stopRecording()
  }

  const saveButton = (e: FormEvent) => {
    e.preventDefault()
    const label = draftLabel.trim()
    if (!label) {
      setMsg('Add a word or phrase.')
      return
    }
    if (editing) {
      const buttons = library.buttons.map((b) =>
        b.id === editing.id
          ? {
              ...b,
              label,
              speak: draftSpeak.trim() || undefined,
              emoji: draftEmoji.trim() || '💬',
              categoryId: draftCat,
              partOfSpeech: draftPos,
              photoDataUrl: draftPhoto,
              signPhotoDataUrl: draftSign,
              audioDataUrl: draftAudio,
              boardContext: draftCat === 'core' ? 'both' : draftBoardContext,
            }
          : b,
      )
      saveLibrary({ ...library, buttons })
      setMsg(`Updated “${label}”.`)
    } else {
      const btn: AacButton = {
        id: newId('aac'),
        label,
        speak: draftSpeak.trim() || undefined,
        emoji: draftEmoji.trim() || '💬',
        categoryId: draftCat,
        partOfSpeech: draftPos,
        photoDataUrl: draftPhoto,
        signPhotoDataUrl: draftSign,
        audioDataUrl: draftAudio,
        boardContext: draftCat === 'core' ? 'both' : draftBoardContext,
        order: library.buttons.filter((b) => b.categoryId === draftCat).length,
        source: 'custom',
      }
      saveLibrary({ ...library, buttons: [...library.buttons, btn] })
      setMsg(`Added “${label}”.`)
      setCategoryId(draftCat)
    }
    closeForm()
  }

  const toggleMasked = (id: string) => {
    saveLibrary({
      ...library,
      buttons: library.buttons.map((b) => (b.id === id ? { ...b, masked: !b.masked } : b)),
    })
    setMsg('Mask updated — slot stays put for muscle memory.')
  }

  const exportBoard = () => {
    downloadAacBoard(library)
    setMsg('AAC board file downloaded — AirDrop or share with home devices.')
  }

  const importBoard = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        const board = parseAacBoardFile(parsed)
        if (!board) {
          setMsg('That file is not a Soft Steps AAC board.')
          return
        }
        saveLibrary(libraryFromAacBoardFile(board))
        setMsg('Board imported — layout, masks, and media applied.')
      } catch {
        setMsg('Could not read that board file.')
      }
    }
    reader.readAsText(file)
  }

  const removeCustom = (id: string) => {
    const btn = library.buttons.find((b) => b.id === id)
    if (!btn || btn.source !== 'custom') {
      setMsg('Preset words can be hidden, not deleted.')
      return
    }
    saveLibrary({ ...library, buttons: library.buttons.filter((b) => b.id !== id) })
    setMsg('Removed custom word.')
  }

  const addCategory = () => {
    const title = window.prompt('New category name')
    if (!title?.trim()) return
    const cat: AacCategory = {
      id: newId('cat'),
      title: title.trim(),
      emoji: '📁',
      order: library.categories.length,
      source: 'custom',
    }
    saveLibrary({ ...library, categories: [...library.categories, cat] })
    setCategoryId(cat.id)
    setMsg(`Category “${cat.title}” added.`)
  }

  return (
    <section className="care-page aac-editor">
      <LockedGate
        unlocked={unlocked}
        onUnlock={() => setUnlocked(true)}
        onCancel={() => navigate('/talk')}
      >
        <header className="activity-header">
          <Link to="/talk" className="back-link">
            ← Talk
          </Link>
          <div className="activity-meta">
            <p className="eyebrow">Parents · SLPs · Educators</p>
            <h1>AAC editor</h1>
          </div>
          <button type="button" className="btn btn-ghost" onClick={() => setUnlocked(false)}>
            Lock
          </button>
        </header>

        <p className="prompt">
          Customize words, real photos, sign pictures, and voice clips. Positions stay fixed for
          motor planning — Soft Steps never rearranges by how often a word is tapped. Grow the age
          stage when your child is ready; earlier words keep their exact cells.
        </p>

        <article className="dash-card">
          <h2>Grow with your child</h2>
          <p className="fine-print">
            Current: {AAC_STAGES.find((s) => s.id === library.prefs.stage)?.agesLabel} ·{' '}
            {library.prefs.gridLayout.replace('x', '×')}. Moving up only unlocks more slots and
            folders — it does not move Want, Help, More, Yes, No, or All Done.
          </p>
          <div className="toggle-row wrap">
            {AAC_STAGES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`chip ${library.prefs.stage === s.id ? 'is-active' : ''}`}
                onClick={() => {
                  saveLibrary(applyStageToLibrary(library, s.id as AacStage))
                  setMsg(`Board set to ${s.agesLabel} (${s.defaultLayout.replace('x', '×')}).`)
                }}
              >
                {s.agesLabel}
              </button>
            ))}
          </div>
        </article>

        <AacSetup embedded />

        <article className="dash-card">
          <h2>Home / School board</h2>
          <p className="fine-print">
            Switch fringe vocabulary for clinic vs home. Core words (Want, Help, More…) stay in the
            exact same slots on both boards.
          </p>
          <div className="toggle-row wrap">
            {AAC_BOARD_CONTEXTS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`chip ${library.prefs.activeBoardContext === c.id ? 'is-active' : ''}`}
                onClick={() => updatePrefs({ activeBoardContext: c.id })}
                title={c.blurb}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
          <p className="fine-print">
            Editing list below shows the <strong>{library.prefs.activeBoardContext}</strong> board
            plus shared words.
          </p>
        </article>

        <article className="dash-card">
          <h2>Classroom Quick-Talk</h2>
          <p className="fine-print">
            Load temporary fringe words for today’s lesson (pumpkin, bus, zoo…). Clearing the strip
            never touches the child’s permanent home vocabulary.
          </p>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.quickTalkEnabled}
              onChange={(e) => updatePrefs({ quickTalkEnabled: e.target.checked })}
            />
            Show Quick-Talk strip on Talk when loaded
          </label>
          {library.quickTalk ? (
            <p className="save-toast" role="status">
              Active: <strong>{library.quickTalk.title}</strong> (
              {library.quickTalk.words.map((w) => w.label).join(', ')})
            </p>
          ) : (
            <p className="fine-print">No Quick-Talk strip loaded.</p>
          )}
          <div className="toggle-row wrap">
            {QUICK_TALK_PACKS.map((pack) => (
              <button
                key={pack.id}
                type="button"
                className="chip"
                title={pack.blurb}
                onClick={() => {
                  saveLibrary({ ...library, quickTalk: packToStrip(pack) })
                  setMsg(`Loaded Quick-Talk: ${pack.title}`)
                }}
              >
                {pack.emoji} {pack.title}
              </button>
            ))}
          </div>
          <label className="field-label">
            Custom strip title
            <input
              className="text-input"
              value={qtCustomTitle}
              onChange={(e) => setQtCustomTitle(e.target.value)}
              maxLength={48}
            />
          </label>
          <label className="field-label">
            Words (comma-separated)
            <input
              className="text-input"
              value={qtCustomList}
              onChange={(e) => setQtCustomList(e.target.value)}
              placeholder="pumpkin, leaf, fall"
              maxLength={200}
            />
          </label>
          <div className="confirm-row">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const strip = parseQuickTalkList(qtCustomTitle, qtCustomList)
                if (!strip) {
                  setMsg('Add at least one word for Quick-Talk.')
                  return
                }
                saveLibrary({ ...library, quickTalk: strip })
                setMsg(`Loaded custom Quick-Talk: ${strip.title}`)
              }}
            >
              Load custom strip
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={!library.quickTalk}
              onClick={() => {
                saveLibrary({ ...library, quickTalk: null })
                setMsg('Quick-Talk cleared — permanent board unchanged.')
              }}
            >
              Clear Quick-Talk
            </button>
          </div>
        </article>

        <article className="dash-card">
          <h2>Classroom audio &amp; First–Then</h2>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.firstThenBarEnabled}
              onChange={(e) => updatePrefs({ firstThenBarEnabled: e.target.checked })}
            />
            Show First–Then Schedule Bar on Talk
          </label>
          <p className="fine-print">
            Off by default to keep Talk uncluttered. When on, set FIRST / THEN on Talk while a
            parent session is unlocked (tap a slot). Children tap to hear “First …, then …”.
          </p>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.classroomVolumeBoost}
              onChange={(e) => updatePrefs({ classroomVolumeBoost: e.target.checked })}
            />
            Classroom volume boost (louder TTS / clips in noisy rooms)
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.strongTapHighlight}
              onChange={(e) => updatePrefs({ strongTapHighlight: e.target.checked })}
            />
            Strong tap highlight + “Tapped” banner (teacher visibility)
          </label>
        </article>

        <article className="dash-card">
          <h2>Attention &amp; body check</h2>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.attentionEnabled}
              onChange={(e) => updatePrefs({ attentionEnabled: e.target.checked })}
            />
            Show “Excuse me / Look!” attention bell on Talk
          </label>
          <label className="field-label">
            Attention phrase
            <input
              className="text-input"
              value={library.prefs.attentionPhrase}
              onChange={(e) => updatePrefs({ attentionPhrase: e.target.value })}
              maxLength={80}
            />
          </label>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => updatePrefs({ attentionPhrase: DEFAULT_ATTENTION_PHRASE })}
          >
            Reset phrase
          </button>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.bodyCheckEnabled}
              onChange={(e) => updatePrefs({ bodyCheckEnabled: e.target.checked })}
            />
            Show Pain &amp; Body Check on Talk (one-tap, no folders)
          </label>
        </article>

        <article className="dash-card">
          <h2>Board layout &amp; core words</h2>
          <p className="fine-print">
            Recommended layouts for this age are highlighted. You can pick any grid; core cells stay
            absolute.
          </p>
          <div className="toggle-row wrap">
            {GRID_LAYOUTS.map((g) => {
              const stageMeta = AAC_STAGES.find((s) => s.id === library.prefs.stage)
              const recommended = stageMeta?.recommendedLayouts.includes(g.id)
              return (
                <button
                  key={g.id}
                  type="button"
                  className={`chip ${library.prefs.gridLayout === g.id ? 'is-active' : ''} ${
                    recommended ? 'is-recommended' : ''
                  }`}
                  onClick={() => updatePrefs({ gridLayout: g.id as AacGridLayout })}
                  title={g.hint}
                >
                  {g.label}
                  {recommended ? ' ★' : ''}
                </button>
              )
            })}
          </div>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.showFolders}
              onChange={(e) => updatePrefs({ showFolders: e.target.checked })}
            />
            Show category folders (Feelings, Food, People, Places, ASL Signs…)
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.highContrast}
              onChange={(e) => updatePrefs({ highContrast: e.target.checked })}
            />
            High-contrast icons (starter-friendly)
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.audioLabels}
              onChange={(e) => updatePrefs({ audioLabels: e.target.checked })}
            />
            Audio labels (speak word on activate)
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.corePinned}
              onChange={(e) => updatePrefs({ corePinned: e.target.checked })}
            />
            Keep core words on the main board
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.colorCoding}
              onChange={(e) => updatePrefs({ colorCoding: e.target.checked })}
            />
            Fitzgerald Key color coding
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.modelMode}
              onChange={(e) => updatePrefs({ modelMode: e.target.checked })}
            />
            Model mode (glow + speak, don’t fill sentence strip)
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.wordFormsEnabled}
              onChange={(e) => updatePrefs({ wordFormsEnabled: e.target.checked })}
            />
            Press-and-hold word forms (eat → eating / ate…)
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.showMaskedSlots}
              onChange={(e) => updatePrefs({ showMaskedSlots: e.target.checked })}
            />
            Show empty reserved slots for masked words
          </label>
          {library.prefs.colorCoding ? (
            <ul className="aac-fitz-legend">
              {POS_OPTIONS.map((p) => (
                <li key={p.id} style={{ background: FITZGERALD_COLORS[p.id].bg }}>
                  {p.label}
                </li>
              ))}
            </ul>
          ) : null}
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.largeButtons}
              onChange={(e) => updatePrefs({ largeButtons: e.target.checked })}
            />
            Large buttons
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.showLabels}
              onChange={(e) => updatePrefs({ showLabels: e.target.checked })}
            />
            Show word labels
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.messageBar}
              onChange={(e) => updatePrefs({ messageBar: e.target.checked })}
            />
            Sentence strip (message window)
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.speakOnTap}
              onChange={(e) => updatePrefs({ speakOnTap: e.target.checked })}
            />
            Speak each word when activated
          </label>
        </article>

        <article className="dash-card">
          <h2>Pictures &amp; display</h2>
          <div className="toggle-row wrap">
            {(
              [
                ['auto', 'Auto (photo → sign → emoji)'],
                ['photo', 'Photo first'],
                ['sign', 'Sign image first'],
                ['emoji', 'Emoji only'],
              ] as [AacDisplayMode, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`chip ${library.prefs.displayMode === id ? 'is-active' : ''}`}
                onClick={() => updatePrefs({ displayMode: id })}
              >
                {label}
              </button>
            ))}
          </div>
        </article>

        <article className="dash-card">
          <h2>Voice (on-device TTS)</h2>
          <p className="fine-print">
            Uses the device speech engine (offline). Pick a kid-friendly system voice in Grown-ups,
            then tune pitch &amp; speed for Talk.
          </p>
          <VoicePicker
            voiceURI={settings.sensory.voiceURI}
            voiceStyle={settings.sensory.voiceStyle}
            onChange={({ voiceURI, voiceStyle }) => {
              updateSettings({
                sensory: { ...settings.sensory, voiceURI, voiceStyle },
              })
              setMsg('Voice updated.')
            }}
          />
          <label className="field-label">
            Pitch ({library.prefs.speechPitch.toFixed(2)})
            <input
              type="range"
              min={0.7}
              max={1.6}
              step={0.02}
              value={library.prefs.speechPitch}
              onChange={(e) => updatePrefs({ speechPitch: Number(e.target.value) })}
            />
          </label>
          <label className="field-label">
            Speed ({library.prefs.speechRate.toFixed(2)})
            <input
              type="range"
              min={0.6}
              max={1.2}
              step={0.02}
              value={library.prefs.speechRate}
              onChange={(e) => updatePrefs({ speechRate: Number(e.target.value) })}
            />
          </label>
        </article>

        <article className="dash-card">
          <h2>Touch &amp; sensory</h2>
          <p className="fine-print">Hold delay and speak-on-release help accidental taps.</p>
          <p className="field-label">Repeat tap cooldown (anti-stimming)</p>
          <p className="fine-print">
            Blocks mashing the same tile again for a moment — different words stay instant for
            sentence building. Try 1.5s for quiet classrooms.
          </p>
          <div className="toggle-row wrap" role="group" aria-label="Repeat tap cooldown">
            {REPEAT_COOLDOWN_OPTIONS.map((opt) => (
              <button
                key={opt.ms}
                type="button"
                className={`chip ${library.prefs.repeatCooldownMs === opt.ms ? 'is-active' : ''}`}
                onClick={() => updatePrefs({ repeatCooldownMs: opt.ms })}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="toggle-row wrap">
            {([0, 200, 400, 600] as const).map((ms) => (
              <button
                key={ms}
                type="button"
                className={`chip ${library.prefs.touchDelayMs === ms ? 'is-active' : ''}`}
                onClick={() => updatePrefs({ touchDelayMs: ms })}
              >
                {ms === 0 ? 'No delay' : `${ms} ms hold`}
              </button>
            ))}
          </div>
          <div className="toggle-row wrap">
            <button
              type="button"
              className={`chip ${library.prefs.touchTrigger === 'press' ? 'is-active' : ''}`}
              onClick={() => updatePrefs({ touchTrigger: 'press' })}
            >
              Speak on press
            </button>
            <button
              type="button"
              className={`chip ${library.prefs.touchTrigger === 'release' ? 'is-active' : ''}`}
              onClick={() => updatePrefs({ touchTrigger: 'release' })}
            >
              Speak on release
            </button>
          </div>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.buttonAnimations}
              onChange={(e) => updatePrefs({ buttonAnimations: e.target.checked })}
            />
            Soft button press animation
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.tapSounds}
              onChange={(e) => updatePrefs({ tapSounds: e.target.checked })}
            />
            Soft tap sound (off by default — calmer)
          </label>
        </article>

        <article className="dash-card">
          <h2>About me (emergency)</h2>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.aboutMeEnabled}
              onChange={(e) => updatePrefs({ aboutMeEnabled: e.target.checked })}
            />
            Show “About me” button on Talk
          </label>
          <label className="field-label">
            Spoken message
            <textarea
              className="text-input"
              rows={3}
              value={library.prefs.aboutMeText}
              onChange={(e) => updatePrefs({ aboutMeText: e.target.value })}
              maxLength={400}
            />
          </label>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => updatePrefs({ aboutMeText: DEFAULT_ABOUT_ME })}
          >
            Reset to default message
          </button>
        </article>

        <article className="dash-card aac-guided-access">
          <h2>Keep Talk open (Guided Access / App Pinning)</h2>
          <p>
            On Talk, tap the corner <strong>padlock</strong> to hide Home and Edit (hold ~4 seconds
            to unlock). For stronger device-level locking, use Guided Access / App Pinning so your
            child can’t leave Soft Steps entirely.
          </p>
          <h3>iPhone / iPad — Guided Access</h3>
          <ol>
            <li>Settings → Accessibility → Guided Access → turn On</li>
            <li>Open Soft Steps → Talk</li>
            <li>Triple-click the Side (or Home) button → Start</li>
            <li>To exit: triple-click → enter your Guided Access passcode</li>
          </ol>
          <h3>Android — App Pinning</h3>
          <ol>
            <li>Settings → Security (or Biometrics) → App pinning → On</li>
            <li>Open Soft Steps → Talk</li>
            <li>Recents / Overview → pin Soft Steps</li>
            <li>Unpin with the gesture your phone shows (often hold Back + Overview)</li>
          </ol>
          <p className="fine-print">
            Soft Steps itself stays 100% offline for Talk — no account, no cloud tracking of AAC
            taps.
          </p>
        </article>

        <div className="tool-picker wrap">
          {library.categories
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((c) => (
              <button
                key={c.id}
                type="button"
                className={`chip ${categoryId === c.id ? 'is-active' : ''}`}
                onClick={() => setCategoryId(c.id)}
              >
                {c.emoji} {c.title}
                {c.hidden ? ' (hidden)' : ''}
              </button>
            ))}
          <button type="button" className="chip chip-new" onClick={addCategory}>
            + Category
          </button>
        </div>

        <article className="dash-card">
          <h2>Export &amp; share board</h2>
          <p className="fine-print">
            Program on a clinic iPad, then download this board file and AirDrop / share it to the
            home device — no rebuild from scratch.
          </p>
          <div className="confirm-row">
            <button type="button" className="btn btn-primary" onClick={exportBoard}>
              Export AAC board
            </button>
            <label className="btn btn-ghost upload-btn">
              Import board file
              <input
                type="file"
                accept="application/json,.json"
                hidden
                onChange={(e) => importBoard(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </article>

        <div className="confirm-row">
          <button type="button" className="btn btn-primary" onClick={openNew}>
            + Add word
          </button>
        </div>

        {showForm ? (
          <form className="aac-add-form" onSubmit={saveButton}>
            <h3>{editing ? `Edit “${editing.label}”` : 'New word'}</h3>
            <label className="field-label">
              Word / phrase
              <input
                className="text-input"
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                maxLength={48}
                required
              />
            </label>
            <label className="field-label">
              Spoken aloud (optional)
              <input
                className="text-input"
                value={draftSpeak}
                onChange={(e) => setDraftSpeak(e.target.value)}
                placeholder="Defaults to the word above"
                maxLength={80}
              />
            </label>
            <label className="field-label">
              Emoji fallback
              <input
                className="text-input"
                value={draftEmoji}
                onChange={(e) => setDraftEmoji(e.target.value)}
                maxLength={8}
              />
            </label>
            <label className="field-label">
              Category
              <select
                className="text-input"
                value={draftCat}
                onChange={(e) => setDraftCat(e.target.value)}
              >
                {library.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Fitzgerald color
              <select
                className="text-input"
                value={draftPos}
                onChange={(e) => setDraftPos(e.target.value as AacPartOfSpeech)}
              >
                {POS_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>

            {draftCat !== 'core' ? (
              <label className="field-label">
                Show on board
                <select
                  className="text-input"
                  value={draftBoardContext}
                  onChange={(e) =>
                    setDraftBoardContext(e.target.value as AacBoardContextId | 'both')
                  }
                >
                  <option value="both">Both Home &amp; School</option>
                  <option value="home">Home board only</option>
                  <option value="school">School board only</option>
                </select>
              </label>
            ) : null}

            <div className="aac-upload-row">
              <div>
                <p className="fine-print">Photo (cup, toy, pet, Grandma…)</p>
                {draftPhoto ? <img src={draftPhoto} alt="" className="aac-photo-preview" /> : null}
                <div className="confirm-row">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setPhotoCapture('photo')}
                  >
                    Snap &amp; crop
                  </button>
                  <label className="btn btn-ghost upload-btn">
                    Choose file
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      hidden
                      onChange={(e) => onImage('photo', e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
                {draftPhoto ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setDraftPhoto(undefined)}
                  >
                    Remove photo
                  </button>
                ) : null}
              </div>
              <div>
                <p className="fine-print">Sign language image</p>
                {draftSign ? <img src={draftSign} alt="" className="aac-photo-preview" /> : null}
                <div className="confirm-row">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setPhotoCapture('sign')}
                  >
                    Snap &amp; crop
                  </button>
                  <label className="btn btn-ghost upload-btn">
                    Choose file
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      hidden
                      onChange={(e) => onImage('sign', e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
                {draftSign ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setDraftSign(undefined)}
                  >
                    Remove sign
                  </button>
                ) : null}
              </div>
            </div>

            <div className="aac-voice-record">
              <p className="fine-print">
                Family voice — hold the mic, say the word, release. Plays instead of TTS.
              </p>
              {draftAudio ? (
                <audio controls src={draftAudio} className="aac-audio-preview">
                  <track kind="captions" />
                </audio>
              ) : null}
              <div className="confirm-row">
                <button
                  type="button"
                  className={`btn aac-mic-hold ${recording ? 'is-recording btn-primary' : 'btn-ghost'}`}
                  onPointerDown={onMicPointerDown}
                  onPointerUp={onMicPointerUp}
                  onPointerCancel={onMicPointerUp}
                  onPointerLeave={onMicPointerUp}
                  aria-pressed={recording}
                  aria-label="Hold to record family voice"
                >
                  {recording ? '🎙️ Recording… release' : '🎙️ Hold to record'}
                </button>
                {draftAudio ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setDraftAudio(undefined)}
                  >
                    Remove clip
                  </button>
                ) : null}
              </div>
            </div>

            {photoError ? <p className="form-error">{photoError}</p> : null}
            <p className="fine-print">
              Photos and voice clips stay on this device. Nothing is uploaded to Soft Steps servers.
            </p>
            <div className="confirm-row">
              <button type="submit" className="btn btn-primary">
                Save word
              </button>
              <button type="button" className="btn btn-ghost" onClick={closeForm}>
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <p className="fine-print">
          Mask keeps the button’s permanent slot empty for progressive vocabulary — it does not
          rearrange the grid.
        </p>
        <ul className="aac-edit-list">
          {buttonsInCat.map((btn) => (
            <li key={btn.id} className={btn.masked ? 'is-masked' : ''}>
              <button type="button" className="aac-edit-row" onClick={() => openEdit(btn)}>
                {btn.photoDataUrl ? (
                  <img src={btn.photoDataUrl} alt="" className="aac-edit-thumb" />
                ) : btn.signPhotoDataUrl ? (
                  <img src={btn.signPhotoDataUrl} alt="" className="aac-edit-thumb" />
                ) : (
                  <span
                    className="aac-edit-swatch"
                    style={{ background: FITZGERALD_COLORS[btn.partOfSpeech].bg }}
                    aria-hidden="true"
                  >
                    {btn.emoji}
                  </span>
                )}
                <span>
                  <strong>{btn.label}</strong>
                  <span className="fine-print">
                    {btn.source === 'preset' ? 'Preset' : 'Custom'} · {btn.partOfSpeech}
                    {btn.photoDataUrl ? ' · photo' : ''}
                    {btn.signPhotoDataUrl ? ' · sign' : ''}
                    {btn.audioDataUrl ? ' · voice' : ''}
                    {btn.masked ? ' · masked' : ''}
                  </span>
                </span>
              </button>
              <div className="aac-edit-actions">
                <button type="button" className="btn btn-ghost" onClick={() => toggleMasked(btn.id)}>
                  {btn.masked ? 'Unmask' : 'Mask'}
                </button>
                {btn.source === 'custom' ? (
                  <button type="button" className="btn btn-ghost" onClick={() => removeCustom(btn.id)}>
                    Delete
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        {msg ? (
          <p className="save-toast" role="status">
            {msg}
          </p>
        ) : null}

        <p className="fine-print">
          Parental gate: Edit requires a 3-second hold on Talk, then this PIN unlock. Preset
          categories: {PRESET_CATEGORIES.map((c) => c.title).join(', ')}.
        </p>

        {photoCapture ? (
          <AacPhotoCapture
            title={photoCapture === 'photo' ? 'Snap a real-life photo' : 'Snap a sign photo'}
            onCancel={() => setPhotoCapture(null)}
            onCapture={(dataUrl) => {
              if (photoCapture === 'photo') setDraftPhoto(dataUrl)
              else setDraftSign(dataUrl)
              setPhotoCapture(null)
              setPhotoError('')
              setMsg('Photo cropped and ready — Save word to keep it.')
            }}
          />
        ) : null}
      </LockedGate>
    </section>
  )
}
