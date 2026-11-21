import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LockedGate } from '../../components/ParentLock'
import {
  PRESET_CATEGORIES,
  type AacButton,
  type AacCategory,
  type AacDisplayMode,
  type AacLibrary,
  type AacPrefs,
} from '../../data/aacPresets'
import { isParentSessionValid } from '../../security/parentSession'
import { useApp } from '../../store/AppContext'
import { readPhotoAsDataUrl } from '../../utils/imageFile'

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`
}

/**
 * Grown-up AAC editor — parents, SLPs, educators add words, photos, and sign images;
 * set display preferences for the kid Talk board.
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
  const [draftPhoto, setDraftPhoto] = useState<string | undefined>()
  const [draftSign, setDraftSign] = useState<string | undefined>()
  const [msg, setMsg] = useState('')
  const [photoError, setPhotoError] = useState('')

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

  const buttonsInCat = library.buttons
    .filter((b) => b.categoryId === categoryId)
    .sort((a, b) => a.order - b.order)

  const openNew = () => {
    setEditing(null)
    setDraftLabel('')
    setDraftSpeak('')
    setDraftEmoji('💬')
    setDraftCat(categoryId === 'family' ? 'family' : categoryId)
    setDraftPhoto(undefined)
    setDraftSign(undefined)
    setPhotoError('')
    setShowForm(true)
  }

  const openEdit = (btn: AacButton) => {
    setEditing(btn)
    setDraftLabel(btn.label)
    setDraftSpeak(btn.speak || '')
    setDraftEmoji(btn.emoji)
    setDraftCat(btn.categoryId)
    setDraftPhoto(btn.photoDataUrl)
    setDraftSign(btn.signPhotoDataUrl)
    setPhotoError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
    setDraftLabel('')
    setDraftPhoto(undefined)
    setDraftSign(undefined)
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
              photoDataUrl: draftPhoto,
              signPhotoDataUrl: draftSign,
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
        photoDataUrl: draftPhoto,
        signPhotoDataUrl: draftSign,
        order: library.buttons.filter((b) => b.categoryId === draftCat).length,
        source: 'custom',
      }
      saveLibrary({ ...library, buttons: [...library.buttons, btn] })
      setMsg(`Added “${label}”.`)
      setCategoryId(draftCat)
    }
    closeForm()
  }

  const toggleHidden = (id: string) => {
    saveLibrary({
      ...library,
      buttons: library.buttons.map((b) => (b.id === id ? { ...b, hidden: !b.hidden } : b)),
    })
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
          Upload words, photos, and sign-language pictures. Soft Steps starts with basics — customize
          what your learner sees and hears.
        </p>

        <article className="dash-card">
          <h2>Board preferences</h2>
          <p className="fine-print">These control the kid Talk board.</p>
          <div className="toggle-row wrap">
            {([2, 3, 4] as const).map((n) => (
              <button
                key={n}
                type="button"
                className={`chip ${library.prefs.columns === n ? 'is-active' : ''}`}
                onClick={() => updatePrefs({ columns: n })}
              >
                {n} columns
              </button>
            ))}
          </div>
          <p className="fine-print">Preferred picture</p>
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
              checked={library.prefs.speakOnTap}
              onChange={(e) => updatePrefs({ speakOnTap: e.target.checked })}
            />
            Speak each tap
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.messageBar}
              onChange={(e) => updatePrefs({ messageBar: e.target.checked })}
            />
            Message bar (build a sentence)
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={library.prefs.largeButtons}
              onChange={(e) => updatePrefs({ largeButtons: e.target.checked })}
            />
            Large buttons
          </label>
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

            <div className="aac-upload-row">
              <div>
                <p className="fine-print">Photo (object / person)</p>
                {draftPhoto ? <img src={draftPhoto} alt="" className="aac-photo-preview" /> : null}
                <label className="btn btn-ghost upload-btn">
                  Upload photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    hidden
                    onChange={(e) => onImage('photo', e.target.files?.[0] ?? null)}
                  />
                </label>
                {draftPhoto ? (
                  <button type="button" className="btn btn-ghost" onClick={() => setDraftPhoto(undefined)}>
                    Remove photo
                  </button>
                ) : null}
              </div>
              <div>
                <p className="fine-print">Sign language image</p>
                {draftSign ? <img src={draftSign} alt="" className="aac-photo-preview" /> : null}
                <label className="btn btn-ghost upload-btn">
                  Upload sign
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    hidden
                    onChange={(e) => onImage('sign', e.target.files?.[0] ?? null)}
                  />
                </label>
                {draftSign ? (
                  <button type="button" className="btn btn-ghost" onClick={() => setDraftSign(undefined)}>
                    Remove sign
                  </button>
                ) : null}
              </div>
            </div>
            {photoError ? <p className="form-error">{photoError}</p> : null}
            <p className="fine-print">
              Photos stay on this device. Use clear signs / real objects your learner recognizes.
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

        <ul className="aac-edit-list">
          {buttonsInCat.map((btn) => (
            <li key={btn.id} className={btn.hidden ? 'is-hidden' : ''}>
              <button type="button" className="aac-edit-row" onClick={() => openEdit(btn)}>
                {btn.photoDataUrl ? (
                  <img src={btn.photoDataUrl} alt="" className="aac-edit-thumb" />
                ) : btn.signPhotoDataUrl ? (
                  <img src={btn.signPhotoDataUrl} alt="" className="aac-edit-thumb" />
                ) : (
                  <span aria-hidden="true">{btn.emoji}</span>
                )}
                <span>
                  <strong>{btn.label}</strong>
                  <span className="fine-print">
                    {btn.source === 'preset' ? 'Preset' : 'Custom'}
                    {btn.photoDataUrl ? ' · photo' : ''}
                    {btn.signPhotoDataUrl ? ' · sign' : ''}
                    {btn.hidden ? ' · hidden' : ''}
                  </span>
                </span>
              </button>
              <div className="aac-edit-actions">
                <button type="button" className="btn btn-ghost" onClick={() => toggleHidden(btn.id)}>
                  {btn.hidden ? 'Show' : 'Hide'}
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
          Tip: hide unused presets, add classroom / home words, and attach the sign stills your team
          uses. Categories include {PRESET_CATEGORIES.map((c) => c.title).join(', ')}.
        </p>
      </LockedGate>
    </section>
  )
}
