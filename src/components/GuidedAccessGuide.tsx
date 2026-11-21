type Props = {
  onClose: () => void
}

/** Simple 4-step visual guide for enabling iPad Guided Access. */
export function GuidedAccessGuide({ onClose }: Props) {
  return (
    <div className="adult-gate-backdrop" role="presentation" onClick={onClose}>
      <div
        className="adult-gate-modal dash-card guided-access-guide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ga-guide-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="ga-guide-title">How to lock the iPad screen</h2>
        <p className="fine-print">
          Guided Access keeps Soft Steps full-screen so your child can’t leave Talk by accident.
        </p>
        <ol className="ga-steps">
          <li>
            <span className="ga-step-num" aria-hidden="true">
              1
            </span>
            <div>
              <strong>Open Settings</strong>
              <p>Go to Accessibility → Guided Access and turn it On. Set a passcode.</p>
            </div>
          </li>
          <li>
            <span className="ga-step-num" aria-hidden="true">
              2
            </span>
            <div>
              <strong>Open Soft Steps → Talk</strong>
              <p>Start on the AAC board, then optionally tap the padlock to hide Home and Edit.</p>
            </div>
          </li>
          <li>
            <span className="ga-step-num" aria-hidden="true">
              3
            </span>
            <div>
              <strong>Triple-click the power button</strong>
              <p>Side (or Home) button three times → tap Start. Soft Steps stays locked on screen.</p>
            </div>
          </li>
          <li>
            <span className="ga-step-num" aria-hidden="true">
              4
            </span>
            <div>
              <strong>To exit Guided Access</strong>
              <p>Triple-click again → enter your Guided Access passcode → End.</p>
            </div>
          </li>
        </ol>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  )
}
