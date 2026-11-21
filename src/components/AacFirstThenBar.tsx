import { useMemo, useState, type FormEvent } from 'react'
import { speakText } from '../audio/calmAudio'
import { FIRST_THEN_PRESETS, firstThenPhrase } from '../data/aacFirstThen'
import {
  resolveAacVisual,
  type AacButton,
  type AacFirstThenBoard,
  type AacFirstThenSlot,
  type AacLibrary,
  type AacPrefs,
} from '../data/aacPresets'
import { useApp } from '../store/AppContext'
import { readPhotoAsDataUrl } from '../utils/imageFile'
import { AacPhotoCapture } from './AacPhotoCapture'

type Props = {
  prefs: AacPrefs
  library: AacLibrary
  /** Parent session valid + board unlocked — slot tap opens picker */
  adultSetup: boolean
  onChange: (next: AacFirstThenBoard) => void
}

type PickerTarget = 'first' | 'then'
type PickerTab = 'aac' | 'presets' | 'custom'

/**
 * Collapsible First → Then schedule bar for Talk AAC.
 * Child: speak phrase + mark FIRST complete. Adult (parental gate): edit slots.
 */
export function AacFirstThenBar({ prefs, library, adultSetup, onChange }: Props) {
  const { settings } = useApp()
  const board = library.firstThen
  const [expanded, setExpanded] = useState(true)
  const [pickerFor, setPickerFor] = useState<PickerTarget | null>(null)
  const [tab, setTab] = useState<PickerTab>('presets')
  const [customLabel, setCustomLabel] = useState('')
  const [customEmoji, setCustomEmoji] = useState('⭐')
  const [customPhoto, setCustomPhoto] = useState<string | undefined>()
  const [snapOpen, setSnapOpen] = useState(false)
  const [photoError, setPhotoError] = useState('')

  const aacChoices = useMemo(
    () =>
      library.buttons
        .filter((b) => !b.hidden && !b.masked)
        .slice()
        .sort((a, b) => a.label.localeCompare(b.label)),
    [library.buttons],
  )

  const phrase = firstThenPhrase(board.first, board.then)

  const speakPhrase = () => {
    if (!phrase) return
    speakText(phrase, settings.sensory.soundOn, {
      pitch: prefs.speechPitch,
      rate: prefs.speechRate,
      forceFullVolume: prefs.classroomVolumeBoost,
      volume: prefs.classroomVolumeBoost ? 1 : undefined,
    })
  }

  const patch = (partial: Partial<AacFirstThenBoard>) => {
    onChange({ ...board, ...partial })
  }

  const setSlot = (target: PickerTarget, slot: AacFirstThenSlot | null) => {
    if (target === 'first') {
      onChange({ ...board, first: slot, firstComplete: false })
    } else {
      onChange({ ...board, then: slot })
    }
    setPickerFor(null)
    setCustomLabel('')
    setCustomPhoto(undefined)
    setPhotoError('')
  }

  const onSlotActivate = (target: PickerTarget) => {
    if (adultSetup) {
      setPickerFor(target)
      setTab('presets')
      const cur = target === 'first' ? board.first : board.then
      setCustomLabel(cur?.label ?? '')
      setCustomEmoji(cur?.emoji ?? '⭐')
      setCustomPhoto(cur?.photoDataUrl)
      return
    }
    speakPhrase()
  }

  const pickAac = (btn: AacButton) => {
    if (!pickerFor) return
    const visual = resolveAacVisual(btn, prefs.displayMode)
    setSlot(pickerFor, {
      label: btn.label,
      emoji: btn.emoji,
      photoDataUrl: visual.src,
      buttonId: btn.id,
    })
  }

  const saveCustom = (e: FormEvent) => {
    e.preventDefault()
    if (!pickerFor) return
    const label = customLabel.trim()
    if (!label) {
      setPhotoError('Add a short label.')
      return
    }
    setSlot(pickerFor, {
      label,
      emoji: customEmoji.trim() || '💬',
      photoDataUrl: customPhoto,
    })
  }

  const onUpload = (file: File | null) => {
    if (!file) return
    void readPhotoAsDataUrl(file).then((result) => {
      if (!result.ok) {
        setPhotoError(result.error)
        return
      }
      setPhotoError('')
      setCustomPhoto(result.dataUrl)
    })
  }

  return (
    <div className={`aac-ft-wrap ${expanded ? 'is-expanded' : 'is-collapsed'}`}>
      <div className="aac-ft-toolbar">
        <button
          type="button"
          className="aac-ft-toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          <span aria-hidden="true">{expanded ? '▾' : '▸'}</span>
          First–Then
          {!expanded && phrase ? <em className="aac-ft-summary">{phrase}</em> : null}
        </button>
        {expanded && phrase ? (
          <button type="button" className="btn btn-ghost aac-ft-speak-all" onClick={speakPhrase}>
            Speak
          </button>
        ) : null}
      </div>

      {expanded ? (
        <div className="aac-ft-bar" aria-label="First then schedule">
          <div
            className={`aac-ft-slot-wrap ${board.firstComplete ? 'is-complete' : ''}`}
          >
            <button
              type="button"
              className={`aac-ft-cell aac-ft-first ${board.firstComplete ? 'is-done' : ''}`}
              onClick={() => onSlotActivate('first')}
              aria-label={
                adultSetup
                  ? `Edit First: ${board.first?.label ?? 'empty'}`
                  : board.first
                    ? `First: ${board.first.label}`
                    : 'First step empty'
              }
            >
              <span className="aac-ft-kicker">First</span>
              {board.first?.photoDataUrl ? (
                <img src={board.first.photoDataUrl} alt="" className="aac-ft-thumb" />
              ) : (
                <span className="aac-ft-emoji" aria-hidden="true">
                  {board.first?.emoji ?? '➕'}
                </span>
              )}
              <span className="aac-ft-label">
                {board.first?.label ?? (adultSetup ? 'Tap to set' : '—')}
              </span>
              {board.firstComplete ? (
                <span className="aac-ft-done-badge" aria-hidden="true">
                  ✓
                </span>
              ) : null}
            </button>
            {board.first ? (
              <button
                type="button"
                className={`aac-ft-check ${board.firstComplete ? 'is-on' : ''}`}
                onClick={() => patch({ firstComplete: !board.firstComplete })}
                aria-pressed={board.firstComplete}
                aria-label={
                  board.firstComplete
                    ? 'Mark First task not done'
                    : 'Mark First task complete'
                }
              >
                {board.firstComplete ? '✓' : '○'}
              </button>
            ) : null}
          </div>

          <span className="aac-ft-arrow" aria-hidden="true">
            →
          </span>

          <button
            type="button"
            className="aac-ft-cell aac-ft-then"
            onClick={() => onSlotActivate('then')}
            aria-label={
              adultSetup
                ? `Edit Then: ${board.then?.label ?? 'empty'}`
                : board.then
                  ? `Then: ${board.then.label}`
                  : 'Then empty'
            }
          >
            <span className="aac-ft-kicker">Then</span>
            {board.then?.photoDataUrl ? (
              <img src={board.then.photoDataUrl} alt="" className="aac-ft-thumb" />
            ) : (
              <span className="aac-ft-emoji" aria-hidden="true">
                {board.then?.emoji ?? '⭐'}
              </span>
            )}
            <span className="aac-ft-label">
              {board.then?.label ?? (adultSetup ? 'Tap to set' : '—')}
            </span>
          </button>
        </div>
      ) : null}

      {adultSetup && !expanded ? (
        <p className="fine-print aac-ft-adult-hint">Expand to edit First–Then slots.</p>
      ) : null}

      {pickerFor && adultSetup ? (
        <div className="aac-ft-picker" role="dialog" aria-modal="true" aria-label="Set First Then slot">
          <div className="aac-ft-picker-sheet">
            <header className="aac-ft-picker-head">
              <h3>Set {pickerFor === 'first' ? 'FIRST' : 'THEN'}</h3>
              <button type="button" className="btn btn-ghost" onClick={() => setPickerFor(null)}>
                Cancel
              </button>
            </header>
            <div className="toggle-row wrap" role="tablist">
              {(
                [
                  { id: 'presets' as const, label: 'Presets' },
                  { id: 'aac' as const, label: 'AAC tiles' },
                  { id: 'custom' as const, label: 'Custom' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  className={`chip ${tab === t.id ? 'is-active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'presets' ? (
              <div className="aac-ft-picker-grid" role="list">
                {FIRST_THEN_PRESETS.map((p) => (
                  <button
                    key={`${p.label}-${p.emoji}`}
                    type="button"
                    className="aac-ft-picker-item"
                    role="listitem"
                    onClick={() => setSlot(pickerFor, { ...p })}
                  >
                    <span aria-hidden="true">{p.emoji}</span>
                    {p.label}
                  </button>
                ))}
              </div>
            ) : null}

            {tab === 'aac' ? (
              <div className="aac-ft-picker-grid" role="list">
                {aacChoices.map((btn) => {
                  const visual = resolveAacVisual(btn, prefs.displayMode)
                  return (
                    <button
                      key={btn.id}
                      type="button"
                      className="aac-ft-picker-item"
                      role="listitem"
                      onClick={() => pickAac(btn)}
                    >
                      {visual.src ? (
                        <img src={visual.src} alt="" className="aac-ft-picker-thumb" />
                      ) : (
                        <span aria-hidden="true">{visual.emoji}</span>
                      )}
                      {btn.label}
                    </button>
                  )
                })}
              </div>
            ) : null}

            {tab === 'custom' ? (
              <form className="aac-ft-custom" onSubmit={saveCustom}>
                <label className="field-label">
                  Label
                  <input
                    className="text-input"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    maxLength={40}
                    required
                    placeholder="Brush Teeth"
                  />
                </label>
                <label className="field-label">
                  Emoji
                  <input
                    className="text-input"
                    value={customEmoji}
                    onChange={(e) => setCustomEmoji(e.target.value)}
                    maxLength={8}
                  />
                </label>
                {customPhoto ? (
                  <img src={customPhoto} alt="" className="aac-photo-preview" />
                ) : null}
                <div className="confirm-row">
                  <button type="button" className="btn btn-ghost" onClick={() => setSnapOpen(true)}>
                    Snap &amp; crop
                  </button>
                  <label className="btn btn-ghost upload-btn">
                    Upload photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      hidden
                      onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {customPhoto ? (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setCustomPhoto(undefined)}
                    >
                      Remove photo
                    </button>
                  ) : null}
                </div>
                {photoError ? <p className="form-error">{photoError}</p> : null}
                <div className="confirm-row">
                  <button type="submit" className="btn btn-primary">
                    Save slot
                  </button>
                </div>
              </form>
            ) : null}

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setSlot(pickerFor, null)}
            >
              Clear this slot
            </button>
          </div>
        </div>
      ) : null}

      {snapOpen ? (
        <AacPhotoCapture
          title="Photo for First–Then"
          onCancel={() => setSnapOpen(false)}
          onCapture={(dataUrl) => {
            setCustomPhoto(dataUrl)
            setSnapOpen(false)
            setTab('custom')
          }}
        />
      ) : null}
    </div>
  )
}
