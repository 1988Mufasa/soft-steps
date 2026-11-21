import { BODY_CHECK_ITEMS, BODY_ZONES, type BodyCheckItem, type BodyZoneId } from '../data/aacBodyCheck'

type Props = {
  onPick: (item: BodyCheckItem) => void
  onClose: () => void
}

/**
 * Full-screen pain / sensory check — no folder navigation during a meltdown.
 */
export function AacBodyCheck({ onPick, onClose }: Props) {
  const pain = BODY_CHECK_ITEMS.filter((i) => i.kind === 'pain')
  const sensory = BODY_CHECK_ITEMS.filter((i) => i.kind !== 'pain')

  const pickZone = (zone: BodyZoneId) => {
    const item = BODY_CHECK_ITEMS.find((i) => i.zone === zone) ?? BODY_CHECK_ITEMS[0]
    onPick(item)
  }

  return (
    <div className="aac-body-check" role="dialog" aria-modal="true" aria-label="Pain and body check">
      <header className="aac-body-check-head">
        <h2>How do you feel?</h2>
        <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Close body check">
          Back to Talk
        </button>
      </header>

      <div className="aac-body-check-layout">
        <div className="aac-body-map" aria-label="Body map">
          <div className="aac-body-silhouette" aria-hidden="true" />
          {BODY_ZONES.map((z) => (
            <button
              key={z.id}
              type="button"
              className={`aac-body-hotspot zone-${z.id}`}
              style={{ top: z.top, left: z.left }}
              aria-label={z.label}
              onClick={() => pickZone(z.id)}
            >
              <span aria-hidden="true">·</span>
            </button>
          ))}
        </div>

        <div className="aac-body-lists">
          <p className="aac-section-label">It hurts</p>
          <div className="aac-body-chips" role="list">
            {pain.map((item) => (
              <button
                key={item.id}
                type="button"
                className="aac-body-chip"
                role="listitem"
                onClick={() => onPick(item)}
              >
                <span aria-hidden="true">{item.emoji}</span>
                {item.label}
              </button>
            ))}
          </div>
          <p className="aac-section-label">Sensory &amp; needs</p>
          <div className="aac-body-chips" role="list">
            {sensory.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`aac-body-chip kind-${item.kind}`}
                role="listitem"
                onClick={() => onPick(item)}
              >
                <span aria-hidden="true">{item.emoji}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
