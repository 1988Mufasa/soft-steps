import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/AppContext'

type Props = {
  title: string
  children: ReactNode
  backTo?: string
  backLabel?: string
  meta?: ReactNode
  /** @deprecated Soft Steps extras are offline — ignored */
  requireOnline?: boolean
}

export function OnlineDisabledFallback() {
  return (
    <section className="online-hub">
      <Link to="/" className="back-link">
        ← Talk
      </Link>
      <h1>Extra games off</h1>
      <p>A grown-up can turn these on in Parent tools. Everything else on Home still works offline.</p>
      <Link className="btn btn-secondary" to="/parent">
        Grown-ups
      </Link>
    </section>
  )
}

/** @deprecated Kept for imports — extras no longer block when offline */
export function OnlineOfflineFallback({ title = 'Extra game' }: { title?: string }) {
  return (
    <section className="online-hub">
      <Link to="/online" className="back-link">
        ← Extra games
      </Link>
      <p className="eyebrow offline-tag">Offline ready</p>
      <h1>{title}</h1>
      <p>This activity works without Wi‑Fi. Open Extra games to play.</p>
      <Link className="btn btn-primary" to="/online">
        Extra games
      </Link>
    </section>
  )
}

export function OnlineShell({
  title,
  children,
  backTo = '/online',
  backLabel = '← Extra games',
  meta,
}: Props) {
  const { settings } = useApp()

  if (!settings.onlineExtrasEnabled) {
    return <OnlineDisabledFallback />
  }

  return (
    <section className="online-hub">
      <header className="activity-header">
        <Link to={backTo} className="back-link">
          {backLabel}
        </Link>
        <div className="activity-meta">
          <p className="eyebrow offline-tag">Offline</p>
          <h1>{title}</h1>
        </div>
        {meta ?? <span className="net-badge is-online">On device</span>}
      </header>
      {children}
    </section>
  )
}
