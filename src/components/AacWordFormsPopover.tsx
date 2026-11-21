type Props = {
  baseLabel: string
  forms: string[]
  anchorLabel: string
  onPick: (form: string) => void
  onClose: () => void
}

/** Grammar / word-forms sheet opened by press-and-hold on an AAC tile. */
export function AacWordFormsPopover({ baseLabel, forms, anchorLabel, onPick, onClose }: Props) {
  return (
    <div className="adult-gate-backdrop aac-forms-backdrop" role="presentation" onClick={onClose}>
      <div
        className="aac-forms-sheet dash-card"
        role="dialog"
        aria-modal="true"
        aria-label={`Word forms for ${anchorLabel}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{baseLabel}</h3>
        <p className="fine-print">Choose a form — main board stays uncluttered.</p>
        <div className="aac-forms-grid">
          {forms.map((f) => (
            <button key={f} type="button" className="btn btn-secondary aac-form-chip" onClick={() => onPick(f)}>
              {f}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  )
}
