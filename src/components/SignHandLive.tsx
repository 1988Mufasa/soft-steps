import { useEffect, useMemo, useState } from 'react'
import type { SignPose } from '../data/signs'

type Props = {
  pose: SignPose
  title?: string
  emoji?: string
  how?: string
  replayKey?: string | number
  large?: boolean
}

type Step = {
  caption: string
  /** Direction hint shown under the emoji stage */
  arrow: 'wave' | 'forward' | 'circle' | 'tap' | 'up' | 'down' | 'together' | 'cross' | 'shake'
}

const STEPS: Record<SignPose, Step[]> = {
  wave: [
    { caption: 'Hand near forehead', arrow: 'up' },
    { caption: 'Wave out and back', arrow: 'wave' },
  ],
  'chin-out': [
    { caption: 'Fingers touch chin', arrow: 'tap' },
    { caption: 'Move hand forward', arrow: 'forward' },
  ],
  'circle-chest': [
    { caption: 'Flat hand on chest', arrow: 'tap' },
    { caption: 'Circle gently', arrow: 'circle' },
  ],
  'tips-together': [
    { caption: 'Fingertips face in', arrow: 'together' },
    { caption: 'Tap tips together', arrow: 'tap' },
  ],
  'thumbs-up': [
    { caption: 'Make a fist', arrow: 'up' },
    { caption: 'Nod fist like “yes”', arrow: 'shake' },
  ],
  'thumbs-down': [
    { caption: 'Two fingers + thumb', arrow: 'together' },
    { caption: 'Close for “no”', arrow: 'tap' },
  ],
  'fist-help': [
    { caption: 'Fist on open palm', arrow: 'tap' },
    { caption: 'Lift both hands up', arrow: 'up' },
  ],
  'hand-heart': [
    { caption: 'Cross arms on chest', arrow: 'cross' },
    { caption: 'Hold over your heart', arrow: 'tap' },
  ],
  'to-mouth': [
    { caption: 'Fingertips near mouth', arrow: 'up' },
    { caption: 'Tap like eating', arrow: 'tap' },
  ],
  'cup-drink': [
    { caption: 'Make a C-hand cup', arrow: 'up' },
    { caption: 'Tip toward mouth', arrow: 'forward' },
  ],
  'palms-down': [
    { caption: 'Palms face in', arrow: 'together' },
    { caption: 'Flip palms down — done', arrow: 'down' },
  ],
  'stop-flat': [
    { caption: 'One palm flat', arrow: 'up' },
    { caption: 'Chop for “stop”', arrow: 'down' },
  ],
  'link-friends': [
    { caption: 'Hook index fingers', arrow: 'together' },
    { caption: 'Switch hooks', arrow: 'shake' },
  ],
  'm-tap': [
    { caption: 'Open hand at chin', arrow: 'up' },
    { caption: 'Thumb taps chin', arrow: 'tap' },
  ],
  'd-tap': [
    { caption: 'Open hand at forehead', arrow: 'up' },
    { caption: 'Thumb taps forehead', arrow: 'tap' },
  ],
  'play-y': [
    { caption: 'Make Y hands', arrow: 'shake' },
    { caption: 'Shake side to side', arrow: 'wave' },
  ],
}

