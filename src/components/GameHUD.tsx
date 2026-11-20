type Props = {
  round: number
  total: number
  stars: number
  level?: number
}

/** Shared progress HUD for Soft Steps learning games. */
export function GameHUD({ round, total, stars, level }: Props) {
  const pct = total > 0 ? Math.min(100, Math.round((round / total) * 100)) : 0
  return (
    <div className="game-hud" aria-label="Game progress">
      <div className="game-hud-row">
        <span className="game-pill">
          Round {Math.min(round, total)}/{total}
        </span>
        {typeof level === 'number' ? <span className="game-pill">Level {level}</span> : null}
        <span className="game-pill game-stars" aria-label={`${stars} stars`}>
          {'★'.repeat(Math.min(stars, 8))}
          {stars === 0 ? '☆' : ''}
        </span>
      </div>
      <div className="gentle-timer-track game-hud-bar" aria-hidden="true">
        <div className="gentle-timer-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
