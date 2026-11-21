import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

const HOLD_MS = 8_000

type Props = {
  onUnlock: () => void
  label?: string
  className?: string
}

/** Discreet happy-face: parents must hold ~8s to reach child profile settings. */
export function HappyFaceHold({
  onUnlock,
  label = 'Hold the happy face for 8 seconds to open grown-up settings',
  className = '',
}: Props) {
  const [pct, setPct] = useState(0)
  const [holding, setHolding] = useState(false)
  const timer = useRef<number | null>(null)
  const start = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) window.clearInterval(timer.current)
    }
  }, [])

  const clearHold = () => {
    if (timer.current) window.clearInterval(timer.current)
    timer.current = null
    start.current = null
    setHolding(false)
    setPct(0)
  }

  const beginHold = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    start.current = Date.now()
    setHolding(true)
    setPct(0)
    if (timer.current) window.clearInterval(timer.current)
    timer.current = window.setInterval(() => {
      if (!start.current) return
      const next = Math.min(100, ((Date.now() - start.current) / HOLD_MS) * 100)
      setPct(next)
      if (next >= 100) {
        if (timer.current) window.clearInterval(timer.current)
        timer.current = null
        start.current = null
        setHolding(false)
        setPct(100)
        onUnlock()
      }
    }, 40)
  }

  const secondsLeft = Math.max(0, Math.ceil((HOLD_MS * (100 - pct)) / 100 / 1000))

  return (
    <div className={`happy-face-hold ${className}`.trim()}>
      <button
        type="button"
        className={`happy-face-btn ${holding ? 'is-holding' : ''}`}
        aria-label={label}
        onPointerDown={beginHold}
        onPointerUp={clearHold}
        onPointerLeave={clearHold}
        onPointerCancel={clearHold}
        onContextMenu={(e) => e.preventDefault()}
      >
        <span className="happy-face-emoji" aria-hidden="true">
          😊
        </span>
        <span className="happy-face-ring" aria-hidden="true">
          <svg viewBox="0 0 72 72">
            <circle className="happy-face-track" cx="36" cy="36" r="30" />
            <circle
              className="happy-face-progress"
              cx="36"
              cy="36"
              r="30"
              style={{
                strokeDasharray: `${2 * Math.PI * 30}`,
                strokeDashoffset: `${2 * Math.PI * 30 * (1 - pct / 100)}`,
              }}
            />
          </svg>
        </span>
      </button>
      <p className="happy-face-hint">
        {holding
          ? `Keep holding… ${secondsLeft}s`
          : pct >= 100
            ? 'Unlocked'
            : 'Grown-ups: hold 😊 for 8 seconds'}
      </p>
    </div>
  )
}
