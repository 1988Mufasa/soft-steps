import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  OnlineDisabledFallback,
  OnlineOfflineFallback,
} from '../components/OnlineShell'
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
  {
    id: 'sync-demo',
    title: 'Progress sync',
    blurb: 'Demo sync tip (network sample)',
    path: '/online#sync',
  },
]

export function OnlineHub() {
  const { online, settings } = useApp()
  const [synced, setSynced] = useState(false)
  const [syncNote, setSyncNote] = useState(
    'Progress stays on this device. Online sync is a gentle network demo.',
  )

  if (!settings.onlineExtrasEnabled) {
    return <OnlineDisabledFallback />
  }

  if (!online) {
    return <OnlineOfflineFallback title="Online hub" />
  }

  const enabled = ACTIVITIES.filter((a) => settings.enabledOnlineActivities[a.id])

  const demoSync = async () => {
    if (!settings.enabledOnlineActivities['sync-demo']) return
    setSyncNote('Syncing sample progress…')
    await new Promise((r) => setTimeout(r, 700))
    if (!navigator.onLine) {
      setSynced(false)
      setSyncNote('Connection dropped. Sync paused — offline practice still works on Home.')
      return
    }
    setSynced(true)
    setSyncNote('Demo sync complete. Local progress is still the source of truth.')
  }

  return (
    <section className="online-hub">
      <header className="activity-header">
        <Link to="/" className="back-link">
          ← Home
        </Link>
        <div className="activity-meta">
          <p className="eyebrow online-tag">Online</p>
          <h1>Online activities</h1>
        </div>
        <span className="net-badge is-online">Connected</span>
      </header>

      <p className="prompt">
        These activities load practice packs over the network. Offline modules on Home stay
        unchanged.
      </p>

      <div className="online-activity-grid">
        {enabled
          .filter((a) => a.id !== 'sync-demo')
          .map((activity) => (
            <Link key={activity.id} to={activity.path} className="online-activity-card">
              <span className="eyebrow online-tag">Online</span>
              <strong>{activity.title}</strong>
              <p>{activity.blurb}</p>
              <span className="chev">→</span>
            </Link>
          ))}
        {enabled.filter((a) => a.id !== 'sync-demo').length === 0 ? (
          <p className="empty-note">
            No online games are enabled. A grown-up can turn them on in Parent tools.
          </p>
        ) : null}
      </div>

      {settings.enabledOnlineActivities['sync-demo'] ? (
        <div className="online-panel" id="sync">
          <h2>Progress sync (demo)</h2>
          <p>{syncNote}</p>
          <button type="button" className="btn btn-secondary" onClick={demoSync}>
            {synced ? 'Synced' : 'Try demo sync'}
          </button>
          <p className="fine-print">
            Optional CDN narration would load here when online. Soft Steps keeps gentle device
            tones for offline practice.
          </p>
        </div>
      ) : null}

      <div className="online-panel soft-panel">
        <h2>Offline still ready</h2>
        <p>ABCs, shapes, colors, and numbers work without Wi‑Fi after the first visit.</p>
        <Link className="btn btn-primary" to="/">
          Go to offline practice
        </Link>
      </div>
    </section>
  )
}
