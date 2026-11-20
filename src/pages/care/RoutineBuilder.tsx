import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LockedGate } from '../../components/ParentLock'
import { REWARD_STICKERS, ROUTINE_TEMPLATES, STEP_ICONS, routineFromTemplate } from '../../data/routines'
import { useApp } from '../../store/AppContext'
import type { RewardTheme, Routine, RoutineStep, RoutineTemplateId } from '../../types'

const UNLOCK_KEY = 'soft-steps-routine-builder-ok'

/** Screen C — Parent Routine Builder (math / hold gate) */
export function RoutineBuilder() {
  const navigate = useNavigate()
  const { settings, updateSettings } = useApp()
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(UNLOCK_KEY) === '1',
  )
  const [dragId, setDragId] = useState<string | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

  const routine =
    settings.routines.find((r) => r.id === settings.activeRoutineId) ?? settings.routines[0]

  const saveRoutine = (next: Routine) => {
    const routines = settings.routines.map((r) => (r.id === next.id ? next : r))
    if (!routines.some((r) => r.id === next.id)) routines.push(next)
    updateSettings({
      routines,
      activeRoutineId: next.id,
      routinePrefs: { ...settings.routinePrefs, stepIndex: 0 },
    })
  }

  const applyTemplate = (id: RoutineTemplateId) => {
    const created = routineFromTemplate(id)
    updateSettings({
      routines: [...settings.routines.filter((r) => r.templateId !== id), created],
      activeRoutineId: created.id,
      routinePrefs: { ...settings.routinePrefs, stepIndex: 0 },
    })
  }

  const updateStep = (stepId: string, patch: Partial<RoutineStep>) => {
    if (!routine) return
    saveRoutine({
      ...routine,
      steps: routine.steps.map((s) => (s.id === stepId ? { ...s, ...patch } : s)),
    })
  }

  const moveStep = (fromId: string, toId: string) => {
    if (!routine || fromId === toId) return
    const steps = [...routine.steps]
    const from = steps.findIndex((s) => s.id === fromId)
    const to = steps.findIndex((s) => s.id === toId)
    if (from < 0 || to < 0) return
    const [item] = steps.splice(from, 1)
    steps.splice(to, 0, item)
    saveRoutine({ ...routine, steps })
  }

  const addStep = () => {
    if (!routine) return
    const icon = STEP_ICONS[0]
    saveRoutine({
      ...routine,
      steps: [
        ...routine.steps,
        {
          id: `step-${Date.now()}`,
          label: icon.label,
          emoji: icon.emoji,
          timerSeconds: 60,
          voiceText: icon.label,
        },
      ],
    })
  }

  const removeStep = (stepId: string) => {
    if (!routine || routine.steps.length <= 1) return
    saveRoutine({
      ...routine,
      steps: routine.steps.filter((s) => s.id !== stepId),
    })
  }

  const readFile = (file: File, cb: (dataUrl: string) => void) => {
    const reader = new FileReader()
    reader.onload = () => cb(String(reader.result))
    reader.readAsDataURL(file)
  }

  const startRecording = async (stepId: string) => {
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
        readFile(new File([blob], 'voice.webm', { type: blob.type }), (dataUrl) => {
          updateStep(stepId, { voiceDataUrl: dataUrl })
        })
        stream.getTracks().forEach((t) => t.stop())
      }
      rec.start()
      window.setTimeout(() => {
        if (rec.state === 'recording') rec.stop()
      }, 4000)
    } catch {
      /* mic unavailable — TTS voiceText still works */
    }
  }

  return (
    <section className="care-page routine-builder">
      <LockedGate
        unlocked={unlocked}
        onUnlock={() => {
          sessionStorage.setItem(UNLOCK_KEY, '1')
          setUnlocked(true)
        }}
        onCancel={() => navigate('/schedule')}
      >
        <header className="activity-header">
          <Link to="/schedule" className="back-link">
            ← Routine
          </Link>
          <div className="activity-meta">
            <p className="eyebrow">Parent builder</p>
            <h1>Routine builder</h1>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              sessionStorage.removeItem(UNLOCK_KEY)
              setUnlocked(false)
            }}
          >
            Lock
          </button>
        </header>

        <article className="dash-card">
          <h2>Templates</h2>
          <div className="tool-picker wrap">
            {ROUTINE_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`chip ${routine?.templateId === t.id ? 'is-active' : ''}`}
                onClick={() => applyTemplate(t.id)}
              >
                {t.title}
              </button>
            ))}
          </div>
          <p className="fine-print">Morning · Bedtime · Leaving the House</p>
        </article>

        <article className="dash-card">
          <h2>Steps (drag to reorder)</h2>
          <ul className="builder-steps">
            {routine?.steps.map((step) => (
              <li
                key={step.id}
                className="builder-step"
                draggable
                onDragStart={() => setDragId(step.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragId) moveStep(dragId, step.id)
                  setDragId(null)
                }}
              >
                <div className="builder-step-main">
                  {step.photoDataUrl ? (
                    <img src={step.photoDataUrl} alt="" className="builder-thumb" />
                  ) : (
                    <span className="builder-emoji">{step.emoji}</span>
                  )}
                  <input
                    className="builder-label"
                    value={step.label}
                    onChange={(e) => updateStep(step.id, { label: e.target.value, voiceText: e.target.value })}
                    aria-label="Step label"
                  />
                </div>

                <div className="builder-actions">
                  <label className="btn btn-ghost upload-btn">
                    Photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) readFile(file, (dataUrl) => updateStep(step.id, { photoDataUrl: dataUrl }))
                      }}
                    />
                  </label>
                  <select
                    aria-label="Icon"
                    value={STEP_ICONS.find((i) => i.emoji === step.emoji)?.id ?? ''}
                    onChange={(e) => {
                      const icon = STEP_ICONS.find((i) => i.id === e.target.value)
                      if (icon) updateStep(step.id, { emoji: icon.emoji, label: step.label || icon.label })
                    }}
                  >
                    <option value="">Icon</option>
                    {STEP_ICONS.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.emoji} {i.label}
                      </option>
                    ))}
                  </select>
                  <button type="button" className="btn btn-ghost" onClick={() => startRecording(step.id)}>
                    {step.voiceDataUrl ? 'Re-record' : 'Record voice'}
                  </button>
                  <label>
                    Timer
                    <select
                      value={step.timerSeconds}
                      onChange={(e) => updateStep(step.id, { timerSeconds: Number(e.target.value) })}
                    >
                      {[30, 45, 60, 90, 120, 180].map((s) => (
                        <option key={s} value={s}>
                          {s}s
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="button" className="btn btn-ghost" onClick={() => removeStep(step.id)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn-secondary" onClick={addStep}>
            Add step
          </button>
        </article>

        <article className="dash-card">
          <h2>Then reward</h2>
          {routine ? (
            <div className="builder-actions">
              <input
                className="builder-label"
                value={routine.thenReward.label}
                onChange={(e) =>
                  saveRoutine({
                    ...routine,
                    thenReward: { ...routine.thenReward, label: e.target.value },
                  })
                }
                aria-label="Reward label"
              />
              <label className="btn btn-ghost upload-btn">
                Reward photo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file || !routine) return
                    readFile(file, (dataUrl) =>
                      saveRoutine({
                        ...routine,
                        thenReward: { ...routine.thenReward, photoDataUrl: dataUrl },
                      }),
                    )
                  }}
                />
              </label>
            </div>
          ) : null}
        </article>

        <article className="dash-card">
          <h2>Sensory (routine)</h2>
          <label className="check-line">
            <input
              type="checkbox"
              checked={settings.routinePrefs.celebrateSounds}
              onChange={(e) =>
                updateSettings({
                  routinePrefs: { ...settings.routinePrefs, celebrateSounds: e.target.checked },
                })
              }
            />
            Celebratory sounds on “All Done”
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={settings.routinePrefs.reduceBrightness}
              onChange={(e) =>
                updateSettings({
                  routinePrefs: { ...settings.routinePrefs, reduceBrightness: e.target.checked },
                })
              }
            />
            Reduce brightness
          </label>
          <label className="check-line">
            <input
              type="checkbox"
              checked={settings.routinePrefs.mutedPalette}
              onChange={(e) =>
                updateSettings({
                  routinePrefs: { ...settings.routinePrefs, mutedPalette: e.target.checked },
                })
              }
            />
            Muted palette
          </label>
          <div className="tool-picker wrap">
            {(['trains', 'space', 'animals'] as RewardTheme[]).map((theme) => (
              <button
                key={theme}
                type="button"
                className={`chip ${settings.routinePrefs.rewardTheme === theme ? 'is-active' : ''}`}
                onClick={() =>
                  updateSettings({
                    routinePrefs: { ...settings.routinePrefs, rewardTheme: theme },
                  })
                }
              >
                {REWARD_STICKERS[theme][0]} {theme}
              </button>
            ))}
          </div>
        </article>

        <div className="confirm-row">
          <Link className="btn btn-primary" to="/schedule">
            Open child routine
          </Link>
          <Link className="btn btn-secondary" to="/schedule/board">
            First / Then view
          </Link>
        </div>
      </LockedGate>
    </section>
  )
}
