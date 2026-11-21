import { Link } from 'react-router-dom'
import {
  AAC_LEARN_DESTINATIONS,
  type LearnDestination,
} from '../data/aacLearnDestinations'
import { useApp } from '../store/AppContext'

function isEnabled(
  dest: LearnDestination,
  enabledModules: Record<string, boolean>,
  enabledCare: Record<string, boolean>,
  onlineExtrasEnabled: boolean,
): boolean {
  if (dest.extras) return onlineExtrasEnabled
  if (dest.moduleId) return Boolean(enabledModules[dest.moduleId])
  if (dest.careId) return Boolean(enabledCare[dest.careId])
  return true
}

/** Destinations kids open from the AAC Talk board Learn folder. */
export function AacLearnPanel() {
  const { settings } = useApp()
  const destinations = AAC_LEARN_DESTINATIONS.filter((d) =>
    isEnabled(d, settings.enabledModules, settings.enabledCareModules, settings.onlineExtrasEnabled),
  )
  const practice = destinations.filter((d) => d.kind === 'practice')
  const care = destinations.filter((d) => d.kind === 'care' || d.kind === 'extra')

  if (!destinations.length) {
    return <p className="empty-note">Grown-ups can turn on games in Parent Controls.</p>
  }

  return (
    <div className="aac-learn-body" id="aac-learn-destinations">
      {practice.length ? (
        <div className="aac-learn-grid" role="list" aria-label="Practice games">
          {practice.map((d) => (
            <LearnTile key={d.id} dest={d} />
          ))}
        </div>
      ) : null}
      {care.length ? (
        <>
          <p className="aac-section-label aac-learn-care-label">Care tools</p>
          <div className="aac-learn-grid aac-learn-grid-care" role="list" aria-label="Care tools">
            {care.map((d) => (
              <LearnTile key={d.id} dest={d} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

function LearnTile({ dest }: { dest: LearnDestination }) {
  return (
    <Link to={dest.path} className="aac-learn-tile" role="listitem">
      <span className="aac-learn-emoji" aria-hidden="true">
        {dest.emoji}
      </span>
      <span className="aac-learn-title">{dest.title}</span>
      <span className="aac-learn-blurb">{dest.blurb}</span>
    </Link>
  )
}
