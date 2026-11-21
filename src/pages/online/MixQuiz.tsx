import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { OnlineShell } from '../../components/OnlineShell'
import { playCorrect, playGentleNudge, playTap } from '../../audio/feedback'
import { useOnlinePack } from '../../hooks/useOnlinePack'
import { useApp } from '../../store/AppContext'
import { shuffle } from '../../utils/quiz'

export function MixQuiz() {
  const { settings } = useApp()
  const { state, reload } = useOnlinePack()
  const [index, setIndex] = useState(0)
  const [streak, setStreak] = useState(0)
  const [tone, setTone] = useState<'idle' | 'good' | 'try'>('idle')
  const [message, setMessage] = useState('Take your time.')
  const [locked, setLocked] = useState(false)

  const choiceCount = settings.ageBand === '3-6' ? 2 : 4
  const items = state.status === 'ready' ? state.pack.mixQuiz : []
  const item = items.length ? items[index % items.length] : null

  const choices = useMemo(() => {
    if (!item) return []
    const pool = shuffle(item.choices)
    const others = pool.filter((c) => c !== item.answer)
    return shuffle([item.answer, ...others]).slice(0, choiceCount)
  }, [item, choiceCount, index])

  useEffect(() => {
    setTone('idle')
    setMessage('Take your time.')
    setLocked(false)
  }, [index])

  if (!settings.enabledOnlineActivities['mix-quiz']) {
    return <Navigate to="/online" replace />
  }

  if (state.status === 'loading') {
    return (
      <OnlineShell title="Mix quiz">
        <p className="loading-note">Loading quiz pack…</p>
      </OnlineShell>
    )
  }

  if (state.status === 'error') {
    return (
      <OnlineShell title="Mix quiz">
        <p>{state.message}</p>
        <button type="button" className="btn btn-secondary" onClick={reload}>
          Try again
        </button>
      </OnlineShell>
    )
  }

  if (!item) {
    return (
      <OnlineShell title="Mix quiz">
        <p>No quiz items in this pack.</p>
      </OnlineShell>
    )
  }

  const next = () => setIndex((i) => i + 1)

  return (
    <OnlineShell title="Mix quiz" meta={<div className="streak-pill">★ {streak}</div>}>
      <p className="online-kind-pill">{item.kind}</p>
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
                setStreak((s) => s + 1)
                setTone('good')
                setMessage('Nice work!')
                playCorrect(settings.sensory.soundOn)
                setLocked(true)
                window.setTimeout(next, settings.sensory.reducedMotion ? 450 : 850)
              } else {
                setStreak(0)
                setTone('try')
                setMessage('Almost — try another.')
                playGentleNudge(settings.sensory.soundOn)
              }
            }}
          >
            {choice}
          </button>
        ))}
      </div>
      <div className={`feedback feedback-${tone}`}>{message}</div>
      <p className="fine-print">
        Pack loaded from network demo · {new Date(state.pack.fetchedAt).toLocaleTimeString()}
      </p>
      <Link to="/online" className="btn btn-ghost">
        Back to hub
      </Link>
    </OnlineShell>
  )
}
