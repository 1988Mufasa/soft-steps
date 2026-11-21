import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

const HOLD_MS = 4000
const CIRCUMFERENCE = 2 * Math.PI * 18

type Props = {
  locked: boolean
  onLock: () => void
  onUnlock: () => void
}

/**
 * Lock-to-AAC padlock — tap to lock instantly; hold 4s with progress ring to unlock
 * (parental gate kids rarely complete by accident).
 */
export function AacBoardLock({ locked, onLock, onUnlock }: Props) {
  const [progress, setProgress] = useState(0)
  const [holding, setHolding] = useState(false)
  const startRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const doneRef = useRef(false)

  const clearHold = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    startRef.current = 0
    doneRef.current = false
    setHolding(false)
    setProgress(0)
  }

  const tick = () => {
    const elapsed = Date.now() - startRef.current
    const p = Math.min(1, elapsed / HOLD_MS)
    setProgress(p)
    if (p >= 1 && !doneRef.current) {
      doneRef.current = true
      clearHold()
      onUnlock()
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    if (!locked) {
      onLock()
      return
    }
    doneRef.current = false
    startRef.current = Date.now()
    setHolding(true)
    setProgress(0)
    rafRef.current = requestAnimationFrame(tick)
  }

  const onPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId)
    } catch {
      /* ignore */
    }
    if (locked) clearHold()
  }

  const dashOffset = CIRCUMFERENCE * (1 - progress)

  return (
    <div className={`aac-board-lock ${locked ? 'is-locked' : 'is-unlocked'}`}>
      <button
        type="button"
        className={`aac-lock-btn ${holding ? 'is-holding' : ''}`}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
        aria-pressed={locked}
        aria-label={
          locked
            ? 'Board locked. Grown-ups: hold padlock 4 seconds to unlock'
            : 'Lock to AAC board — hides Home and Edit'
        }
        title={locked ? 'Hold to unlock' : 'Lock board'}
      >
        <svg className="aac-lock-ring" viewBox="0 0 44 44" aria-hidden="true">
          <circle className="aac-lock-track" cx="22" cy="22" r="18" />
          {locked ? (
            <circle
              className="aac-lock-progress"
              cx="22"
              cy="22"
              r="18"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          ) : null}
        </svg>
        <span className="aac-lock-icon" aria-hidden="true">
          {locked ? '🔒' : '🔓'}
        </span>
      </button>
      {locked && holding ? (
        <span className="aac-lock-hint" aria-live="polite">
          Keep holding…
        </span>
      ) : locked ? (
        <span className="aac-lock-hint aac-lock-hint-idle">Hold to unlock</span>
      ) : (
        <span className="aac-lock-hint aac-lock-hint-idle">Lock board</span>
      )}
    </div>
  )
}
