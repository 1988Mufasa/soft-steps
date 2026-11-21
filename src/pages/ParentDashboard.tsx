import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { VoicePicker } from '../components/VoicePicker'
import { loadCheckInHistory, replaceCheckInHistory } from '../data/checkIn'
import { useParentSessionGuard } from '../hooks/useParentSessionGuard'
import { clearParentSession } from '../security/parentSession'
import { useApp, unlockNewSession } from '../store/AppContext'
import { loadAllProgress, saveAllProgress, saveSettings } from '../store/storage'
import type {
  AgeBand,
  CareModuleId,
  InterestTheme,
  KidProfile,
  ModuleId,
  OnlineActivityId,
} from '../types'
import {
  DEFAULT_HOME,
  DEFAULT_INTEREST_CHECKLIST,
  ROUTINE_HOUR_PRESETS,
  SAMPLE_STORIES,
} from '../types'
import {
  buildBackupPayload,
  decryptBackup,
  downloadText,
  encryptBackup,
  parseBackupFile,
  validateProgressMap,
  validateRestoredSettings,
  type SoftStepsEncryptedBackup,
  type SoftStepsLegacyBackup,
} from '../utils/backup'
import { buildWeekInsightsText } from '../utils/insights'

const MODULE_LABELS: { id: ModuleId; label: string }[] = [
  { id: 'abc', label: 'ABCs' },
  { id: 'shapes', label: 'Shapes' },
  { id: 'colors', label: 'Colors' },
  { id: 'numbers', label: 'Numbers' },
  { id: 'signs', label: 'Sign language' },
  { id: 'foods', label: 'Pictures (foods, animals, body, objects)' },
]

const CARE_LABELS: { id: CareModuleId; label: string }[] = [
  { id: 'calm', label: 'Calm toolkit / Meltdown Mode' },
  { id: 'checkin', label: 'AAC Communication & Emotion Check-Ins' },
  { id: 'feelings', label: 'Feelings check-in (quick)' },
  { id: 'schedule', label: 'First / Then routines' },
  { id: 'stories', label: 'Social stories' },
  { id: 'videos', label: 'Learning videos' },
  { id: 'talk', label: 'Talk board (AAC)' },
  { id: 'friends', label: 'Social cues' },
  { id: 'interest', label: 'Interest rewards' },
]

const ONLINE_LABELS: { id: OnlineActivityId; label: string }[] = [
  { id: 'mix-quiz', label: 'Mix quiz' },
  { id: 'gentle-timer', label: 'Gentle timer' },
  { id: 'multi-match', label: 'Multi-step match' },
  { id: 'sync-demo', label: 'Progress sync demo' },
]

const INTERESTS: { id: InterestTheme; label: string }[] = [
  { id: 'trains', label: 'Trains' },
  { id: 'dinosaurs', label: 'Dinosaurs' },
  { id: 'animals', label: 'Animals' },
  { id: 'space', label: 'Space' },
  { id: 'patterns', label: 'Math patterns' },
]

const PROFILE_EMOJIS = ['🧒', '👧', '👦', '🧑', '🦊', '🐻', '⭐', '🌈']

function newProfileId() {
  return `kid-${Date.now().toString(36)}`
}

