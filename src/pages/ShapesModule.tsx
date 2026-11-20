import { useMemo, useState } from 'react'
import { ActivityShell } from '../components/ActivityShell'
import { ChoiceGrid } from '../components/ChoiceGrid'
import { shapePool, type ShapeItem } from '../data/shapes'
import { playCorrect, playGentleNudge, playTap } from '../audio/feedback'
import { useApp } from '../store/AppContext'
import { choiceCount, pickChoices, shuffle } from '../utils/quiz'

function ShapeSvg({ shape, fill = '#3661B0' }: { shape: ShapeItem; fill?: string }) {
  return (
    <svg viewBox="0 0 100 100" className="shape-svg" aria-hidden="true">
      <path d={shape.path} fill={fill} />
    </svg>
  )
}

export function ShapesModule() {
  const { settings, recordAnswer } = useApp()
  const pool = useMemo(() => shapePool(settings.ageBand), [settings.ageBand])
  const count = choiceCount(settings.ageBand)

  const makeRound = () => {
    const next = shuffle(pool)[0]
    return { target: next, choices: pickChoices(pool, next, count, (s) => s.id) }
  }

  const [round, setRound] = useState(makeRound)
  const [streak, setStreak] = useState(0)
  const [tone, setTone] = useState<'idle' | 'good' | 'try'>('idle')
  const [message, setMessage] = useState('Tap the matching shape.')
  const [locked, setLocked] = useState(false)

  const nextRound = () => {
    setRound(makeRound())
    setTone('idle')
    setMessage('Tap the matching shape.')
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
      setMessage(`Yes — that is a ${round.target.name}.`)
      playCorrect(settings.sensory.soundOn)
      recordAnswer('shapes', true, nextStreak)
      setLocked(true)
      window.setTimeout(nextRound, settings.sensory.reducedMotion ? 500 : 900)
    } else {
      setStreak(0)
      setTone('try')
      setMessage('Not quite. Look again.')
      playGentleNudge(settings.sensory.soundOn)
      recordAnswer('shapes', false, 0)
    }
  }

  return (
    <ActivityShell
      title="Shapes"
      prompt={settings.ageBand === '3-6' ? 'Find the same shape.' : `Which one is the ${round.target.name}?`}
      feedbackTone={tone}
      feedbackMessage={message}
      streak={streak}
      badge={
        settings.ageBand === '3-6' ? (
          <div className="target-card shape-target">
            <ShapeSvg shape={round.target} fill="#2C6B5C" />
            <span className="target-word">{round.target.name}</span>
          </div>
        ) : (
          <div className="target-card shape-target word-only">
            <span className="target-word big">{round.target.name}</span>
          </div>
        )
      }
    >
      <ChoiceGrid columns={2}>
        {round.choices.map((shape) => (
          <button
            key={shape.id}
            type="button"
            className="choice-btn shape-choice"
            onClick={() => onPick(shape.id)}
            disabled={locked}
            aria-label={shape.name}
          >
            <ShapeSvg shape={shape} fill="#4F8F7A" />
          </button>
        ))}
      </ChoiceGrid>
    </ActivityShell>
  )
}
