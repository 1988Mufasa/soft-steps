import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GameHUD } from '../components/GameHUD'
import { ChoiceGrid } from '../components/ChoiceGrid'
import { SignHand } from '../components/SignHand'
import { FeedbackBanner } from '../components/FeedbackBanner'
import { playCorrect, playGentleNudge, playTap } from '../audio/feedback'
import { speakText } from '../audio/calmAudio'
import { signPool, type SignItem } from '../data/signs'
import { useApp } from '../store/AppContext'
import { choiceCount, pickChoices, shuffle } from '../utils/quiz'

type Mode = 'menu' | 'learn' | 'match' | 'pick-sign' | 'memory' | 'challenge' | 'win'

const CHALLENGE_ROUNDS = 8

export function SignsModule() {
  const { settings, recordAnswer } = useApp()
  const pool = useMemo(() => signPool(settings.ageBand), [settings.ageBand])
  const count = choiceCount(settings.ageBand)

  const [mode, setMode] = useState<Mode>('menu')
  const [lessonIndex, setLessonIndex] = useState(0)
  const [replay, setReplay] = useState(0)
  const [streak, setStreak] = useState(0)
  const [stars, setStars] = useState(0)
  const [roundNum, setRoundNum] = useState(1)
  const [tone, setTone] = useState<'idle' | 'good' | 'try'>('idle')
  const [message, setMessage] = useState('')
  const [locked, setLocked] = useState(false)

  const makeMatchRound = (source: SignItem[] = pool) => {
    const next = shuffle(source)[0]
    return {
      target: next,
      choices: pickChoices(source, next, count, (s) => s.id),
    }
  }

  const [matchRound, setMatchRound] = useState(() => makeMatchRound())

  // Memory game
  const [memoryCards, setMemoryCards] = useState<{ id: string; kind: 'sign' | 'word'; sign: SignItem }[]>(
    [],
  )
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<string[]>([])

  const lesson = pool[lessonIndex % pool.length]

  const startMode = (next: Mode) => {
    setMode(next)
    setStreak(0)
    setStars(0)
    setRoundNum(1)
    setTone('idle')
    setMessage('')
    setLocked(false)
    setReplay((n) => n + 1)
    if (next === 'match' || next === 'pick-sign' || next === 'challenge') {
      setMatchRound(makeMatchRound())
    }
    if (next === 'memory') {
      const picks = shuffle(pool).slice(0, settings.ageBand === '3-6' ? 3 : 4)
      const cards = shuffle(
        picks.flatMap((sign) => [
          { id: `${sign.id}-s`, kind: 'sign' as const, sign },
          { id: `${sign.id}-w`, kind: 'word' as const, sign },
        ]),
      )
      setMemoryCards(cards)
      setFlipped([])
      setMatched([])
    }
    if (next === 'learn') setLessonIndex(0)
  }

  const award = (correct: boolean) => {
    if (!correct) {
      setStreak(0)
      setTone('try')
      playGentleNudge(settings.sensory.soundOn)
      recordAnswer('signs', false, 0)
      return
    }
    const nextStreak = streak + 1
    setStreak(nextStreak)
    setStars((s) => s + 1)
    setTone('good')
    playCorrect(settings.sensory.soundOn)
    recordAnswer('signs', true, nextStreak)
  }

  const advanceQuiz = () => {
    if (mode === 'challenge' && roundNum >= CHALLENGE_ROUNDS) {
      setMode('win')
      return
    }
    setMatchRound(makeMatchRound())
    setRoundNum((r) => r + 1)
    setTone('idle')
    setMessage('')
    setLocked(false)
    setReplay((n) => n + 1)
  }

  const onMatchPick = (id: string, byWord: boolean) => {
    if (locked) return
    playTap(settings.sensory.soundOn)
    const correct = id === matchRound.target.id
    if (correct) {
      award(true)
      setMessage(`Yes — ${matchRound.target.word}!`)
      speakText(matchRound.target.word, settings.sensory.soundOn)
      setLocked(true)
      window.setTimeout(advanceQuiz, settings.sensory.reducedMotion ? 600 : 1100)
    } else {
      award(false)
      setMessage(byWord ? 'Try another word.' : 'Try another sign.')
    }
  }

  useEffect(() => {
    if (flipped.length !== 2) return
    const [a, b] = flipped
    const ca = memoryCards[a]
    const cb = memoryCards[b]
    if (!ca || !cb) return
    const ok = ca.sign.id === cb.sign.id && ca.kind !== cb.kind
    const t = window.setTimeout(() => {
      if (ok) {
        award(true)
        setMatched((m) => [...m, ca.sign.id])
        setMessage(`Matched ${ca.sign.word}!`)
        speakText(ca.sign.word, settings.sensory.soundOn)
        const nextMatched = matched.length + 1
        const totalPairs = memoryCards.length / 2
        if (nextMatched >= totalPairs) {
          window.setTimeout(() => setMode('win'), 700)
        }
      } else {
        award(false)
        setMessage('Not a match — try again.')
      }
      setFlipped([])
    }, 650)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped])

  if (mode === 'menu') {
    return (
      <section className="activity-shell sign-game">
        <header className="activity-header">
          <Link to="/" className="back-link">
            ← Home
          </Link>
          <div className="activity-meta">
            <p className="eyebrow offline-tag">Learning game</p>
            <h1>Sign language</h1>
          </div>
          <span className="age-badge">Ages {settings.ageBand}</span>
        </header>
        <p className="prompt">Pick a fun game. Watch short sign clips, then play!</p>
        <div className="sign-mode-grid">
          <button type="button" className="sign-mode-card" onClick={() => startMode('learn')}>
            <span className="sign-mode-emoji" aria-hidden="true">
              🎥
            </span>
            <strong>Watch & learn</strong>
            <span>Play each short sign clip</span>
          </button>
          <button type="button" className="sign-mode-card" onClick={() => startMode('match')}>
            <span className="sign-mode-emoji" aria-hidden="true">
              👀
            </span>
            <strong>Match the word</strong>
            <span>Watch the sign → pick the word</span>
          </button>
          <button type="button" className="sign-mode-card" onClick={() => startMode('pick-sign')}>
            <span className="sign-mode-emoji" aria-hidden="true">
              ✋
            </span>
            <strong>Find the sign</strong>
            <span>See the word → pick the matching clip</span>
          </button>
          <button type="button" className="sign-mode-card" onClick={() => startMode('memory')}>
            <span className="sign-mode-emoji" aria-hidden="true">
              🃏
            </span>
            <strong>Memory match</strong>
            <span>Pair each sign with its word</span>
          </button>
          <button
            type="button"
            className="sign-mode-card sign-mode-challenge"
            onClick={() => startMode('challenge')}
          >
            <span className="sign-mode-emoji" aria-hidden="true">
              ⭐
            </span>
            <strong>Star challenge</strong>
            <span>{CHALLENGE_ROUNDS} quick rounds — collect stars</span>
          </button>
        </div>
      </section>
    )
  }

  if (mode === 'win') {
    return (
      <section className="activity-shell sign-game">
        <header className="activity-header">
          <button type="button" className="back-link" onClick={() => setMode('menu')}>
            ← Games
          </button>
          <div className="activity-meta">
            <p className="eyebrow offline-tag">You did it</p>
            <h1>Great signing!</h1>
          </div>
          <span className="streak-pill">★ {stars}</span>
        </header>
        <div className="sign-win">
          <p className="sign-win-stars">{'★'.repeat(Math.max(1, Math.min(stars, 8)))}</p>
          <p>You earned {stars} star{stars === 1 ? '' : 's'} this game.</p>
          <div className="confirm-row">
            <button type="button" className="btn btn-primary" onClick={() => startMode('challenge')}>
              Play challenge again
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setMode('menu')}>
              More games
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (mode === 'learn' && lesson) {
    return (
      <section className="activity-shell sign-game">
        <header className="activity-header">
          <button type="button" className="back-link" onClick={() => setMode('menu')}>
            ← Games
          </button>
          <div className="activity-meta">
            <p className="eyebrow offline-tag">Watch & learn</p>
            <h1>{lesson.word}</h1>
          </div>
          <span className="age-badge">
            {lessonIndex + 1}/{pool.length}
          </span>
        </header>
        <div className="target-card sign-target">
          <SignHand
            pose={lesson.pose}
            title={lesson.word}
            emoji={lesson.emoji}
            how={lesson.how}
            replayKey={replay}
            large
          />
          <div className="confirm-row sign-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setReplay((n) => n + 1)}>
              Replay clip
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => speakText(lesson.word, settings.sensory.soundOn)}
            >
              Hear kid voice
            </button>
          </div>
        </div>
        <div className="confirm-row">
          <button
            type="button"
            className="btn btn-ghost"
            disabled={lessonIndex === 0}
            onClick={() => {
              setLessonIndex((i) => Math.max(0, i - 1))
              setReplay((n) => n + 1)
            }}
          >
            Back
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (lessonIndex >= pool.length - 1) {
                setMode('menu')
                return
              }
              setLessonIndex((i) => i + 1)
              setReplay((n) => n + 1)
              setStars((s) => s + 1)
            }}
          >
            {lessonIndex >= pool.length - 1 ? 'Finish' : 'Next sign'}
          </button>
        </div>
      </section>
    )
  }

  if (mode === 'memory') {
    return (
      <section className="activity-shell sign-game">
        <header className="activity-header">
          <button type="button" className="back-link" onClick={() => setMode('menu')}>
            ← Games
          </button>
          <div className="activity-meta">
            <p className="eyebrow offline-tag">Memory match</p>
            <h1>Find the pairs</h1>
          </div>
          <span className="streak-pill">★ {stars}</span>
        </header>
        <GameHUD round={matched.length} total={memoryCards.length / 2} stars={stars} />
        <div className="memory-grid">
          {memoryCards.map((card, index) => {
            const isUp = flipped.includes(index) || matched.includes(card.sign.id)
            return (
              <button
                key={card.id}
                type="button"
                className={`memory-card ${isUp ? 'is-up' : ''} ${matched.includes(card.sign.id) ? 'is-matched' : ''}`}
                disabled={isUp || flipped.length === 2}
                onClick={() => {
                  playTap(settings.sensory.soundOn)
                  setFlipped((f) => [...f, index])
                }}
              >
                {isUp ? (
                  card.kind === 'word' ? (
                    <span className="memory-word">
                      {card.sign.emoji}
                      <strong>{card.sign.word}</strong>
                    </span>
                  ) : (
                    <SignHand
                      pose={card.sign.pose}
                      title={card.sign.word}
                      emoji={card.sign.emoji}
                      replayKey={card.id}
                    />
                  )
                ) : (
                  <span className="memory-back">?</span>
                )}
              </button>
            )
          })}
        </div>
        <FeedbackBanner tone={tone} message={message || 'Flip two cards: one sign + one word.'} />
      </section>
    )
  }

  // match | pick-sign | challenge
  const total = mode === 'challenge' ? CHALLENGE_ROUNDS : 6
  const byWord = mode === 'match' || mode === 'challenge'

  return (
    <section className="activity-shell sign-game">
      <header className="activity-header">
        <button type="button" className="back-link" onClick={() => setMode('menu')}>
          ← Games
        </button>
        <div className="activity-meta">
          <p className="eyebrow offline-tag">
            {mode === 'pick-sign' ? 'Find the sign' : mode === 'challenge' ? 'Star challenge' : 'Match the word'}
          </p>
          <h1>Sign language</h1>
        </div>
        <span className="streak-pill">★ {streak}</span>
      </header>

      <GameHUD round={roundNum} total={total} stars={stars} level={1 + Math.floor(stars / 3)} />

      {byWord ? (
        <div className="target-card sign-target">
          <SignHand
            pose={matchRound.target.pose}
            title={matchRound.target.word}
            emoji={matchRound.target.emoji}
            how={matchRound.target.how}
            replayKey={replay}
            large
          />
          <div className="confirm-row sign-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setReplay((n) => n + 1)}>
              Replay clip
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => speakText('What word is this sign?', settings.sensory.soundOn)}
            >
              Hint voice
            </button>
          </div>
        </div>
      ) : (
        <div className="target-card sign-target">
          <p className="big-letter" style={{ fontSize: '2.6rem' }}>
            {matchRound.target.emoji} {matchRound.target.word}
          </p>
          <p className="sign-how">Which sign clip matches this word?</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => speakText(matchRound.target.word, settings.sensory.soundOn)}
          >
            Hear the word
          </button>
        </div>
      )}

      {byWord ? (
        <ChoiceGrid columns={2}>
          {matchRound.choices.map((item) => (
            <button
              key={item.id}
              type="button"
              className="choice-btn sign-choice"
              disabled={locked}
              onClick={() => onMatchPick(item.id, true)}
            >
              <span className="sign-choice-emoji">{item.emoji}</span>
              <span>{item.word}</span>
            </button>
          ))}
        </ChoiceGrid>
      ) : (
        <div className="sign-choice-live-grid">
          {matchRound.choices.map((item) => (
            <button
              key={item.id}
              type="button"
              className="sign-live-choice"
              disabled={locked}
              onClick={() => onMatchPick(item.id, false)}
            >
              <SignHand
                pose={item.pose}
                title={item.word}
                emoji={item.emoji}
                replayKey={`${replay}-${item.id}`}
              />
            </button>
          ))}
        </div>
      )}

      <FeedbackBanner
        tone={tone}
        message={message || (byWord ? 'Watch the live sign, then pick the word.' : 'Pick the matching live sign.')}
      />
    </section>
  )
}
