import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ActivityShell } from '../components/ActivityShell'
import { ChoiceGrid } from '../components/ChoiceGrid'
import { GameCelebration } from '../components/GameCelebration'
import { GameHUD } from '../components/GameHUD'
import { colorPool } from '../data/colors'
import { speakText } from '../audio/calmAudio'
import { useLearningGame } from '../hooks/useLearningGame'
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

  const [board, setBoard] = useState(makeRound)
  const game = useLearningGame({
    moduleId: 'colors',
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

  if (game.finished) {
    return (
      <section className="activity-shell">
        <header className="activity-header">
          <Link to="/" className="back-link">
            ← Talk
          </Link>
          <div className="activity-meta">
            <p className="eyebrow offline-tag">Colors complete</p>
            <h1>Color star!</h1>
          </div>
          <span className="streak-pill">★ {game.stars}</span>
        </header>
        <GameCelebration stars={game.stars} subtitle="You finished the color quest.">
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
        </GameCelebration>
      </section>
    )
  }

  return (
    <ActivityShell
      title="Colors"
      prompt="Color quest — match the color each round."
      feedbackTone={game.tone}
      feedbackMessage={
        game.message ||
        (settings.ageBand === '3-6'
          ? 'Match the swatch.'
          : `Find ${board.target.name.toLowerCase()}.`)
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
          <div className="target-card color-target">
            <span
              className="color-swatch large"
              style={{ background: board.target.hex }}
              aria-label={board.target.name}
            />
            {settings.ageBand === '3-6' ? (
              <span className="target-word">{board.target.name}</span>
            ) : null}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => speakText(board.target.name, settings.sensory.soundOn)}
            >
              Hear it
            </button>
          </div>
        </>
      }
    >
      <ChoiceGrid columns={2}>
        {board.choices.map((color) => (
          <button
            key={color.id}
            type="button"
            className="choice-btn color-choice"
            onClick={() =>
              game.resolve(
                color.id === board.target.id,
                `Great — ${board.target.name}!`,
                'Try a different color.',
                () => setBoard(makeRound()),
              )
            }
            disabled={game.locked}
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
