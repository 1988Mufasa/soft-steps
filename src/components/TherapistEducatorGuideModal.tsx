import { useState } from 'react'
import { downloadText } from '../utils/backup'
import {
  SOFT_STEPS_APP_LINK,
  buildTherapistEducatorGuideText,
} from '../utils/therapistGuideShare'
import { useParentalGate } from '../hooks/useParentalGate'

type Props = {
  onClose: () => void
}

const HIGHLIGHTS: { icon: string; title: string; body: string }[] = [
  {
    icon: '🔒',
    title: '100% Offline & COPPA-Safe',
    body: 'Zero internet required after install — AAC, games, routines, and videos stay on-device. No accounts, no ads, no AI, and zero cloud tracking.',
  },
  {
    icon: '🧩',
    title: 'Motor Planning Protection (Mask Mode)',
    body: 'Hide or reveal buttons on 2×2, 3×4, or 4×6 grids without shifting word positions, paired with Fitzgerald Key color coding.',
  },
  {
    icon: '🏫',
    title: 'Classroom & Sensory Controls',
    body: 'Includes Repeat Tap Cooldown (anti-stimming debounce), Touch Hold Delay, and a collapsible First–Then visual schedule bar.',
  },
  {
    icon: '📱',
    title: 'Child-Safe Screen Lock',
    body: 'Built-in Parental Gate plus step-by-step iPad Guided Access support to keep kids safely in their communication board.',
  },
]

/**
 * Shareable clinic / classroom overview — opened from unlocked Parent Controls.
 * Share Guide is re-gated (Kids Category) before the system share sheet.
 */
export function TherapistEducatorGuideModal({ onClose }: Props) {
  const [shareStatus, setShareStatus] = useState('')
  const { requestGate, gateModal } = useParentalGate({
    title: 'Share Guide',
    blurb: 'Grown-ups confirm before Soft Steps opens sharing (text, email, or Messages).',
  })

  const shareGuide = async () => {
    const text = buildTherapistEducatorGuideText()
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Soft Steps — for therapists & educators',
          text,
          url: SOFT_STEPS_APP_LINK,
        })
        setShareStatus('Guide shared.')
        return
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(text)
      setShareStatus('Guide copied — paste into a text or email.')
      return
    } catch {
      /* fall through */
    }
    const stamp = new Date().toISOString().slice(0, 10)
    downloadText(`soft-steps-therapist-guide-${stamp}.txt`, text)
    setShareStatus('Guide downloaded as a text file.')
  }

  return (
    <div className="adult-gate-backdrop" role="presentation" onClick={onClose}>
      <div
        className="adult-gate-modal dash-card therapist-guide-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="therapist-guide-title"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="eyebrow">For therapists &amp; educators</p>
        <h2 id="therapist-guide-title">Built for Clinics, Classrooms &amp; Home</h2>
        <p className="therapist-guide-lede">
          Soft Steps combines customizable AAC communication, emotional check-ins, ASL, and
          sensory-friendly learning games for ages 3–12 — designed so clinics, classrooms, and
          families can stay aligned without rebuilding boards from scratch.
        </p>

        <ul className="therapist-guide-cards">
          {HIGHLIGHTS.map((card) => (
            <li key={card.title} className="therapist-guide-card">
              <span className="therapist-guide-icon" aria-hidden="true">
                {card.icon}
              </span>
              <div>
                <strong>{card.title}</strong>
                <p>{card.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="therapist-guide-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => requestGate(() => void shareGuide())}
          >
            Share Guide
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
        {shareStatus ? (
          <p className="fine-print" role="status">
            {shareStatus}
          </p>
        ) : (
          <p className="fine-print">
            Share opens your device share sheet so you can text or email this summary to an SLP or
            teacher. A grown-up check appears first.
          </p>
        )}
      </div>
      {gateModal}
    </div>
  )
}
