import type { AacButton } from '../data/aacPresets'

type Props = {
  buttons: AacButton[]
  onPick: (btn: AacButton) => void
  onClose: () => void
}

/** Temporary large tiles — does not change permanent motor-planning slots. */
export function AacBigGridOverlay({ buttons, onPick, onClose }: Props) {
  const slice = buttons.filter((b) => !b.masked).slice(0, 8)

  return (
    <div className="aac-big-grid-overlay" role="dialog" aria-label="Big grid overlay">
      <div className="aac-big-grid-bar">
        <button type="button" className="btn btn-primary" onClick={onClose}>
          ← Back to normal size
        </button>
        <p className="fine-print">Temporary big tiles — core spots stay the same when you leave.</p>
      </div>
      <div className="aac-big-grid" role="list">
        {slice.map((btn) => (
          <button
            key={btn.id}
            type="button"
            className="aac-big-tile"
            role="listitem"
            onClick={() => onPick(btn)}
          >
            <span className="aac-comm-label">{btn.label}</span>
            <span className="aac-comm-emoji" aria-hidden="true">
              {btn.emoji}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