export function ParentDashboard() {
  const navigate = useNavigate()
  const {
    settings,
    progress,
    updateSettings,
    setEnabledModule,
    setEnabledCareModule,
    setEnabledOnlineActivity,
    resetProgress,
    changePin,
    activeProfile,
    switchProfile,
    upsertProfile,
    removeProfile,
    applyQuietMode,
  } = useApp()
  const [newPin, setNewPin] = useState('')
  const [saved, setSaved] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const [checkIns] = useState(() => loadCheckInHistory())
  const [editName, setEditName] = useState(activeProfile?.name ?? '')
  const [editEmoji, setEditEmoji] = useState(activeProfile?.emoji ?? '🧒')
  const [backupPin, setBackupPin] = useState('')
  const restoreRef = useRef<HTMLInputElement>(null)
  const { remainingMs } = useParentSessionGuard()

  useEffect(() => {
    setEditName(activeProfile?.name ?? '')
    setEditEmoji(activeProfile?.emoji ?? '🧒')
  }, [activeProfile?.id, activeProfile?.name, activeProfile?.emoji])

  const onSavePin = async (e: FormEvent) => {
    e.preventDefault()
    if (newPin.length < 4) {
      setSaved('PIN needs at least 4 digits.')
      return
    }
    await changePin(newPin)
    setNewPin('')
    setSaved('PIN updated — salted PBKDF2 hash stored on this device only.')
  }

  const exportInsights = () => {
    const name = activeProfile?.name ?? 'Kid'
    const text = buildWeekInsightsText(settings, progress, name)
    const stamp = new Date().toISOString().slice(0, 10)
    downloadText(`soft-steps-week-${stamp}.txt`, text)
    setSaved('Week summary downloaded as text.')
  }

  const shareInsights = async () => {
    const name = activeProfile?.name ?? 'Kid'
    const text = buildWeekInsightsText(settings, progress, name)
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Soft Steps week summary', text })
        setSaved('Week summary shared.')
        return
      } catch {
        /* fall through to download */
      }
    }
    exportInsights()
  }

  const exportBackup = async () => {
    if (backupPin.length < 4) {
      setSaved('Enter your grown-up PIN to encrypt the backup.')
      return
    }
    const payload = buildBackupPayload(settings, loadAllProgress())
    const encrypted = await encryptBackup(payload, backupPin)
    const stamp = new Date().toISOString().slice(0, 10)
    downloadText(
      `soft-steps-backup-${stamp}.json`,
      JSON.stringify(encrypted, null, 2),
      'application/json',
    )
    setBackupPin('')
    setSaved('Encrypted backup downloaded. PIN secrets are not inside the file — keep the PIN safe.')
  }

  const onRestoreFile = (file: File | null) => {
    if (!file) return
    if (backupPin.length < 4) {
      setSaved('Enter your grown-up PIN first to decrypt / authorize restore.')
      return
    }
    const pin = backupPin
    const reader = new FileReader()
    reader.onload = () => {
      void (async () => {
        const parsed = parseBackupFile(String(reader.result))
        if (!parsed) {
          setSaved('That file is not a Soft Steps backup.')
          return
        }

        let settingsIn = null as SoftStepsLegacyBackup['settings'] | null
        let progressIn: Record<string, import('../types').ProgressState> = {}
        let checkInsIn = [] as ReturnType<typeof loadCheckInHistory>

        if ('encrypted' in parsed && parsed.encrypted) {
          const plain = await decryptBackup(parsed as SoftStepsEncryptedBackup, pin)
          if (!plain) {
            setSaved('Could not decrypt — wrong PIN or damaged file.')
            return
          }
          settingsIn = plain.settings
          progressIn = plain.progressByProfile
          checkInsIn = plain.checkIns
        } else {
          // Legacy v1 plaintext: still require current PIN to authorize import
          const legacy = parsed as SoftStepsLegacyBackup
          settingsIn = legacy.settings
          progressIn = legacy.progressByProfile ?? {}
          checkInsIn = legacy.checkIns ?? []
        }

        if (!settingsIn) {
          setSaved('Backup had no settings.')
          return
        }

        const nextSettings = validateRestoredSettings(settingsIn, settings)
        saveSettings(nextSettings)
        saveAllProgress(validateProgressMap(progressIn))
        replaceCheckInHistory(checkInsIn)
        setBackupPin('')
        setSaved('Backup restored — reloading…')
        window.setTimeout(() => window.location.reload(), 600)
      })()
    }
    reader.readAsText(file)
  }

  const saveActiveProfile = () => {
    if (!activeProfile) return
    const next: KidProfile = {
      ...activeProfile,
      name: editName.trim() || activeProfile.name,
      emoji: editEmoji || activeProfile.emoji,
      ageBand: settings.ageBand,
      home: settings.home,
      interestTheme: settings.interestTheme,
    }
    upsertProfile(next)
    setSaved(`Saved profile “${next.name}”.`)
  }

  const addSibling = () => {
    const id = newProfileId()
    const profile: KidProfile = {
      id,
      name: `Sibling ${settings.profiles.length + 1}`,
      emoji: PROFILE_EMOJIS[settings.profiles.length % PROFILE_EMOJIS.length],
      ageBand: '3-6',
      home: { ...DEFAULT_HOME, favorites: [...DEFAULT_HOME.favorites] },
      interestTheme: 'animals',
    }
    upsertProfile(profile)
    switchProfile(id)
    setSaved(`Added ${profile.name}. Progress starts fresh for them.`)
  }

  return (
    <section className="parent-dash">
      <header className="activity-header">
        <Link to="/" className="back-link">
          ← Home
        </Link>
        <div className="activity-meta">
          <p className="eyebrow">Parent / Teacher</p>
          <h1>Controls</h1>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            clearParentSession()
            navigate('/')
          }}
        >
          Lock
        </button>
      </header>

      <p className="fine-print session-timer" role="status">
        Grown-up session · locks in ~{Math.max(1, Math.ceil(remainingMs / 60_000))} min of idle or when
        the 15‑minute limit ends.
      </p>

      <div className="dash-grid">
        <article className="dash-card quiet-card">
          <h2>Quiet mode</h2>
          <p className="fine-print">
            One tap: mute celebrations, reduce motion, and soft muted colors.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              applyQuietMode()
              setSaved('Quiet mode on — celebrations muted, motion reduced, palette softened.')
            }}
          >
            Turn on quiet mode
          </button>
        </article>

        <article className="dash-card">
          <h2>Kid profiles</h2>
          <p className="fine-print">Siblings get their own age band, favorites, and practice progress.</p>
          <div className="toggle-row wrap">
            {settings.profiles.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`chip ${p.id === settings.activeProfileId ? 'is-active' : ''}`}
                onClick={() => switchProfile(p.id)}
              >
                {p.emoji} {p.name}
              </button>
            ))}
          </div>
          {activeProfile ? (
            <>
              <label className="field-label">
                Name
                <input
                  className="text-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </label>
              <p className="fine-print">Emoji</p>
              <div className="toggle-row wrap">
                {PROFILE_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    className={`chip ${editEmoji === em ? 'is-active' : ''}`}
                    onClick={() => setEditEmoji(em)}
                  >
                    {em}
                  </button>
                ))}
              </div>
              <div className="confirm-row">
                <button type="button" className="btn btn-secondary" onClick={saveActiveProfile}>
                  Save profile
                </button>
                <button type="button" className="btn btn-ghost" onClick={addSibling}>
                  + Add sibling
                </button>
                {settings.profiles.length > 1 ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      removeProfile(activeProfile.id)
                      setSaved('Profile removed.')
                    }}
                  >
                    Remove this profile
                  </button>
                ) : null}
              </div>
            </>
          ) : null}
        </article>

        <article className="dash-card insights-card">
          <h2>Parent insights</h2>
          <ul className="insights-stats">
            <li>
              <strong>{settings.careStats.routinesCompletedToday}</strong>
              <span>routines done today</span>
            </li>
            <li>
              <strong>{settings.careStats.routinesCompleted}</strong>
              <span>routines all time</span>
            </li>
            <li>
              <strong>{settings.routinePrefs.tokensEarned}</strong>
              <span>reward tokens</span>
            </li>
            <li>
              <strong>{checkIns.length}</strong>
              <span>saved check-ins</span>
            </li>
            <li>
              <strong>
                {Math.max(0, ...MODULE_LABELS.map((m) => progress[m.id].bestStreak))}
              </strong>
              <span>best practice streak</span>
            </li>
            <li>
              <strong>{settings.customAacCards.length}</strong>
              <span>family AAC phrases</span>
            </li>
          </ul>
          {settings.careStats.lastRoutineAt ? (
            <p className="fine-print">
              Last routine finished{' '}
              {new Date(settings.careStats.lastRoutineAt).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          ) : (
            <p className="fine-print">No routines finished yet — kids use Home → First / Then.</p>
          )}
          <div className="confirm-row">
            <button type="button" className="btn btn-secondary" onClick={exportInsights}>
              Export week (text)
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => void shareInsights()}>
              Share week summary
            </button>
          </div>
          <h3>Recent AAC check-ins</h3>
          {checkIns.length === 0 ? (
            <p>No check-ins yet. Kids can use Home → AAC &amp; check-in.</p>
          ) : (
            <ul className="checkin-history">
              {checkIns.slice(0, 5).map((c) => (
                <li key={c.at}>
                  <strong>
                    {c.feelingLabel} · {c.needLabel}
                  </strong>
                  <span className="fine-print">
                    {new Date(c.at).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                  <p>{c.sentence}</p>
                </li>
              ))}
            </ul>
          )}
          <h3>Practice streaks</h3>
          <ul className="progress-list">
            {MODULE_LABELS.map((m) => {
              const p = progress[m.id]
              return (
                <li key={m.id}>
                  <strong>{m.label}</strong>
                  <span>
                    ★ {p.bestStreak} · {p.correct}/{p.attempts || 0} correct
                    {p.lastPlayedAt
                      ? ` · ${new Date(p.lastPlayedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}`
                      : ''}
                  </span>
                </li>
              )
            })}
          </ul>
        </article>

        <article className="dash-card">
          <h2>Backup &amp; restore</h2>
          <p className="fine-print">
            Backups are AES‑GCM encrypted with your PIN. PIN hashes are never written into the file.
            On restore, this device keeps its current PIN.
          </p>
          <label className="field-label">
            PIN for encrypt / decrypt
            <input
              className="pin-input"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={backupPin}
              onChange={(e) => setBackupPin(e.target.value.replace(/\D/g, ''))}
              autoComplete="off"
              aria-label="Backup PIN"
            />
          </label>
          <div className="confirm-row">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => void exportBackup()}
            >
              Download encrypted backup
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => restoreRef.current?.click()}
            >
              Restore from file…
            </button>
            <input
              ref={restoreRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => onRestoreFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </article>

        <article className="dash-card">
          <h2>Routines by time of day</h2>
          <label className="check-line">
            <input
              type="checkbox"
              checked={settings.autoSwitchRoutines}
              onChange={(e) => updateSettings({ autoSwitchRoutines: e.target.checked })}
            />
            Auto-switch morning / after-school / bedtime by clock
          </label>
          <ul className="progress-list">
            {settings.routines.map((r) => {
              const hours = r.hours ?? ROUTINE_HOUR_PRESETS[r.templateId]
              return (
                <li key={r.id}>
                  <strong>
                    {r.title}
                    {r.id === settings.activeRoutineId ? ' · active' : ''}
                  </strong>
                  <span>
                    {hours.startHour}:00–{hours.endHour}:00
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="fine-print">
            Edit steps in First / Then → Builder. Soft Steps picks the matching window when
            auto-switch is on.
          </p>
        </article>

        <article className="dash-card">
          <h2>Age band & difficulty</h2>
          <div className="toggle-row">
            {(['3-6', '7-12'] as AgeBand[]).map((band) => (
              <button
                key={band}
                type="button"
                className={`chip ${settings.ageBand === band ? 'is-active' : ''}`}
                onClick={() => {
                  updateSettings({ ageBand: band })
                  setSaved(`Age band set to ${band}.`)
                }}
              >
                Ages {band}
              </button>
            ))}
          </div>
        </article>

        <article className="dash-card">
          <h2>Practice modules</h2>
          <ul className="module-toggles">
            {MODULE_LABELS.map((m) => (
              <li key={m.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.enabledModules[m.id]}
                    onChange={(e) => setEnabledModule(m.id, e.target.checked)}
                  />
                  {m.label}
                </label>
              </li>
            ))}
          </ul>
        </article>

        <article className="dash-card">
          <h2>Care & routines</h2>
          <ul className="module-toggles">
            {CARE_LABELS.map((m) => (
              <li key={m.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.enabledCareModules[m.id]}
                    onChange={(e) => setEnabledCareModule(m.id, e.target.checked)}
                  />
                  {m.label}
                </label>
              </li>
            ))}
          </ul>
        </article>

        <article className="dash-card">
          <h2>Online features</h2>
          <label className="check-line">
            <input
              type="checkbox"
              checked={settings.onlineExtrasEnabled}
              onChange={(e) => updateSettings({ onlineExtrasEnabled: e.target.checked })}
            />
            Enable all online extras
          </label>
          <ul className="module-toggles">
            {ONLINE_LABELS.map((a) => (
              <li key={a.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.enabledOnlineActivities[a.id]}
                    disabled={!settings.onlineExtrasEnabled}
                    onChange={(e) => setEnabledOnlineActivity(a.id, e.target.checked)}
                  />
                  {a.label}
                </label>
              </li>
            ))}
          </ul>
        </article>

        <article className="dash-card" id="accessibility">
          <h2>Accessibility</h2>
          <p className="fine-print">
            Vision, motion, sound, and tap size for the whole app. Changes apply right away.
          </p>

          <h3 className="dash-subhead">Vision</h3>
          <label className="check-line">
            <input
              type="checkbox"
              checked={settings.sensory.largeText}
              onChange={(e) =>
                updateSettings({ sensory: { ...settings.sensory, largeText: e.target.checked } })
              }
            />
            Larger text
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={settings.sensory.highContrast}
              onChange={(e) =>
                updateSettings({ sensory: { ...settings.sensory, highContrast: e.target.checked } })
              }
            />
            High contrast
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={settings.sensory.dimColors}
              onChange={(e) =>
                updateSettings({ sensory: { ...settings.sensory, dimColors: e.target.checked } })
              }
            />
            Dim colors
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={settings.sensory.mutedPalette}
              onChange={(e) =>
                updateSettings({
                  sensory: { ...settings.sensory, mutedPalette: e.target.checked },
                  routinePrefs: {
                    ...settings.routinePrefs,
                    mutedPalette: e.target.checked,
                  },
                })
              }
            />
            Muted palette
          </label>

          <h3 className="dash-subhead">Touch &amp; focus</h3>
          <label className="check-line">
            <input
              type="checkbox"
              checked={settings.sensory.largeTapTargets}
              onChange={(e) =>
                updateSettings({
                  sensory: { ...settings.sensory, largeTapTargets: e.target.checked },
                })
              }
            />
            Larger buttons / tap targets
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={settings.sensory.showFocusOutlines}
              onChange={(e) =>
                updateSettings({
                  sensory: { ...settings.sensory, showFocusOutlines: e.target.checked },
                })
              }
            />
            Always show focus outlines
          </label>

          <h3 className="dash-subhead">Motion</h3>
          <label className="check-line">
            <input
              type="checkbox"
              checked={settings.sensory.reducedMotion}
              onChange={(e) =>
                updateSettings({
                  sensory: { ...settings.sensory, reducedMotion: e.target.checked },
                })
              }
            />
            Reduced motion
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={settings.sensory.disableSuddenAnimations}
              onChange={(e) =>
                updateSettings({
                  sensory: { ...settings.sensory, disableSuddenAnimations: e.target.checked },
                })
              }
            />
            No sudden animations
          </label>

          <h3 className="dash-subhead">Sound</h3>
          <label className="check-line">
            <input
              type="checkbox"
              checked={settings.sensory.soundOn}
              onChange={(e) =>
                updateSettings({ sensory: { ...settings.sensory, soundOn: e.target.checked } })
              }
            />
            Soft sound / voice
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={settings.sensory.muteCelebrations}
              onChange={(e) =>
                updateSettings({
                  sensory: { ...settings.sensory, muteCelebrations: e.target.checked },
                  routinePrefs: {
                    ...settings.routinePrefs,
                    celebrateSounds: !e.target.checked,
                  },
                })
              }
            />
            Mute celebrations
          </label>
        </article>

        <article className="dash-card">
          <h2>Speaking voice</h2>
          <VoicePicker
            voiceURI={settings.sensory.voiceURI}
            voiceStyle={settings.sensory.voiceStyle}
            onChange={({ voiceURI, voiceStyle }) => {
              updateSettings({
                sensory: { ...settings.sensory, voiceURI, voiceStyle },
              })
              setSaved('Voice updated — tap Preview to hear it.')
            }}
          />
        </article>

        <article className="dash-card">
          <h2>Special interest</h2>
          <div className="toggle-row wrap">
            {INTERESTS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`chip ${settings.interestTheme === t.id ? 'is-active' : ''}`}
                onClick={() => {
                  updateSettings({
                    interestTheme: t.id,
                    interestChecklist: DEFAULT_INTEREST_CHECKLIST.map((c) => ({ ...c })),
                  })
                  setSaved(`Interest set to ${t.label}.`)
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              updateSettings({
                stories: SAMPLE_STORIES.map((s) => ({
                  ...s,
                  pages: s.pages.map((p) => ({ ...p })),
                })),
              })
              setSaved('Sample social stories restored.')
            }}
          >
            Reset sample stories
          </button>
          <p className="fine-print">
            Create brand-new stories with photos in What to expect → + New story.
          </p>
        </article>

        <article className="dash-card">
          <h2>Session limit</h2>
          <div className="toggle-row wrap">
            {[null, 10, 15, 20].map((mins) => (
              <button
                key={String(mins)}
                type="button"
                className={`chip ${settings.sessionLimitMinutes === mins ? 'is-active' : ''}`}
                onClick={() => {
                  updateSettings({ sessionLimitMinutes: mins })
                  unlockNewSession()
                  setSaved(mins ? `Session limit ${mins} minutes.` : 'Session limit cleared.')
                }}
              >
                {mins ? `${mins} min` : 'No limit'}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              unlockNewSession()
              setSaved('New session started.')
            }}
          >
            Start new session now
          </button>
        </article>

        <article className="dash-card">
          <h2>Practice progress</h2>
          <p className="fine-print">
            Showing progress for {activeProfile?.emoji} {activeProfile?.name ?? 'this kid'}.
          </p>
          <ul className="progress-list">
            {MODULE_LABELS.map((m) => {
              const p = progress[m.id]
              const rate = p.attempts ? Math.round((p.correct / p.attempts) * 100) : 0
              return (
                <li key={m.id}>
                  <strong>{m.label}</strong>
                  <span>
                    {p.correct}/{p.attempts} correct ({rate}%) · best streak {p.bestStreak}
                  </span>
                </li>
              )
            })}
          </ul>
          {!confirmReset ? (
            <button type="button" className="btn btn-ghost" onClick={() => setConfirmReset(true)}>
              Reset practice progress…
            </button>
          ) : (
            <div className="confirm-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  resetProgress()
                  setConfirmReset(false)
                  setSaved('Practice progress cleared for this profile.')
                }}
              >
                Yes, reset
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </div>
          )}
        </article>

        <article className="dash-card">
          <h2>Change PIN</h2>
          {settings.pinIsDefault ? (
            <p className="form-error">Still using the first-time default — change it now.</p>
          ) : (
            <p>PIN is hashed with PBKDF2. Soft Steps never stores the digits in plain text.</p>
          )}
          <form onSubmit={(e) => void onSavePin(e)} className="pin-form inline">
            <input
              className="pin-input"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              aria-label="New PIN"
              autoComplete="new-password"
            />
            <button type="submit" className="btn btn-secondary">
              Save PIN
            </button>
          </form>
        </article>

        <article className="dash-card security-card">
          <h2>Security & payments</h2>
          <p>
            Card numbers never touch Soft Steps. Support payments use Stripe-hosted Checkout only.
            Purchases require Wi‑Fi — they cannot start offline.
          </p>
          <Link to="/parent/billing" className="btn btn-primary">
            Open secure billing
          </Link>
          <Link to="/privacy" className="btn btn-ghost" style={{ marginTop: '0.5rem' }}>
            Privacy for stores
          </Link>
        </article>
      </div>

      {saved ? (
        <p className="save-toast" role="status">
          {saved}
        </p>
      ) : null}
    </section>
  )
}
