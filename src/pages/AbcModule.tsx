import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ActivityShell } from '../components/ActivityShell'
import { ChoiceGrid } from '../components/ChoiceGrid'
import { GameHUD } from '../components/GameHUD'
import { letterPool, type LetterItem } from '../data/letters'
import { speakText } from '../audio/calmAudio'
import { useLearningGame } from '../hooks/useLearningGame'
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

  const [board, setBoard] = useState(() => makeRound())
  const game = useLearningGame({
    moduleId: 'abc',
    totalRounds: 8,
    soundOn: settings.sensory.soundOn,
    reducedMotion: settings.sensory.reducedMotion,
    recordAnswer,
  })

  useEffect(() => {
    setBoard(makeRound(pool))
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
            <p className="eyebrow offline-tag">ABCs complete</p>
            <h1>Letter star!</h1>
          </div>
          <span className="streak-pill">★ {game.stars}</span>
        </header>
        <div className="sign-win">
          <p className="sign-win-stars">{'★'.repeat(Math.min(game.stars, 8))}</p>
          <p>You finished 8 letter rounds.</p>
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
      title="ABCs"
      prompt="Letter adventure — find the matching letter each round."
      feedbackTone={game.tone}
      feedbackMessage={
        game.message ||
        (settings.ageBand === '3-6'
          ? 'Look at the big letter, then tap the same one.'
          : 'Match the letter to the word.')
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
          <div className="target-card letter-target" aria-label={`Letter ${board.target.letter}`}>
            <span className="big-letter">{board.target.letter}</span>
            {settings.ageBand === '7-12' ? (
              <span className="target-word">{board.target.word}</span>
            ) : null}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                speakText(
                  settings.ageBand === '7-12'
                    ? `${board.target.letter} for ${board.target.word}`
                    : board.target.letter,
                  settings.sensory.soundOn,
                )
              }
            >
              Hear it
            </button>
          </div>
        </>
      }
    >
      <ChoiceGrid columns={2}>
        {board.choices.map((item) => (
          <button
            key={item.letter}
            type="button"
            className="choice-btn letter-choice"
            onClick={() =>
              game.resolve(
                item.letter === board.target.letter,
                'Nice! You found it.',
                'Almost — try another one.',
                () => setBoard(makeRound()),
              )
            }
            disabled={game.locked}
          >
            {item.letter}
          </button>
        ))}
      </ChoiceGrid>
    </ActivityShell>
  )
}
