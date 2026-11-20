import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

type Props = {
  onUnlock: () => void
  onCancel?: () => void
  title?: string
}

/** Math problem OR hold-to-unlock gate for parent routine builder. */
export function ParentLock({ onUnlock, onCancel, title = 'Grown-up unlock' }: Props) {
  const [mode, setMode] = useState<'pick' | 'math' | 'hold'>('pick')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [holdPct, setHoldPct] = useState(0)
  const holdTimer = useRef<number | null>(null)
  const holdStart = useRef<number | null>(null)

  const problem = useMemo(() => {
    const a = 4 + Math.floor(Math.random() * 5)
    const b = 3 + Math.floor(Math.random() * 6)
    return { a, b, sum: a + b }
  }, [])

  useEffect(() => {
    return () => {
      if (holdTimer.current) window.clearInterval(holdTimer.current)
    }
  }, [])

  const startHold = () => {
    holdStart.current = Date.now()
    setHoldPct(0)
    if (holdTimer.current) window.clearInterval(holdTimer.current)
    holdTimer.current = window.setInterval(() => {
      if (!holdStart.current) return
      const pct = Math.min(100, ((Date.now() - holdStart.current) / 2000) * 100)
      setHoldPct(pct)
      if (pct >= 100) {
        if (holdTimer.current) window.clearInterval(holdTimer.current)
        onUnlock()
      }
    }, 50)
  }

  const endHold = () => {
    if (holdTimer.current) window.clearInterval(holdTimer.current)
    holdStart.current = null
    setHoldPct(0)
  }

  return (
    <div className="parent-lock">
      <h1>{title}</h1>
      <p>Kids stay in the routine. Grown-ups unlock the builder.</p>

      {mode === 'pick' ? (
        <div className="confirm-row">
          <button type="button" className="btn btn-primary" onClick={() => setMode('math')}>
            Solve a math problem
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setMode('hold')}>
            Hold to unlock
          </button>
        </div>
      ) : null}

      {mode === 'math' ? (
        <form
          className="pin-form"
          onSubmit={(e) => {
            e.preventDefault()
            if (Number(answer) === problem.sum) {
              onUnlock()
            } else {
              setError('Try again.')
              setAnswer('')
            }
          }}
        >
          <p className="prompt">
            What is {problem.a} + {problem.b}?
          </p>
          <input
            className="pin-input"
            inputMode="numeric"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value.replace(/\D/g, ''))
              setError('')
            }}
            aria-label="Answer"
          />
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="btn btn-primary">
            Unlock
          </button>
        </form>
      ) : null}

      {mode === 'hold' ? (
        <div className="hold-unlock">
          <button
            type="button"
            className="hold-btn"
            onPointerDown={startHold}
            onPointerUp={endHold}
            onPointerLeave={endHold}
            onPointerCancel={endHold}
          >
            Hold 2 seconds
          </button>
          <div className="gentle-timer-track" aria-hidden="true">
            <div className="gentle-timer-fill" style={{ width: `${holdPct}%` }} />
          </div>
        </div>
      ) : null}

      {onCancel ? (
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Back
        </button>
      ) : null}
    </div>
  )
}

export function LockedGate({
  unlocked,
  onUnlock,
  onCancel,
  children,
}: {
  unlocked: boolean
  onUnlock: () => void
  onCancel?: () => void
  children: ReactNode
}) {
  if (!unlocked) {
    return <ParentLock onUnlock={onUnlock} onCancel={onCancel} />
  }
  return <>{children}</>
}
