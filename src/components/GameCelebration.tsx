import { useEffect, type ReactNode } from 'react'
import { speakText } from '../audio/calmAudio'
import { useApp } from '../store/AppContext'

type Props = {
  /** Optional star count shown under the message */
  stars?: number
  /** Short line under “You are awesome” */
  subtitle?: string
  /** Play again / Home buttons */
  children?: ReactNode
}

const BALLOONS = ['🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈']

/**
 * Short calm celebration shown when any practice game is completed.
 * Speaks “You are awesome”; respects mute / reduced-motion sensory prefs.
 */
export function GameCelebration({ stars, subtitle, children }: Props) {
  const { settings } = useApp()
  const muted =
    settings.sensory.muteCelebrations ||
    !settings.sensory.soundOn
  const reduced =
    settings.sensory.reducedMotion || settings.sensory.disableSuddenAnimations

  useEffect(() => {
    if (muted) return
    const t = window.setTimeout(() => {
      speakText('You are awesome', true)
    }, 280)
    return () => window.clearTimeout(t)
  }, [muted])

  return (
    <div
      className={`game-celebration ${reduced ? 'is-calm' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="game-celebration-sky" aria-hidden="true">
        {BALLOONS.map((b, i) => (
          <span
            key={i}
            className="game-balloon"
            style={{
              left: `${8 + i * 11}%`,
              animationDelay: `${i * 0.18}s`,
              ['--balloon-drift' as string]: `${(i % 3) - 1}px`,
            }}
          >
            {b}
          </span>
        ))}
      </div>

      <p className="game-celebration-title">You are awesome</p>
      {typeof stars === 'number' ? (
        <p className="sign-win-stars" aria-label={`${stars} stars`}>
          {'★'.repeat(Math.max(1, Math.min(stars, 8)))}
        </p>
      ) : null}
      {subtitle ? <p className="game-celebration-sub">{subtitle}</p> : null}
      {children ? <div className="confirm-row game-celebration-actions">{children}</div> : null}
    </div>
  )
}
