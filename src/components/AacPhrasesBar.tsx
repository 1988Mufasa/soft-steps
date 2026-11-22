import type { AacSavedPhrase } from '../data/aacExtras'

type Props = {
  recent: AacSavedPhrase[]
  saved: AacSavedPhrase[]
  onSpeak: (phrase: AacSavedPhrase) => void
  onSaveCurrent?: () => void
  canSave?: boolean
  adultSetup?: boolean
  onDeleteSaved?: (id: string) => void
}

export function AacPhrasesBar({
  recent,
  saved,
  onSpeak,
  onSaveCurrent,
  canSave,
  adultSetup,
  onDeleteSaved,
}: Props) {
  if (!recent.length && !saved.length && !canSave) return null

  return (
    <div className="aac-phrases-bar" aria-label="Phrases">
      <div className="aac-phrases-head">
        <p className="aac-section-label">Phrases</p>
        {adultSetup && onSaveCurrent ? (
          <button
            type="button"
            className="btn btn-ghost"
            disabled={!canSave}
            onClick={onSaveCurrent}
          >
            Save current
          </button>
        ) : null}
      </div>
      {saved.length ? (
        <div className="aac-phrases-strip" role="list" aria-label="Saved phrases">
          {saved.map((p) => (
            <span key={p.id} className="aac-phrase-chip-wrap" role="listitem">
              <button type="button" className="aac-phrase-chip is-saved" onClick={() => onSpeak(p)}>
                <span aria-hidden="true">{p.emoji || '💬'}</span>
                {p.label}
              </button>
              {adultSetup && onDeleteSaved ? (
                <button
                  type="button"
                  className="aac-phrase-delete"
                  aria-label={`Delete saved phrase ${p.label}`}
                  onClick={() => onDeleteSaved(p.id)}
                >
                  ×
                </button>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}
      {recent.length ? (
        <>
          <p className="fine-print">Recent</p>
          <div className="aac-phrases-strip" role="list" aria-label="Recent phrases">
            {recent.map((p) => (
              <button
                key={p.id}
                type="button"
                className="aac-phrase-chip"
                role="listitem"
                onClick={() => onSpeak(p)}
              >
                <span aria-hidden="true">{p.emoji || '💬'}</span>
                {p.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
