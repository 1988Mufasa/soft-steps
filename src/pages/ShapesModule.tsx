import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ActivityShell } from '../components/ActivityShell'
import { ChoiceGrid } from '../components/ChoiceGrid'
import { GameCelebration } from '../components/GameCelebration'
import { GameHUD } from '../components/GameHUD'
import { shapePool, type ShapeItem } from '../data/shapes'
import { speakText } from '../audio/calmAudio'
import { useLearningGame } from '../hooks/useLearningGame'
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

  const [board, setBoard] = useState(makeRound)
  const game = useLearningGame({
    moduleId: 'shapes',
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
            ← Home
          </Link>
          <div className="activity-meta">
            <p className="eyebrow offline-tag">Shapes complete</p>
            <h1>Shape star!</h1>
          </div>
          <span className="streak-pill">★ {game.stars}</span>
        </header>
        <GameCelebration stars={game.stars} subtitle="You finished the shape hunt.">
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
      title="Shapes"
      prompt="Shape hunt — find the matching shape each round."
      feedbackTone={game.tone}
      feedbackMessage={
        game.message ||
        (settings.ageBand === '3-6'
          ? 'Find the same shape.'
          : `Which one is the ${board.target.name}?`)
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
          {settings.ageBand === '3-6' ? (
            <div className="target-card shape-target">
              <ShapeSvg shape={board.target} fill="#3661B0" />
              <span className="target-word">{board.target.name}</span>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => speakText(board.target.name, settings.sensory.soundOn)}
              >
                Hear it
              </button>
            </div>
          ) : (
            <div className="target-card shape-target word-only">
              <span className="target-word big">{board.target.name}</span>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => speakText(board.target.name, settings.sensory.soundOn)}
              >
                Hear it
              </button>
            </div>
          )}
        </>
      }
    >
      <ChoiceGrid columns={2}>
        {board.choices.map((shape) => (
          <button
            key={shape.id}
            type="button"
            className="choice-btn shape-choice"
            onClick={() =>
              game.resolve(
                shape.id === board.target.id,
                `Yes — that is a ${board.target.name}.`,
                'Not quite. Look again.',
                () => setBoard(makeRound()),
              )
            }
            disabled={game.locked}
            aria-label={shape.name}
          >
            <ShapeSvg shape={shape} fill="#5AADC8" />
          </button>
        ))}
      </ChoiceGrid>
    </ActivityShell>
  )
}
