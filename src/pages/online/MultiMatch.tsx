import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { OnlineShell } from '../../components/OnlineShell'
import { playCorrect, playGentleNudge, playTap } from '../../audio/feedback'
import { useOnlinePack } from '../../hooks/useOnlinePack'
import { useApp } from '../../store/AppContext'
import { shuffle } from '../../utils/quiz'

export function MultiMatch() {
  const { settings } = useApp()
  const { state, reload } = useOnlinePack()
  const [seqIndex, setSeqIndex] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [tone, setTone] = useState<'idle' | 'good' | 'try'>('idle')
  const [message, setMessage] = useState('Complete each step in order.')
  const [locked, setLocked] = useState(false)
  const [completed, setCompleted] = useState(0)

  const choiceCount = settings.ageBand === '3-6' ? 2 : 4
  const sequences = state.status === 'ready' ? state.pack.matchSequences : []
  const sequence = sequences.length ? sequences[seqIndex % sequences.length] : null
  const step = sequence ? sequence.steps[stepIndex] : null

  const choices = useMemo(() => {
    if (!step) return []
    const others = shuffle(step.choices.filter((c) => c !== step.answer))
    return shuffle([step.answer, ...others]).slice(0, choiceCount)
  }, [step, choiceCount, seqIndex, stepIndex])

  if (!settings.enabledOnlineActivities['multi-match']) {
    return <Navigate to="/online" replace />
  }

  if (state.status === 'loading') {
    return (
      <OnlineShell title="Multi-step match">
        <p className="loading-note">Loading matching paths…</p>
      </OnlineShell>
    )
  }

  if (state.status === 'error') {
    return (
      <OnlineShell title="Multi-step match">
        <p>{state.message}</p>
        <button type="button" className="btn btn-secondary" onClick={reload}>
          Try again
        </button>
      </OnlineShell>
    )
  }

  if (!sequence || !step) {
    return (
      <OnlineShell title="Multi-step match">
        <p>No sequences in this pack.</p>
      </OnlineShell>
    )
  }

  const totalSteps = sequence.steps.length

  const nextSequence = () => {
    setSeqIndex((i) => i + 1)
    setStepIndex(0)
    setTone('idle')
    setMessage('New path — start at step 1.')
    setLocked(false)
  }

  return (
    <OnlineShell
      title="Multi-step match"
      meta={
        <span className="age-badge">
          Step {stepIndex + 1}/{totalSteps}
        </span>
      }
    >
      <p className="prompt">{sequence.title}</p>
      <ol className="step-rail" aria-label="Progress">
        {sequence.steps.map((s, i) => (
          <li key={s.id} className={i < stepIndex ? 'is-done' : i === stepIndex ? 'is-current' : ''}>
            {i + 1}
          </li>
        ))}
      </ol>

      <div className="target-card">
        <p className="prompt" style={{ margin: 0 }}>
          {step.prompt}
        </p>
      </div>

      <div className="choice-grid cols-2">
        {choices.map((choice) => (
          <button
            key={choice}
            type="button"
            className="choice-btn"
            disabled={locked}
            onClick={() => {
              playTap(settings.sensory.soundOn)
              if (choice === step.answer) {
                playCorrect(settings.sensory.soundOn)
                setLocked(true)
                if (stepIndex + 1 >= totalSteps) {
                  setCompleted((c) => c + 1)
                  setTone('good')
                  setMessage('Path complete — you finished every step.')
                  window.setTimeout(nextSequence, settings.sensory.reducedMotion ? 500 : 1000)
                } else {
                  setTone('good')
                  setMessage('Step done — next one when you’re ready.')
                  window.setTimeout(() => {
                    setStepIndex((i) => i + 1)
                    setTone('idle')
                    setMessage('Keep going one step at a time.')
                    setLocked(false)
                  }, settings.sensory.reducedMotion ? 400 : 800)
                }
              } else {
                setTone('try')
                setMessage('Stay on this step — try another choice.')
                playGentleNudge(settings.sensory.soundOn)
              }
            }}
          >
            {choice}
          </button>
        ))}
      </div>

      <div className={`feedback feedback-${tone}`}>{message}</div>
      <p className="fine-print">Paths completed this visit: {completed}</p>
      <Link to="/online" className="btn btn-ghost">
        Back to hub
      </Link>
    </OnlineShell>
  )
}
