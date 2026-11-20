import { useCallback, useState } from 'react'
import { playCorrect, playGentleNudge, playTap } from '../audio/feedback'
import type { ModuleId } from '../types'

type Options = {
  moduleId: ModuleId
  totalRounds?: number
  soundOn: boolean
  reducedMotion: boolean
  recordAnswer: (id: ModuleId, correct: boolean, streak: number) => void
  onComplete?: (stars: number) => void
  nextDelayMs?: number
}

export function useLearningGame({
  moduleId,
  totalRounds = 8,
  soundOn,
  reducedMotion,
  recordAnswer,
  onComplete,
  nextDelayMs,
}: Options) {
  const [streak, setStreak] = useState(0)
  const [stars, setStars] = useState(0)
  const [round, setRound] = useState(1)
  const [tone, setTone] = useState<'idle' | 'good' | 'try'>('idle')
  const [message, setMessage] = useState('')
  const [locked, setLocked] = useState(false)
  const [finished, setFinished] = useState(false)

  const delay = nextDelayMs ?? (reducedMotion ? 500 : 900)

  const resetGame = useCallback(() => {
    setStreak(0)
    setStars(0)
    setRound(1)
    setTone('idle')
    setMessage('')
    setLocked(false)
    setFinished(false)
  }, [])

  const resolve = useCallback(
    (correct: boolean, goodMsg: string, tryMsg: string, onNext: () => void) => {
      if (locked || finished) return
      playTap(soundOn)
      if (correct) {
        const nextStreak = streak + 1
        const nextStars = stars + 1
        setStreak(nextStreak)
        setStars(nextStars)
        setTone('good')
        setMessage(goodMsg)
        playCorrect(soundOn)
        recordAnswer(moduleId, true, nextStreak)
        setLocked(true)
        window.setTimeout(() => {
          if (round >= totalRounds) {
            setFinished(true)
            onComplete?.(nextStars)
            return
          }
          setRound((r) => r + 1)
          setTone('idle')
          setMessage('')
          setLocked(false)
          onNext()
        }, delay)
      } else {
        setStreak(0)
        setTone('try')
        setMessage(tryMsg)
        playGentleNudge(soundOn)
        recordAnswer(moduleId, false, 0)
      }
    },
    [
      locked,
      finished,
      soundOn,
      streak,
      stars,
      recordAnswer,
      moduleId,
      round,
      totalRounds,
      delay,
      onComplete,
    ],
  )

  return {
    streak,
    stars,
    round,
    totalRounds,
    tone,
    message,
    setMessage,
    locked,
    finished,
    level: 1 + Math.floor(stars / 3),
    resetGame,
    resolve,
  }
}
