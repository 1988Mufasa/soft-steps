import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/AppContext'

type Props = {
  title: string
  children: ReactNode
  backTo?: string
  backLabel?: string
  meta?: ReactNode
  requireOnline?: boolean
}

export function OnlineOfflineFallback({ title = 'Online activity' }: { title?: string }) {
  return (
    <section className="online-hub">
      <Link to="/online" className="back-link">
        ← Online hub
      </Link>
      <p className="eyebrow online-tag">Online</p>
      <h1>{title}</h1>
      <div className="offline-fallback" role="status">
        <p className="offline-fallback-title">You’re offline right now</p>
        <p>
          This activity needs a network connection. Offline practice (ABCs, shapes, colors, numbers)
          still works on Home.
        </p>
        <div className="confirm-row">
          <Link className="btn btn-primary" to="/">
            Offline practice
          </Link>
          <Link className="btn btn-secondary" to="/online">
            Online hub
          </Link>
        </div>
      </div>
    </section>
  )
}

export function OnlineDisabledFallback() {
  return (
    <section className="online-hub">
      <Link to="/" className="back-link">
        ← Home
      </Link>
      <h1>Online extras off</h1>
      <p>A grown-up can turn these on in Parent tools.</p>
      <Link className="btn btn-secondary" to="/parent">
        Grown-ups
      </Link>
    </section>
  )
}

export function OnlineShell({
  title,
  children,
  backTo = '/online',
  backLabel = '← Online hub',
  meta,
  requireOnline = true,
}: Props) {
  const { online, settings } = useApp()

  if (!settings.onlineExtrasEnabled) {
    return <OnlineDisabledFallback />
  }

  if (requireOnline && !online) {
    return <OnlineOfflineFallback title={title} />
  }

  return (
    <section className="online-hub">
      <header className="activity-header">
        <Link to={backTo} className="back-link">
          {backLabel}
        </Link>
        <div className="activity-meta">
          <p className="eyebrow online-tag">Online</p>
          <h1>{title}</h1>
        </div>
        {meta ?? <span className="net-badge is-online">Connected</span>}
      </header>
      {children}
    </section>
  )
}
