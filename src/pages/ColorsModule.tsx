import { useMemo, useState } from 'react'
import { ActivityShell } from '../components/ActivityShell'
import { ChoiceGrid } from '../components/ChoiceGrid'
import { colorPool } from '../data/colors'
import { playCorrect, playGentleNudge, playTap } from '../audio/feedback'
import { useApp } from '../store/AppContext'
import { choiceCount, pickChoices, shuffle } from '../utils/quiz'

export function ColorsModule() {
  const { settings, recordAnswer } = useApp()
  const pool = useMemo(() => colorPool(settings.ageBand), [settings.ageBand])
  const count = choiceCount(settings.ageBand)

  const makeRound = () => {
    const next = shuffle(pool)[0]
    return { target: next, choices: pickChoices(pool, next, count, (c) => c.id) }
  }

  const [round, setRound] = useState(makeRound)
  const [streak, setStreak] = useState(0)
  const [tone, setTone] = useState<'idle' | 'good' | 'try'>('idle')
  const [message, setMessage] = useState('Tap the color that matches.')
  const [locked, setLocked] = useState(false)

  const nextRound = () => {
    setRound(makeRound())
    setTone('idle')
    setMessage('Tap the color that matches.')
    setLocked(false)
  }

  const onPick = (id: string) => {
    if (locked) return
    playTap(settings.sensory.soundOn)
    const correct = id === round.target.id
    if (correct) {
      const nextStreak = streak + 1
      setStreak(nextStreak)
      setTone('good')
      setMessage(`Great — ${round.target.name}!`)
      playCorrect(settings.sensory.soundOn)
      recordAnswer('colors', true, nextStreak)
      setLocked(true)
      window.setTimeout(nextRound, settings.sensory.reducedMotion ? 500 : 900)
    } else {
      setStreak(0)
      setTone('try')
      setMessage('Try a different color.')
      playGentleNudge(settings.sensory.soundOn)
      recordAnswer('colors', false, 0)
    }
  }

  return (
    <ActivityShell
      title="Colors"
      prompt={
        settings.ageBand === '3-6'
          ? 'Match the swatch.'
          : `Find ${round.target.name.toLowerCase()}.`
      }
      feedbackTone={tone}
      feedbackMessage={message}
      streak={streak}
      badge={
        <div className="target-card color-target">
          <span
            className="color-swatch large"
            style={{ background: round.target.hex }}
            aria-label={round.target.name}
          />
          {settings.ageBand === '3-6' ? (
            <span className="target-word">{round.target.name}</span>
          ) : null}
        </div>
      }
    >
      <ChoiceGrid columns={2}>
        {round.choices.map((color) => (
          <button
            key={color.id}
            type="button"
            className="choice-btn color-choice"
            onClick={() => onPick(color.id)}
            disabled={locked}
            aria-label={color.name}
          >
            <span className="color-swatch" style={{ background: color.hex }} />
            {settings.ageBand === '7-12' ? <span>{color.name}</span> : null}
          </button>
        ))}
      </ChoiceGrid>
    </ActivityShell>
  )
}
