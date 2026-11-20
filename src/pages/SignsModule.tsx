import { useEffect, useMemo, useState } from 'react'
import { ActivityShell } from '../components/ActivityShell'
import { ChoiceGrid } from '../components/ChoiceGrid'
import { SignHand } from '../components/SignHand'
import { playCorrect, playGentleNudge, playTap } from '../audio/feedback'
import { speakText } from '../audio/calmAudio'
import { signPool, type SignItem } from '../data/signs'
import { useApp } from '../store/AppContext'
import { choiceCount, pickChoices, shuffle } from '../utils/quiz'

export function SignsModule() {
  const { settings, recordAnswer } = useApp()
  const pool = useMemo(() => signPool(settings.ageBand), [settings.ageBand])
  const count = choiceCount(settings.ageBand)

  const makeRound = (source: SignItem[] = pool) => {
    const next = shuffle(source)[0]
    return {
      target: next,
      choices: pickChoices(source, next, count, (s) => s.id),
    }
  }

  const [round, setRound] = useState(() => makeRound())
  const [streak, setStreak] = useState(0)
  const [tone, setTone] = useState<'idle' | 'good' | 'try'>('idle')
  const [message, setMessage] = useState('Look at the sign, then pick the matching word.')
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    const next = makeRound(pool)
    setRound(next)
    setTone('idle')
    setMessage('Look at the sign, then pick the matching word.')
    setLocked(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, settings.ageBand, count])

  const nextRound = () => {
    const next = makeRound()
    setRound(next)
    setTone('idle')
    setMessage('Look at the sign, then pick the matching word.')
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
      setMessage(`Yes — ${round.target.word}!`)
      playCorrect(settings.sensory.soundOn)
      speakText(round.target.word, settings.sensory.soundOn)
      recordAnswer('signs', true, nextStreak)
      setLocked(true)
      window.setTimeout(nextRound, settings.sensory.reducedMotion ? 550 : 1000)
    } else {
      setStreak(0)
      setTone('try')
      setMessage('Almost — try another word.')
      playGentleNudge(settings.sensory.soundOn)
      recordAnswer('signs', false, 0)
    }
  }

  return (
    <ActivityShell
      title="Sign language"
      prompt="ASL-inspired practice. Match the hand sign to the word."
      feedbackTone={tone}
      feedbackMessage={message}
      streak={streak}
      badge={
        <div className="target-card sign-target">
          <SignHand pose={round.target.pose} title={`Sign for ${round.target.word}`} />
          <p className="sign-how">{round.target.how}</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => speakText(round.target.word, settings.sensory.soundOn)}
          >
            Hear the word
          </button>
        </div>
      }
    >
      <ChoiceGrid columns={2}>
        {round.choices.map((item) => (
          <button
            key={item.id}
            type="button"
            className="choice-btn sign-choice"
            onClick={() => onPick(item.id)}
            disabled={locked}
          >
            <span className="sign-choice-emoji" aria-hidden="true">
              {item.emoji}
            </span>
            <span>{item.word}</span>
          </button>
        ))}
      </ChoiceGrid>
      <p className="fine-print">
        Friendly practice signs for everyday words — not a full ASL course.
      </p>
    </ActivityShell>
  )
}
