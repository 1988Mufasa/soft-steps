import { Link } from 'react-router-dom'
import { OnlineDisabledFallback } from '../components/OnlineShell'
import { useApp } from '../store/AppContext'
import type { OnlineActivityId } from '../types'

const ACTIVITIES: {
  id: OnlineActivityId
  title: string
  blurb: string
  path: string
}[] = [
  {
    id: 'mix-quiz',
    title: 'Mix quiz',
    blurb: 'Letters, numbers, and words mixed together',
    path: '/online/mix-quiz',
  },
  {
    id: 'gentle-timer',
    title: 'Gentle timer',
    blurb: 'Calm timed round with a soft progress bar',
    path: '/online/gentle-timer',
  },
  {
    id: 'multi-match',
    title: 'Multi-step match',
    blurb: 'Finish a path of steps in order',
    path: '/online/multi-match',
  },
]

/** Extra practice games — fully on-device, no Wi‑Fi required. */
export function OnlineHub() {
  const { settings } = useApp()

  if (!settings.onlineExtrasEnabled) {
    return <OnlineDisabledFallback />
  }

  const enabled = ACTIVITIES.filter((a) => settings.enabledOnlineActivities[a.id])

  return (
    <section className="online-hub">
      <header className="activity-header">
        <Link to="/" className="back-link">
          ← Talk
        </Link>
        <div className="activity-meta">
          <p className="eyebrow offline-tag">Offline</p>
          <h1>Extra games</h1>
        </div>
        <span className="net-badge is-online">On device</span>
      </header>

      <p className="prompt">
        Mix quiz, gentle timer, and multi-step match run entirely on this device — Soft Steps stays
        100% offline.
      </p>

      <div className="online-activity-grid">
        {enabled.map((activity) => (
          <Link key={activity.id} to={activity.path} className="online-activity-card">
            <span className="eyebrow offline-tag">Offline</span>
            <strong>{activity.title}</strong>
            <p>{activity.blurb}</p>
            <span className="chev">→</span>
          </Link>
        ))}
        {enabled.length === 0 ? (
          <p className="empty-note">
            No extra games are enabled. A grown-up can turn them on in Parent tools.
          </p>
        ) : null}
      </div>

      <div className="online-panel soft-panel">
        <h2>Progress stays here</h2>
        <p>
          Soft Steps never syncs to the cloud. Practice, AAC, and routines stay on this device unless
          a grown-up exports a backup.
        </p>
        <Link className="btn btn-primary" to="/">
          Back to Home
        </Link>
      </div>
    </section>
  )
}
