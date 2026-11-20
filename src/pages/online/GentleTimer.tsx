import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { OnlineShell } from '../../components/OnlineShell'
import { playCorrect, playGentleNudge, playTap } from '../../audio/feedback'
import { useOnlinePack } from '../../hooks/useOnlinePack'
import { useApp } from '../../store/AppContext'
import { shuffle } from '../../utils/quiz'

const ROUND_SECONDS = 45
const TARGET_CORRECT = 3

export function GentleTimer() {
  const { settings } = useApp()
  const { state, reload } = useOnlinePack()
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS)
  const [running, setRunning] = useState(false)
  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [tone, setTone] = useState<'idle' | 'good' | 'try'>('idle')
  const [message, setMessage] = useState('A calm timed round — no rush.')
  const [finished, setFinished] = useState(false)
  const [locked, setLocked] = useState(false)

  const choiceCount = settings.ageBand === '3-6' ? 2 : 4
  const items = state.status === 'ready' ? state.pack.gentleRounds : []
  const item = items.length ? items[index % items.length] : null

  const choices = useMemo(() => {
    if (!item) return []
    const others = shuffle(item.choices.filter((c) => c !== item.answer))
    return shuffle([item.answer, ...others]).slice(0, choiceCount)
  }, [item, choiceCount, index])

  useEffect(() => {
    if (!running || finished) return
    if (secondsLeft <= 0) {
      setFinished(true)
      setRunning(false)
      setMessage(
        correctCount >= TARGET_CORRECT
          ? 'Session complete — wonderful pacing.'
          : 'Time for a soft pause. You can try again anytime.',
      )
      return
    }
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(id)
  }, [running, secondsLeft, finished, correctCount])

  if (!settings.enabledOnlineActivities['gentle-timer']) {
    return <Navigate to="/online" replace />
  }

  if (state.status === 'offline') {
    return <OnlineShell title="Gentle timer" requireOnline>{null}</OnlineShell>
  }

  if (state.status === 'loading') {
    return (
      <OnlineShell title="Gentle timer">
        <p className="loading-note">Loading timed challenge pack…</p>
      </OnlineShell>
    )
  }

  if (state.status === 'error') {
    return (
      <OnlineShell title="Gentle timer">
        <p>{state.message}</p>
        <button type="button" className="btn btn-secondary" onClick={reload}>
          Try again
        </button>
      </OnlineShell>
    )
  }

  const progressPct = Math.max(0, (secondsLeft / ROUND_SECONDS) * 100)

  const restart = () => {
    setSecondsLeft(ROUND_SECONDS)
    setRunning(true)
    setIndex(0)
    setCorrectCount(0)
    setTone('idle')
    setMessage('Steady and calm — find the answers.')
    setFinished(false)
    setLocked(false)
  }

  return (
    <OnlineShell
      title="Gentle timer"
      meta={
        <span className="timer-pill" aria-live="polite">
          {finished ? 'Done' : `${secondsLeft}s`}
        </span>
      }
    >
      <p className="prompt">
        Soft timed practice: get {TARGET_CORRECT} correct before the calm timer ends. No loud
        countdowns — just a quiet bar.
      </p>

      <div className="gentle-timer-track" aria-hidden="true">
        <div className="gentle-timer-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {!running && !finished ? (
        <button type="button" className="btn btn-primary" onClick={restart}>
          Start gentle round
        </button>
      ) : null}

      {running && item && !finished ? (
        <>
          <p className="online-kind-pill">
            {correctCount}/{TARGET_CORRECT} correct
          </p>
          <p className="prompt">{item.prompt}</p>
          <div className="choice-grid cols-2">
            {choices.map((choice) => (
              <button
                key={choice}
                type="button"
                className="choice-btn"
                disabled={locked}
                onClick={() => {
                  playTap(settings.sensory.soundOn)
                  if (choice === item.answer) {
                    const nextCorrect = correctCount + 1
                    setCorrectCount(nextCorrect)
                    setTone('good')
                    setMessage('Lovely.')
                    playCorrect(settings.sensory.soundOn)
                    setLocked(true)
                    if (nextCorrect >= TARGET_CORRECT) {
                      setFinished(true)
                      setRunning(false)
                      setMessage('You reached the goal — nice and steady.')
                      return
                    }
                    window.setTimeout(() => {
                      setIndex((i) => i + 1)
                      setTone('idle')
                      setMessage('Keep going gently.')
                      setLocked(false)
                    }, settings.sensory.reducedMotion ? 400 : 750)
                  } else {
                    setTone('try')
                    setMessage('No hurry — try again.')
                    playGentleNudge(settings.sensory.soundOn)
                  }
                }}
              >
                {choice}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {finished ? (
        <div className="online-panel">
          <p>{message}</p>
          <button type="button" className="btn btn-secondary" onClick={restart}>
            Play another calm round
          </button>
        </div>
      ) : (
        <div className={`feedback feedback-${tone}`}>{message}</div>
      )}

      <Link to="/online" className="btn btn-ghost">
        Back to hub
      </Link>
    </OnlineShell>
  )
}
