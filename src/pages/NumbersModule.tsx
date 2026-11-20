import { useMemo, useState } from 'react'
import { ActivityShell } from '../components/ActivityShell'
import { ChoiceGrid } from '../components/ChoiceGrid'
import { numberPool } from '../data/numbers'
import { playCorrect, playGentleNudge, playTap } from '../audio/feedback'
import { useApp } from '../store/AppContext'
import { choiceCount, pickChoices, shuffle } from '../utils/quiz'

export function NumbersModule() {
  const { settings, recordAnswer } = useApp()
  const pool = useMemo(() => numberPool(settings.ageBand), [settings.ageBand])
  const count = choiceCount(settings.ageBand)

  const makeRound = () => {
    const next = shuffle(pool)[0]
    return { target: next, choices: pickChoices(pool, next, count, (n) => String(n)) }
  }

  const [round, setRound] = useState(makeRound)
  const [streak, setStreak] = useState(0)
  const [tone, setTone] = useState<'idle' | 'good' | 'try'>('idle')
  const [message, setMessage] = useState('How many dots?')
  const [locked, setLocked] = useState(false)

  const nextRound = () => {
    setRound(makeRound())
    setTone('idle')
    setMessage(settings.ageBand === '3-6' ? 'How many dots?' : 'Choose the number.')
    setLocked(false)
  }

  const onPick = (n: number) => {
    if (locked) return
    playTap(settings.sensory.soundOn)
    const correct = n === round.target
    if (correct) {
      const nextStreak = streak + 1
      setStreak(nextStreak)
      setTone('good')
      setMessage(`Yes — ${round.target}!`)
      playCorrect(settings.sensory.soundOn)
      recordAnswer('numbers', true, nextStreak)
      setLocked(true)
      window.setTimeout(nextRound, settings.sensory.reducedMotion ? 500 : 900)
    } else {
      setStreak(0)
      setTone('try')
      setMessage('Count again carefully.')
      playGentleNudge(settings.sensory.soundOn)
      recordAnswer('numbers', false, 0)
    }
  }

  const dots = Array.from({ length: round.target }, (_, i) => i)

  return (
    <ActivityShell
      title="Numbers"
      prompt={settings.ageBand === '3-6' ? 'Count the dots, then tap the number.' : 'What number do you see?'}
      feedbackTone={tone}
      feedbackMessage={message}
      streak={streak}
      badge={
        <div className="target-card number-target" aria-label={`${round.target} dots`}>
          {settings.ageBand === '3-6' || round.target <= 10 ? (
            <div className="dot-grid">
              {dots.map((d) => (
                <span key={d} className="dot" />
              ))}
            </div>
          ) : (
            <span className="big-number">{round.target}</span>
          )}
        </div>
      }
    >
      <ChoiceGrid columns={2}>
        {round.choices.map((n) => (
          <button
            key={n}
            type="button"
            className="choice-btn number-choice"
            onClick={() => onPick(n)}
            disabled={locked}
          >
            {n}
          </button>
        ))}
      </ChoiceGrid>
    </ActivityShell>
  )
}
