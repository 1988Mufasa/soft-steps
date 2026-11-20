import { useEffect, useMemo, useState } from 'react'
import { ActivityShell } from '../components/ActivityShell'
import { ChoiceGrid } from '../components/ChoiceGrid'
import { letterPool, type LetterItem } from '../data/letters'
import { playCorrect, playGentleNudge, playTap } from '../audio/feedback'
import { useApp } from '../store/AppContext'
import { choiceCount, pickChoices, shuffle } from '../utils/quiz'

export function AbcModule() {
  const { settings, recordAnswer } = useApp()
  const pool = useMemo(() => letterPool(settings.ageBand), [settings.ageBand])
  const count = choiceCount(settings.ageBand)

  const makeRound = (source: LetterItem[] = pool) => {
    const next = shuffle(source)[0]
    return {
      target: next,
      choices: pickChoices(source, next, count, (l) => l.letter),
    }
  }

  const [round, setRound] = useState(() => makeRound())
  const [streak, setStreak] = useState(0)
  const [tone, setTone] = useState<'idle' | 'good' | 'try'>('idle')
  const [message, setMessage] = useState('Tap the matching letter.')
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    const next = makeRound(pool)
    setRound(next)
    setTone('idle')
    setMessage(
      settings.ageBand === '3-6'
        ? 'Find this letter.'
        : `Find the letter for “${next.target.word}”.`,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, settings.ageBand, count])

  const nextRound = () => {
    const next = makeRound()
    setRound(next)
    setTone('idle')
    setMessage(
      settings.ageBand === '3-6'
        ? 'Find this letter.'
        : `Find the letter for “${next.target.word}”.`,
    )
    setLocked(false)
  }

  const onPick = (letter: string) => {
    if (locked) return
    playTap(settings.sensory.soundOn)
    const correct = letter === round.target.letter
    if (correct) {
      const nextStreak = streak + 1
      setStreak(nextStreak)
      setTone('good')
      setMessage('Nice! You found it.')
      playCorrect(settings.sensory.soundOn)
      recordAnswer('abc', true, nextStreak)
      setLocked(true)
      window.setTimeout(nextRound, settings.sensory.reducedMotion ? 500 : 900)
    } else {
      setStreak(0)
      setTone('try')
      setMessage('Almost — try another one.')
      playGentleNudge(settings.sensory.soundOn)
      recordAnswer('abc', false, 0)
    }
  }

  return (
    <ActivityShell
      title="ABCs"
      prompt={
        settings.ageBand === '3-6'
          ? 'Look at the big letter, then tap the same one.'
          : 'Match the letter to the word.'
      }
      feedbackTone={tone}
      feedbackMessage={message}
      streak={streak}
      badge={
        <div className="target-card letter-target" aria-label={`Letter ${round.target.letter}`}>
          <span className="big-letter">{round.target.letter}</span>
          {settings.ageBand === '7-12' ? (
            <span className="target-word">{round.target.word}</span>
          ) : null}
        </div>
      }
    >
      <ChoiceGrid columns={2}>
        {round.choices.map((item) => (
          <button
            key={item.letter}
            type="button"
            className="choice-btn letter-choice"
            onClick={() => onPick(item.letter)}
            disabled={locked}
          >
            {item.letter}
          </button>
        ))}
      </ChoiceGrid>
    </ActivityShell>
  )
}