function MotionArrow({ kind }: { kind: Step['arrow'] }) {
  return (
    <svg className={`sign-arrow sign-arrow--${kind}`} viewBox="0 0 120 40" aria-hidden="true">
      {kind === 'wave' ? (
        <path
          className="sign-arrow-path"
          d="M10 28 C30 8, 50 32, 70 12 S100 28, 110 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
      ) : null}
      {kind === 'forward' ? (
        <path
          className="sign-arrow-path"
          d="M16 20 H92 M78 8 L104 20 L78 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
      {kind === 'circle' ? (
        <circle
          className="sign-arrow-path"
          cx="60"
          cy="20"
          r="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeDasharray="16 10"
        />
      ) : null}
      {kind === 'tap' ? (
        <g className="sign-arrow-path" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round">
          <path d="M60 6 V28" />
          <path d="M48 20 L60 32 L72 20" />
        </g>
      ) : null}
      {kind === 'up' ? (
        <g className="sign-arrow-path" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round">
          <path d="M60 34 V10" />
          <path d="M46 20 L60 6 L74 20" />
        </g>
      ) : null}
      {kind === 'down' ? (
        <g className="sign-arrow-path" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round">
          <path d="M60 6 V30" />
          <path d="M46 20 L60 34 L74 20" />
        </g>
      ) : null}
      {kind === 'together' ? (
        <g className="sign-arrow-path" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round">
          <path d="M20 20 H48 M36 10 L50 20 L36 30" />
          <path d="M100 20 H72 M84 10 L70 20 L84 30" />
        </g>
      ) : null}
      {kind === 'cross' ? (
        <g className="sign-arrow-path" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round">
          <path d="M30 10 L90 30" />
          <path d="M90 10 L30 30" />
        </g>
      ) : null}
      {kind === 'shake' ? (
        <path
          className="sign-arrow-path"
          d="M24 20 H44 M76 20 H96 M52 12 V28"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  )
}

/** Clean line-art hand icon (dictionary style), not fleshy cartoons. */
function LineHand({ variant = 'open' }: { variant?: 'open' | 'fist' | 'point' | 'cup' }) {
  return (
    <svg className="sign-line-hand" viewBox="0 0 80 80" aria-hidden="true">
      {variant === 'open' ? (
        <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M28 70 V38" />
          <path d="M40 72 V28" />
          <path d="M52 70 V34" />
          <path d="M62 66 V42" />
          <path d="M20 58 C14 50, 16 40, 26 38" />
          <path d="M26 50 C26 62, 54 66, 60 52" />
        </g>
      ) : null}
      {variant === 'fist' ? (
        <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
          <rect x="22" y="34" width="36" height="28" rx="12" />
          <path d="M40 34 V18" />
        </g>
      ) : null}
      {variant === 'point' ? (
        <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
          <path d="M30 66 V40" />
          <path d="M42 68 V22" />
          <path d="M54 64 V44" />
          <path d="M22 52 C18 46, 20 38, 28 36" />
        </g>
      ) : null}
      {variant === 'cup' ? (
        <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
          <path d="M24 30 C18 44, 20 62, 40 66 C60 62, 62 44, 56 30" />
          <path d="M28 30 H52" />
        </g>
      ) : null}
    </svg>
  )
}

function handVariant(pose: SignPose): 'open' | 'fist' | 'point' | 'cup' {
  if (pose === 'thumbs-up' || pose === 'fist-help') return 'fist'
  if (pose === 'cup-drink') return 'cup'
  if (pose === 'stop-flat' || pose === 'thumbs-down') return 'point'
  return 'open'
}

/**
 * Storyboard-style live sign demo:
 * big meaning emoji + motion arrow + line-art hand + step captions.
 * Replaces the old fleshy cartoon hands.
 */
export function SignHandLive({
  pose,
  title,
  emoji = '✋',
  how,
  replayKey = 0,
  large,
}: Props) {
  const steps = useMemo(() => STEPS[pose] ?? STEPS.wave, [pose])
  const [step, setStep] = useState(0)
  const reduced =
    typeof document !== 'undefined' &&
    (document.documentElement.dataset.reducedMotion === 'true' ||
      document.documentElement.dataset.noSudden === 'true')

  useEffect(() => {
    setStep(0)
  }, [pose, replayKey])

  useEffect(() => {
    if (reduced || steps.length < 2) return
    const id = window.setInterval(() => {
      setStep((s) => (s + 1) % steps.length)
    }, 1100)
    return () => window.clearInterval(id)
  }, [pose, replayKey, steps.length, reduced])

  const current = steps[step] ?? steps[0]

  return (
    <div className={`sign-storyboard ${large ? 'is-large' : ''}`} aria-label={title || 'Live sign'}>
      <div className="sign-storyboard-stage">
        <span className="sign-storyboard-emoji" aria-hidden="true">
          {emoji}
        </span>
        <div className={`sign-storyboard-hand is-step-${step}`} data-pose={pose}>
          <LineHand variant={handVariant(pose)} />
        </div>
        <MotionArrow kind={current.arrow} />
        <span className="sign-live-badge">Live steps</span>
      </div>

      <ol className="sign-storyboard-steps">
        {steps.map((s, i) => (
          <li key={s.caption} className={i === step ? 'is-current' : i < step ? 'is-done' : ''}>
            <span className="sign-step-num">{i + 1}</span>
            <span>{s.caption}</span>
          </li>
        ))}
      </ol>

      {how ? <p className="sign-how">{how}</p> : null}
    </div>
  )
}

export { SignHandLive as SignHand }
