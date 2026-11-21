import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { speakText } from '../../audio/calmAudio'
import { playCorrect } from '../../audio/feedback'
import { REWARD_STICKERS } from '../../data/routines'
import { useApp } from '../../store/AppContext'

/** Screen A — Child Active Routine */
export function RoutineActive() {
  const { settings, updateSettings } = useApp()
  const routine =
    settings.routines.find((r) => r.id === settings.activeRoutineId) ?? settings.routines[0]
  const prefs = settings.routinePrefs
  const stepIndex = Math.min(prefs.stepIndex, Math.max(0, (routine?.steps.length ?? 1) - 1))
  const step = routine?.steps[stepIndex]
  const remaining = routine ? Math.max(0, routine.steps.length - stepIndex) : 0
  const [secondsLeft, setSecondsLeft] = useState(step?.timerSeconds ?? 60)
  const [celebrating, setCelebrating] = useState(false)
  const [finished, setFinished] = useState(false)
  const [rewardSticker, setRewardSticker] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const motionOff =
    settings.sensory.reducedMotion || settings.sensory.disableSuddenAnimations

  useEffect(() => {
    setSecondsLeft(step?.timerSeconds ?? 60)
    setCelebrating(false)
  }, [step?.id, step?.timerSeconds])

  useEffect(() => {
    if (celebrating || finished || !step) return
    if (secondsLeft <= 0) return // silent end — no alarm
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(id)
  }, [secondsLeft, celebrating, finished, step])

  const total = step?.timerSeconds || 1
  const pct = Math.max(0, (secondsLeft / total) * 100)

  const stars = useMemo(
    () => Array.from({ length: routine?.steps.length ?? 0 }, (_, i) => i < stepIndex),
    [routine?.steps.length, stepIndex],
  )

  if (!routine || !step) {
    return (
      <section className="routine-active">
        <Link to="/" className="back-link">
          ← Talk
        </Link>
        <p>No routine yet. Ask a grown-up to open the builder.</p>
        <Link className="btn btn-primary" to="/schedule/builder">
          Builder
        </Link>
      </section>
    )
  }

  const playVoice = () => {
    if (step.voiceDataUrl) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(step.voiceDataUrl)
      audioRef.current = audio
      void audio.play().catch(() => {
        speakText(step.voiceText || step.label, settings.sensory.soundOn)
      })
      return
    }
    speakText(step.voiceText || step.label, settings.sensory.soundOn)
  }

  const completeStep = () => {
    setCelebrating(true)
    if (
      prefs.celebrateSounds &&
      settings.sensory.soundOn &&
      !settings.sensory.muteCelebrations
    ) {
      playCorrect(true)
    }
    const delay = motionOff ? 400 : 900
    window.setTimeout(() => {
      const nextIndex = stepIndex + 1
      if (nextIndex >= routine.steps.length) {
        const pool = REWARD_STICKERS[prefs.rewardTheme]
        const sticker = pool[Math.floor(Math.random() * pool.length)]
        setRewardSticker(sticker)
        setFinished(true)
        setCelebrating(false)
        {
          const dayKey = new Date().toISOString().slice(0, 10)
          const prev = settings.careStats
          const sameDay = prev.routinesDayKey === dayKey
          updateSettings({
            routinePrefs: {
              ...prefs,
              stepIndex: 0,
              tokensEarned: prefs.tokensEarned + 1,
              stickers: [...prefs.stickers, sticker].slice(-24),
            },
            careStats: {
              routinesCompleted: prev.routinesCompleted + 1,
              routinesCompletedToday: sameDay ? prev.routinesCompletedToday + 1 : 1,
              routinesDayKey: dayKey,
              lastRoutineAt: new Date().toISOString(),
            },
          })
        }
        return
      }
      updateSettings({
        routinePrefs: { ...prefs, stepIndex: nextIndex },
      })
      setCelebrating(false)
    }, delay)
  }

  return (
    <section
      className={`routine-active ${prefs.mutedPalette ? 'is-muted-palette' : ''} ${
        prefs.reduceBrightness ? 'is-dim-bright' : ''
      }`}
    >
      <header className="routine-top">
        <Link to="/" className="back-link">
          ← Talk
        </Link>
        <div className="star-row" aria-label={`${remaining} steps remaining`}>
          {stars.map((done, i) => (
            <span key={i} className={`star ${done ? 'is-done' : ''}`} aria-hidden="true">
              ★
            </span>
          ))}
        </div>
        <Link to="/schedule/board" className="btn btn-ghost">
          First/Then
        </Link>
      </header>

      {finished ? (
        <div className="routine-finish">
          <p className="brand-lite">All done</p>
          <div className="reward-burst" aria-live="polite">
            <span className="reward-emoji">{rewardSticker}</span>
            <p>You earned a {prefs.rewardTheme} token.</p>
          </div>
          <div className="confirm-row">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setFinished(false)
                setRewardSticker(null)
              }}
            >
              Start again
            </button>
            <Link to="/schedule/board" className="btn btn-secondary">
              See First / Then
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="routine-center">
            <article className={`task-hero ${celebrating ? 'is-celebrate' : ''}`}>
              {step.photoDataUrl ? (
                <img src={step.photoDataUrl} alt="" className="task-hero-photo" />
              ) : (
                <div className="task-hero-emoji" aria-hidden="true">
                  {step.emoji}
                </div>
              )}
              <h1>{step.label}</h1>
              <button type="button" className="btn btn-secondary" onClick={playVoice}>
                Play voice
              </button>
            </article>
          </div>

          <div className="routine-bottom">
            <div className="routine-bottom-spacer" />
            <button
              type="button"
              className="btn btn-primary all-done-btn"
              onClick={completeStep}
              disabled={celebrating}
            >
              All Done
            </button>
            <div
              className="pie-timer soft-pie"
              style={{
                background: `conic-gradient(var(--accent) ${pct * 3.6}deg, rgba(74,99,90,0.14) 0)`,
              }}
              aria-label="Visual timer"
              title="Quiet visual timer — no alarm"
            >
              <div className="pie-hole">{Math.max(0, secondsLeft)}</div>
            </div>
          </div>
        </>
      )}

      <Link to="/schedule/builder" className="builder-peek">
        Grown-ups
      </Link>
    </section>
  )
}
