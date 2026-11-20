import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ActivityShell } from '../components/ActivityShell'
import { ChoiceGrid } from '../components/ChoiceGrid'
import { GameHUD } from '../components/GameHUD'
import { numberPool } from '../data/numbers'
import { speakText } from '../audio/calmAudio'
import { useLearningGame } from '../hooks/useLearningGame'
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

  const [board, setBoard] = useState(makeRound)
  const game = useLearningGame({
    moduleId: 'numbers',
    totalRounds: 8,
    soundOn: settings.sensory.soundOn,
    reducedMotion: settings.sensory.reducedMotion,
    recordAnswer,
  })

  useEffect(() => {
    setBoard(makeRound())
    game.resetGame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, settings.ageBand, count])

  const dots = Array.from({ length: board.target }, (_, i) => i)

  if (game.finished) {
    return (
      <section className="activity-shell">
        <header className="activity-header">
          <Link to="/" className="back-link">
            ← Home
          </Link>
          <div className="activity-meta">
            <p className="eyebrow offline-tag">Numbers complete</p>
            <h1>Counting star!</h1>
          </div>
          <span className="streak-pill">★ {game.stars}</span>
        </header>
        <div className="sign-win">
          <p className="sign-win-stars">{'★'.repeat(Math.min(game.stars, 8))}</p>
          <div className="confirm-row">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                game.resetGame()
                setBoard(makeRound())
              }}
            >
              Play again
            </button>
            <Link to="/" className="btn btn-secondary">
              Home
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <ActivityShell
      title="Numbers"
      prompt="Counting game — how many do you see?"
      feedbackTone={game.tone}
      feedbackMessage={
        game.message ||
        (settings.ageBand === '3-6'
          ? 'Count the dots, then tap the number.'
          : 'What number do you see?')
      }
      streak={game.streak}
      badge={
        <>
          <GameHUD
            round={game.round}
            total={game.totalRounds}
            stars={game.stars}
            level={game.level}
          />
          <div className="target-card number-target" aria-label={`${board.target} dots`}>
            {settings.ageBand === '3-6' || board.target <= 10 ? (
              <div className="dot-grid">
                {dots.map((d) => (
                  <span key={d} className="dot" />
                ))}
              </div>
            ) : (
              <span className="big-number">{board.target}</span>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => speakText(String(board.target), settings.sensory.soundOn)}
            >
              Hear it
            </button>
          </div>
        </>
      }
    >
      <ChoiceGrid columns={2}>
        {board.choices.map((n) => (
          <button
            key={n}
            type="button"
            className="choice-btn number-choice"
            onClick={() =>
              game.resolve(
                n === board.target,
                `Yes — ${board.target}!`,
                'Count again carefully.',
                () => setBoard(makeRound()),
              )
            }
            disabled={game.locked}
          >
            {n}
          </button>
        ))}
      </ChoiceGrid>
    </ActivityShell>
  )
}
