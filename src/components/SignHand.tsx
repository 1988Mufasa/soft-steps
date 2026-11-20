import { useEffect, useState } from 'react'
import type { SignPose } from '../data/signs'

type Props = {
  pose: SignPose
  title?: string
  /** Restart the live loop when this changes (e.g. each new round). */
  replayKey?: string | number
  live?: boolean
}

/**
 * Live ASL-inspired hand demo — gentle looping motion for each sign.
 * Honors reduced-motion / no-sudden settings via CSS.
 */
export function SignHand({ pose, title, replayKey = 0, live = true }: Props) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    setTick((t) => t + 1)
  }, [pose, replayKey])

  return (
    <div className={`sign-live ${live ? 'is-live' : ''}`} data-pose={pose}>
      <div className="sign-live-stage" key={`${pose}-${tick}-${replayKey}`}>
        <svg
          className="sign-hand-svg"
          viewBox="0 0 120 120"
          role="img"
          aria-label={title || 'Live sign illustration'}
        >
          <rect width="120" height="120" rx="24" fill="#E8EEF8" />
          <g className={`sign-mover sign-mover--${pose}`}>
            {pose === 'wave' ? (
              <g fill="#3661B0">
                <ellipse cx="60" cy="72" rx="22" ry="26" />
                <rect x="48" y="28" width="10" height="36" rx="5" transform="rotate(-18 53 46)" />
                <rect x="58" y="22" width="10" height="40" rx="5" />
                <rect x="68" y="26" width="10" height="36" rx="5" transform="rotate(14 73 44)" />
                <rect x="40" y="48" width="10" height="28" rx="5" transform="rotate(-40 45 62)" />
              </g>
            ) : null}
            {pose === 'chin-out' ? (
              <g>
                <circle cx="60" cy="36" r="16" fill="#F0D2B0" />
                <g className="sign-part-hand">
                  <ellipse cx="60" cy="78" rx="24" ry="20" fill="#3661B0" />
                  <path
                    d="M48 70 L88 52"
                    stroke="#3661B0"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                </g>
              </g>
            ) : null}
            {pose === 'circle-chest' ? (
              <g>
                <ellipse cx="60" cy="70" rx="28" ry="32" fill="#B7DAF5" />
                <g className="sign-part-hand">
                  <circle cx="60" cy="62" r="18" fill="none" stroke="#3661B0" strokeWidth="8" />
                  <circle cx="74" cy="50" r="6" fill="#3661B0" />
                </g>
              </g>
            ) : null}
            {pose === 'tips-together' ? (
              <g fill="#3661B0">
                <g className="sign-part-left">
                  <ellipse cx="42" cy="70" rx="14" ry="18" />
                  <circle cx="52" cy="48" r="8" />
                </g>
                <g className="sign-part-right">
                  <ellipse cx="78" cy="70" rx="14" ry="18" />
                  <circle cx="68" cy="48" r="8" />
                </g>
              </g>
            ) : null}
            {pose === 'thumbs-up' ? (
              <g fill="#3661B0" className="sign-part-hand">
                <rect x="48" y="52" width="28" height="36" rx="10" />
                <rect x="58" y="28" width="14" height="32" rx="7" />
              </g>
            ) : null}
            {pose === 'thumbs-down' ? (
              <g fill="#C7303A" className="sign-part-hand">
                <rect x="46" y="34" width="28" height="34" rx="10" />
                <circle cx="70" cy="42" r="9" />
                <circle cx="78" cy="54" r="8" />
              </g>
            ) : null}
            {pose === 'fist-help' ? (
              <g className="sign-part-hand">
                <ellipse cx="60" cy="78" rx="30" ry="14" fill="#74B8D2" />
                <rect x="48" y="42" width="28" height="30" rx="10" fill="#3661B0" />
                <path d="M60 36 L60 22" stroke="#6BA84E" strokeWidth="6" strokeLinecap="round" />
              </g>
            ) : null}
            {pose === 'hand-heart' ? (
              <g className="sign-part-hand">
                <path
                  d="M60 88 C20 58 28 28 48 34 C54 36 58 42 60 48 C62 42 66 36 72 34 C92 28 100 58 60 88Z"
                  fill="#C7303A"
                />
              </g>
            ) : null}
            {pose === 'to-mouth' ? (
              <g>
                <circle cx="60" cy="34" r="16" fill="#F0D2B0" />
                <g className="sign-part-hand">
                  <ellipse cx="60" cy="78" rx="16" ry="20" fill="#3661B0" />
                  <circle cx="60" cy="52" r="8" fill="#3661B0" />
                </g>
              </g>
            ) : null}
            {pose === 'cup-drink' ? (
              <g>
                <circle cx="60" cy="34" r="16" fill="#F0D2B0" />
                <g className="sign-part-hand">
                  <path d="M46 58 Q60 42 74 58 L70 88 L50 88 Z" fill="#3661B0" />
                </g>
              </g>
            ) : null}
            {pose === 'palms-down' ? (
              <g fill="#6BA84E">
                <rect
                  className="sign-part-left"
                  x="22"
                  y="52"
                  width="34"
                  height="18"
                  rx="8"
                  transform="rotate(-18 39 61)"
                />
                <rect
                  className="sign-part-right"
                  x="64"
                  y="52"
                  width="34"
                  height="18"
                  rx="8"
                  transform="rotate(18 81 61)"
                />
              </g>
            ) : null}
            {pose === 'stop-flat' ? (
              <g>
                <rect x="28" y="58" width="64" height="16" rx="6" fill="#74B8D2" />
                <rect
                  className="sign-part-hand"
                  x="50"
                  y="30"
                  width="20"
                  height="40"
                  rx="6"
                  fill="#C7303A"
                />
              </g>
            ) : null}
            {pose === 'link-friends' ? (
              <g fill="none" stroke="#3661B0" strokeWidth="10" strokeLinecap="round">
                <path className="sign-part-left" d="M36 70 C48 40, 60 40, 60 60" />
                <path className="sign-part-right" d="M84 70 C72 40, 60 40, 60 60" />
              </g>
            ) : null}
            {pose === 'm-tap' ? (
              <g>
                <circle cx="60" cy="40" r="18" fill="#F0D2B0" />
                <ellipse className="sign-part-hand" cx="72" cy="56" rx="16" ry="20" fill="#8B3A6B" />
              </g>
            ) : null}
            {pose === 'd-tap' ? (
              <g>
                <circle cx="60" cy="40" r="18" fill="#F0D2B0" />
                <ellipse className="sign-part-hand" cx="72" cy="32" rx="16" ry="18" fill="#3661B0" />
              </g>
            ) : null}
            {pose === 'play-y' ? (
              <g fill="#E0B84A">
                <g className="sign-part-left">
                  <ellipse cx="40" cy="64" rx="14" ry="18" />
                  <rect x="28" y="40" width="10" height="24" rx="5" transform="rotate(-28 33 52)" />
                </g>
                <g className="sign-part-right">
                  <ellipse cx="80" cy="64" rx="14" ry="18" />
                  <rect x="82" y="40" width="10" height="24" rx="5" transform="rotate(28 87 52)" />
                </g>
              </g>
            ) : null}
          </g>
        </svg>
        {live ? (
          <span className="sign-live-badge" aria-hidden="true">
            Live sign
          </span>
        ) : null}
      </div>
    </div>
  )
}
