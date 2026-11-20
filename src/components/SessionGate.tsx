import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useApp, unlockNewSession } from '../store/AppContext'

export function SessionGate({ children }: { children: ReactNode }) {
  const { sessionExpired, minutesLeft, settings } = useApp()

  if (!sessionExpired) {
    return (
      <>
        {settings.sessionLimitMinutes ? (
          <div className="session-hint" aria-live="polite">
            About {minutesLeft} min left in this session
          </div>
        ) : null}
        {children}
      </>
    )
  }

  return (
    <div className="session-ended">
      <h1>Time for a break</h1>
      <p>Your practice time is finished. Ask a grown-up to start a new session.</p>
      <Link className="btn btn-secondary" to="/parent">
        Parent unlock
      </Link>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => {
          unlockNewSession()
          window.location.reload()
        }}
      >
        I am a grown-up — continue
      </button>
    </div>
  )
}
