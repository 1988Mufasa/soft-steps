import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { FeedbackBanner } from './FeedbackBanner'

type Props = {
  title: string
  prompt: string
  children: ReactNode
  feedbackTone: 'idle' | 'good' | 'try'
  feedbackMessage: string
  streak: number
  badge?: ReactNode
}

export function ActivityShell({
  title,
  prompt,
  children,
  feedbackTone,
  feedbackMessage,
  streak,
  badge,
}: Props) {
  return (
    <section className="activity-shell">
      <header className="activity-header">
        <Link to="/" className="back-link" aria-label="Back home">
          ← Home
        </Link>
        <div className="activity-meta">
          <p className="eyebrow offline-tag">Offline</p>
          <h1>{title}</h1>
        </div>
        <div className="streak-pill" aria-label={`Streak ${streak}`}>
          ★ {streak}
        </div>
      </header>
      <p className="prompt">{prompt}</p>
      {badge}
      <div className="activity-stage">{children}</div>
      <FeedbackBanner tone={feedbackTone} message={feedbackMessage} />
    </section>
  )
}
