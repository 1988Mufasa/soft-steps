import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GameHUD } from '../components/GameHUD'
import { ChoiceGrid } from '../components/ChoiceGrid'
import { FeedbackBanner } from '../components/FeedbackBanner'
import { playCorrect, playGentleNudge, playTap } from '../audio/feedback'
import { speakText } from '../audio/calmAudio'
import { foodPool, type FoodItem, type FoodKind } from '../data/foods'
import { useApp } from '../store/AppContext'
import { choiceCount, pickChoices, shuffle } from '../utils/quiz'

type Hub = 'hub' | FoodKind
type Mode = 'menu' | 'learn' | 'match' | 'pick-food' | 'memory' | 'challenge' | 'win'

const CHALLENGE_ROUNDS = 8

export function FoodsModule() {
  const { settings, recordAnswer } = useApp()
  const [hub, setHub] = useState<Hub>('hub')
  const kind: FoodKind | undefined = hub === 'hub' ? undefined : hub

  const pool = useMemo(
    () => foodPool(settings.ageBand, kind),
    [settings.ageBand, kind],
  )
  const count = choiceCount(settings.ageBand)

  const [mode, setMode] = useState<Mode>('menu')
  const [lessonIndex, setLessonIndex] = useState(0)
  const [streak, setStreak] = useState(0)
  const [stars, setStars] = useState(0)
  const [roundNum, setRoundNum] = useState(1)
  const [tone, setTone] = useState<'idle' | 'good' | 'try'>('idle')
  const [message, setMessage] = useState('')
  const [locked, setLocked] = useState(false)

  const makeMatchRound = (source: FoodItem[] = pool) => {
    const next = shuffle(source)[0]
    return {
      target: next,
      choices: pickChoices(source, next, count, (f) => f.id),
    }
  }

  const [matchRound, setMatchRound] = useState(() => makeMatchRound(pool))

  const [memoryCards, setMemoryCards] = useState<
    { id: string; kind: 'emoji' | 'word'; food: FoodItem }[]
  >([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<string[]>([])

  const lesson = pool[lessonIndex % Math.max(pool.length, 1)]
  const topicLabel = hub === 'fruit' ? 'Fruits' : hub === 'veg' ? 'Vegetables' : 'Foods'

  const openCategory = (next: FoodKind) => {
    setHub(next)
    setMode('menu')
    setTone('idle')
    setMessage('')
  }

  const startMode = (next: Mode) => {
    const source = foodPool(settings.ageBand, hub === 'hub' ? undefined : hub)
    setMode(next)
    setStreak(0)
    setStars(0)
    setRoundNum(1)
    setTone('idle')
    setMessage('')
    setLocked(false)
    if (next === 'match' || next === 'pick-food' || next === 'challenge') {
      setMatchRound(makeMatchRound(source))
    }
    if (next === 'memory') {
      const picks = shuffle(source).slice(0, settings.ageBand === '3-6' ? 3 : 4)
      setMemoryCards(
        shuffle(
          picks.flatMap((food) => [
            { id: `${food.id}-e`, kind: 'emoji' as const, food },
            { id: `${food.id}-w`, kind: 'word' as const, food },
          ]),
        ),
      )
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
      recordAnswer('foods', false, 0)
      return
    }
    const nextStreak = streak + 1
    setStreak(nextStreak)
    setStars((s) => s + 1)
    setTone('good')
    playCorrect(settings.sensory.soundOn)
    recordAnswer('foods', true, nextStreak)
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
  }

  const onMatchPick = (id: string, byWord: boolean) => {
    if (locked) return
    playTap(settings.sensory.soundOn)
    const correct = id === matchRound.target.id
    if (correct) {
      award(true)
      setMessage(`Yes — ${matchRound.target.name}!`)
      speakText(matchRound.target.name, settings.sensory.soundOn)
      setLocked(true)
      window.setTimeout(advanceQuiz, settings.sensory.reducedMotion ? 600 : 1100)
    } else {
      award(false)
      setMessage(byWord ? 'Try another name.' : 'Try another food.')
    }
  }

  useEffect(() => {
    if (flipped.length !== 2) return
    const [a, b] = flipped
    const ca = memoryCards[a]
    const cb = memoryCards[b]
    if (!ca || !cb) return
    const ok = ca.food.id === cb.food.id && ca.kind !== cb.kind
    const t = window.setTimeout(() => {
      if (ok) {
        award(true)
        setMatched((m) => [...m, ca.food.id])
        setMessage(`Matched ${ca.food.name}!`)
        speakText(ca.food.name, settings.sensory.soundOn)
        if (matched.length + 1 >= memoryCards.length / 2) {
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

  if (hub === 'hub') {
    return (
      <section className="activity-shell food-game">
        <header className="activity-header">
          <Link to="/" className="back-link">
            ← Home
          </Link>
          <div className="activity-meta">
            <p className="eyebrow offline-tag">Learning game</p>
            <h1>Foods</h1>
          </div>
          <span className="age-badge">Ages {settings.ageBand}</span>
        </header>
        <p className="prompt">Pick fruits or vegetables. Calm games — works offline.</p>
        <div className="sign-mode-grid">
          <button type="button" className="sign-mode-card food-hub-fruit" onClick={() => openCategory('fruit')}>
            <span className="sign-mode-emoji" aria-hidden="true">
              🍎
            </span>
            <strong>Fruits</strong>
            <span>Apples, berries, and more</span>
          </button>
          <button type="button" className="sign-mode-card food-hub-veg" onClick={() => openCategory('veg')}>
            <span className="sign-mode-emoji" aria-hidden="true">
              🥕
            </span>
            <strong>Vegetables</strong>
            <span>Carrots, greens, and more</span>
          </button>
        </div>
      </section>
    )
  }

  if (mode === 'menu') {
    return (
      <section className="activity-shell food-game">
        <header className="activity-header">
          <button type="button" className="back-link" onClick={() => setHub('hub')}>
            ← Foods
          </button>
          <div className="activity-meta">
            <p className="eyebrow offline-tag">Learning game</p>
            <h1>{topicLabel}</h1>
          </div>
          <span className="age-badge">Ages {settings.ageBand}</span>
        </header>
        <p className="prompt">Watch, match, remember, or take the star challenge.</p>
        <div className="sign-mode-grid">
          <button type="button" className="sign-mode-card" onClick={() => startMode('learn')}>
            <span className="sign-mode-emoji" aria-hidden="true">
              👀
            </span>
            <strong>Watch & learn</strong>
            <span>See each food and hear its name</span>
          </button>
          <button type="button" className="sign-mode-card" onClick={() => startMode('match')}>
            <span className="sign-mode-emoji" aria-hidden="true">
              🔤
            </span>
            <strong>Match the name</strong>
            <span>See the food → pick the word</span>
          </button>
          <button type="button" className="sign-mode-card" onClick={() => startMode('pick-food')}>
            <span className="sign-mode-emoji" aria-hidden="true">
              🥗
            </span>
            <strong>Find the food</strong>
            <span>See the word → pick the picture</span>
          </button>
          <button type="button" className="sign-mode-card" onClick={() => startMode('memory')}>
            <span className="sign-mode-emoji" aria-hidden="true">
              🃏
            </span>
            <strong>Memory match</strong>
            <span>Pair each picture with its name</span>
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
      <section className="activity-shell food-game">
        <header className="activity-header">
          <button type="button" className="back-link" onClick={() => setMode('menu')}>
            ← Games
          </button>
          <div className="activity-meta">
            <p className="eyebrow offline-tag">You did it</p>
            <h1>Yummy stars!</h1>
          </div>
          <span className="streak-pill">★ {stars}</span>
        </header>
        <div className="sign-win">
          <p className="sign-win-stars">{'★'.repeat(Math.max(1, Math.min(stars, 8)))}</p>
          <p>
            You earned {stars} star{stars === 1 ? '' : 's'} with {topicLabel.toLowerCase()}.
          </p>
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
      <section className="activity-shell food-game">
        <header className="activity-header">
          <button type="button" className="back-link" onClick={() => setMode('menu')}>
            ← Games
          </button>
          <div className="activity-meta">
            <p className="eyebrow offline-tag">Watch & learn</p>
            <h1>{lesson.name}</h1>
          </div>
          <span className="age-badge">
            {lessonIndex + 1}/{pool.length}
          </span>
        </header>
        <div className="target-card food-target" style={{ background: lesson.tint }}>
          <span className="food-emoji-xl" aria-hidden="true">
            {lesson.emoji}
          </span>
          <p className="food-name-xl">{lesson.name}</p>
          <p className="sign-how">{lesson.kind === 'fruit' ? 'Fruit' : 'Vegetable'}</p>
          <div className="confirm-row sign-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => speakText(lesson.name, settings.sensory.soundOn)}
            >
              Hear it
            </button>
          </div>
        </div>
        <div className="confirm-row">
          <button
            type="button"
            className="btn btn-ghost"
            disabled={lessonIndex === 0}
            onClick={() => setLessonIndex((i) => Math.max(0, i - 1))}
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
              setStars((s) => s + 1)
            }}
          >
            {lessonIndex >= pool.length - 1 ? 'Finish' : 'Next food'}
          </button>
        </div>
      </section>
    )
  }

  if (mode === 'memory') {
    return (
      <section className="activity-shell food-game">
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
            const isUp = flipped.includes(index) || matched.includes(card.food.id)
            return (
              <button
                key={card.id}
                type="button"
                className={`memory-card ${isUp ? 'is-up' : ''} ${matched.includes(card.food.id) ? 'is-matched' : ''}`}
                disabled={isUp || flipped.length === 2}
                onClick={() => {
                  playTap(settings.sensory.soundOn)
                  setFlipped((f) => [...f, index])
                }}
              >
                {isUp ? (
                  card.kind === 'word' ? (
                    <span className="memory-word">
                      <strong>{card.food.name}</strong>
                    </span>
                  ) : (
                    <span className="food-emoji-md" aria-hidden="true">
                      {card.food.emoji}
                    </span>
                  )
                ) : (
                  <span className="memory-back">?</span>
                )}
              </button>
            )
          })}
        </div>
        <FeedbackBanner tone={tone} message={message || 'Flip two cards: one picture + one name.'} />
      </section>
    )
  }

  // match | pick-food | challenge
  const total = mode === 'challenge' ? CHALLENGE_ROUNDS : 6
  const byWord = mode === 'match' || mode === 'challenge'

  return (
    <section className="activity-shell food-game">
      <header className="activity-header">
        <button type="button" className="back-link" onClick={() => setMode('menu')}>
          ← Games
        </button>
        <div className="activity-meta">
          <p className="eyebrow offline-tag">
            {mode === 'pick-food' ? 'Find the food' : mode === 'challenge' ? 'Star challenge' : 'Match the name'}
          </p>
          <h1>{topicLabel}</h1>
        </div>
        <span className="streak-pill">★ {streak}</span>
      </header>

      <GameHUD round={roundNum} total={total} stars={stars} level={1 + Math.floor(stars / 3)} />

      {byWord ? (
        <div
          className="target-card food-target"
          style={{ background: matchRound.target.tint }}
        >
          <span className="food-emoji-xl" aria-hidden="true">
            {matchRound.target.emoji}
          </span>
          <div className="confirm-row sign-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => speakText(matchRound.target.name, settings.sensory.soundOn)}
            >
              Hear it
            </button>
          </div>
        </div>
      ) : (
        <div className="target-card food-target">
          <p className="food-name-xl">{matchRound.target.name}</p>
          <p className="sign-how">Which picture matches this name?</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => speakText(matchRound.target.name, settings.sensory.soundOn)}
          >
            Hear it
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
              <span>{item.name}</span>
            </button>
          ))}
        </ChoiceGrid>
      ) : (
        <div className="sign-choice-live-grid">
          {matchRound.choices.map((item) => (
            <button
              key={item.id}
              type="button"
              className="food-live-choice"
              style={{ background: item.tint }}
              disabled={locked}
              onClick={() => onMatchPick(item.id, false)}
            >
              <span className="food-emoji-md" aria-hidden="true">
                {item.emoji}
              </span>
              {settings.ageBand === '3-6' ? <span className="fine-print">{item.name}</span> : null}
            </button>
          ))}
        </div>
      )}

      <FeedbackBanner tone={tone} message={message || 'Take your time. Tap when ready.'} />
    </section>
  )
}
