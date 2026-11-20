import { useEffect, useId, useMemo, useState } from 'react'
import type { SignPose } from '../data/signs'

type Props = {
  pose: SignPose
  title?: string
  emoji?: string
  how?: string
  replayKey?: string | number
  large?: boolean
}

const CLIP_MS = 2400

/** Still “photo card” frames — clarity over fancy animation. */
const PHOTO_FRAMES: Record<SignPose, [string, string, string]> = {
  wave: ['Hand up', 'Open near forehead', 'Wave out'],
  'chin-out': ['Fingers on chin', 'Hand flat', 'Move forward'],
  'circle-chest': ['Flat on chest', 'Start circle', 'Finish circle'],
  'tips-together': ['Tips face in', 'Move closer', 'Tap tips'],
  'thumbs-up': ['Make a fist', 'Thumb up', 'Nod yes'],
  'thumbs-down': ['Two fingers out', 'Near thumb', 'Close for no'],
  'fist-help': ['Palm open', 'Fist on palm', 'Lift up'],
  'hand-heart': ['Arms open', 'Cross on chest', 'Hold heart'],
  'to-mouth': ['Tips together', 'Near mouth', 'Tap eat'],
  'cup-drink': ['Make a C', 'Like a cup', 'Tip to mouth'],
  'palms-down': ['Palms face in', 'Flip out', 'All done'],
  'stop-flat': ['One palm flat', 'Other hand edge', 'Chop stop'],
  'link-friends': ['Hook one', 'Hook other', 'Switch'],
  'm-tap': ['Open hand', 'At chin', 'Thumb tap'],
  'd-tap': ['Open hand', 'At forehead', 'Thumb tap'],
  'play-y': ['Y hands', 'Hold out', 'Shake play'],
  wait: ['Palms up', 'Wiggle fingers', 'Wait'],
  want: ['Hands claw', 'Pull to chest', 'Want'],
  bathroom: ['Fist + T', 'At side', 'Shake bathroom'],
  home: ['Fingertips', 'Cheek to chin', 'Home'],
}

/**
 * Short looping ASL video + photo cards.
 * Offline SVG signer (no external copyrighted clips).
 */
export function SignHandLive({
  pose,
  title,
  emoji = '✋',
  how,
  replayKey = 0,
  large,
}: Props) {
  const labelId = useId()
  const [playing, setPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [localReplay, setLocalReplay] = useState(0)
  const [photoFocus, setPhotoFocus] = useState(0)
  const reduced =
    typeof document !== 'undefined' &&
    (document.documentElement.dataset.reducedMotion === 'true' ||
      document.documentElement.dataset.noSudden === 'true')

  const caption = useMemo(() => title || 'Sign clip', [title])
  const frames = useMemo(() => PHOTO_FRAMES[pose] ?? PHOTO_FRAMES.wave, [pose])
  const clipKey = `${pose}-${replayKey}-${localReplay}`

  useEffect(() => {
    setProgress(0)
    setPhotoFocus(0)
    setPlaying(!reduced)
  }, [clipKey, reduced])

  useEffect(() => {
    if (reduced || !playing) return
    let raf = 0
    const started = performance.now()
    const tick = (now: number) => {
      const elapsed = (now - started) % CLIP_MS
      const p = elapsed / CLIP_MS
      setProgress(p)
      setPhotoFocus(Math.min(2, Math.floor(p * 3)))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, clipKey, reduced])

  return (
    <div
      className={`sign-video-card ${large ? 'is-large' : ''} ${playing && !reduced ? 'is-playing' : ''}`}
      aria-labelledby={labelId}
    >
      <div className="sign-video-stage" data-pose={pose}>
        <div className="sign-video-sky" aria-hidden="true" />
        <SignerClip pose={pose} playing={playing && !reduced} />
        <div className="sign-video-caption">
          <span className="sign-video-emoji" aria-hidden="true">
            {emoji}
          </span>
          <strong id={labelId}>{caption}</strong>
        </div>
        <span className="sign-video-badge">Clip</span>
        <div className="sign-video-progress" aria-hidden="true">
          <span style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      </div>

      <ol className="sign-photo-strip" aria-label="Photo steps">
        {frames.map((label, i) => (
          <li key={label} className={i === photoFocus ? 'is-focus' : ''}>
            <button type="button" className="sign-photo-card" onClick={() => setPhotoFocus(i)}>
              <span className="sign-photo-frame" data-pose={pose} data-frame={i} aria-hidden="true">
                <SignerClip pose={pose} playing={false} />
              </span>
              <span className="sign-photo-label">
                <em>{i + 1}</em> {label}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="sign-video-controls">
        <button
          type="button"
          className="sign-video-btn"
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={playing}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          className="sign-video-btn"
          onClick={() => {
            setLocalReplay((n) => n + 1)
            setPlaying(true)
          }}
        >
          Replay
        </button>
      </div>

      {how ? <p className="sign-how">{how}</p> : null}
    </div>
  )
}

/** Soft upper-body silhouette with animated hands — reads like a short demo clip. */
function SignerClip({ pose, playing }: { pose: SignPose; playing: boolean }) {
  const uid = useId().replace(/:/g, '')
  const skinId = `signerSkin-${uid}`
  const shirtId = `signerShirt-${uid}`

  return (
    <svg
      className={`sign-signer ${playing ? 'is-live' : ''}`}
      viewBox="0 0 200 220"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={skinId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a7fa8" />
          <stop offset="100%" stopColor="#3d5f86" />
        </linearGradient>
        <linearGradient id={shirtId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#74b8d2" />
          <stop offset="100%" stopColor="#3661b0" />
        </linearGradient>
      </defs>

      {/* torso */}
      <ellipse cx="100" cy="188" rx="58" ry="28" fill={`url(#${shirtId})`} opacity="0.95" />
      <path
        d="M52 170 C58 130, 72 112, 100 108 C128 112, 142 130, 148 170 Z"
        fill={`url(#${shirtId})`}
      />
      {/* neck + head */}
      <rect x="90" y="78" width="20" height="34" rx="8" fill={`url(#${skinId})`} />
      <circle cx="100" cy="58" r="32" fill={`url(#${skinId})`} />
      {/* soft face marks */}
      <ellipse cx="88" cy="58" rx="3.5" ry="4.5" fill="#2a4460" opacity="0.35" />
      <ellipse cx="112" cy="58" rx="3.5" ry="4.5" fill="#2a4460" opacity="0.35" />
      <path
        d="M90 72 Q100 78 110 72"
        fill="none"
        stroke="#2a4460"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.35"
      />

      <Hands pose={pose} />
    </svg>
  )
}

function Hands({ pose }: { pose: SignPose }) {
  switch (pose) {
    case 'wave':
      return (
        <g className="sign-hand-group sign-mover--wave">
          <Hand shape="open" x={118} y={42} rot={-18} />
        </g>
      )
    case 'chin-out':
      return (
        <g className="sign-hand-group sign-mover--chin-out">
          <Hand shape="flat" x={100} y={78} rot={10} />
        </g>
      )
    case 'circle-chest':
      return (
        <g className="sign-hand-group sign-mover--circle-chest">
          <Hand shape="flat" x={100} y={130} rot={0} />
        </g>
      )
    case 'tips-together':
      return (
        <g className="sign-hand-group">
          <g className="sign-part-left">
            <Hand shape="bunch" x={78} y={120} rot={-20} />
          </g>
          <g className="sign-part-right">
            <Hand shape="bunch" x={122} y={120} rot={20} />
          </g>
        </g>
      )
    case 'thumbs-up':
      return (
        <g className="sign-hand-group sign-mover--thumbs-up">
          <Hand shape="fist-thumb" x={118} y={100} rot={0} />
        </g>
      )
    case 'thumbs-down':
      return (
        <g className="sign-hand-group sign-mover--thumbs-down">
          <Hand shape="pinch" x={118} y={100} rot={0} />
        </g>
      )
    case 'fist-help':
      return (
        <g className="sign-hand-group sign-mover--fist-help">
          <Hand shape="flat" x={100} y={145} rot={0} scale={1.05} />
          <Hand shape="fist" x={100} y={128} rot={0} />
        </g>
      )
    case 'hand-heart':
      return (
        <g className="sign-hand-group sign-mover--hand-heart">
          <Hand shape="flat" x={78} y={130} rot={-35} />
          <Hand shape="flat" x={122} y={130} rot={35} />
        </g>
      )
    case 'to-mouth':
      return (
        <g className="sign-hand-group sign-mover--to-mouth">
          <Hand shape="bunch" x={100} y={78} rot={0} />
        </g>
      )
    case 'cup-drink':
      return (
        <g className="sign-hand-group sign-mover--cup-drink">
          <Hand shape="cup" x={108} y={78} rot={-12} />
        </g>
      )
    case 'palms-down':
      return (
        <g className="sign-hand-group">
          <g className="sign-part-left">
            <Hand shape="flat" x={72} y={120} rot={-8} />
          </g>
          <g className="sign-part-right">
            <Hand shape="flat" x={128} y={120} rot={8} />
          </g>
        </g>
      )
    case 'stop-flat':
      return (
        <g className="sign-hand-group sign-mover--stop-flat">
          <Hand shape="flat" x={88} y={130} rot={90} scale={1.05} />
          <Hand shape="edge" x={118} y={110} rot={0} />
        </g>
      )
    case 'link-friends':
      return (
        <g className="sign-hand-group">
          <g className="sign-part-left">
            <Hand shape="hook" x={86} y={120} rot={-10} />
          </g>
          <g className="sign-part-right">
            <Hand shape="hook" x={114} y={120} rot={10} />
          </g>
        </g>
      )
    case 'm-tap':
      return (
        <g className="sign-hand-group sign-mover--m-tap">
          <Hand shape="open" x={100} y={78} rot={0} />
        </g>
      )
    case 'd-tap':
      return (
        <g className="sign-hand-group sign-mover--d-tap">
          <Hand shape="open" x={100} y={48} rot={0} />
        </g>
      )
    case 'play-y':
      return (
        <g className="sign-hand-group">
          <g className="sign-part-left">
            <Hand shape="y" x={70} y={110} rot={-15} />
          </g>
          <g className="sign-part-right">
            <Hand shape="y" x={130} y={110} rot={15} />
          </g>
        </g>
      )
    case 'wait':
      return (
        <g className="sign-hand-group">
          <g className="sign-part-left">
            <Hand shape="flat" x={72} y={120} rot={-8} />
          </g>
          <g className="sign-part-right">
            <Hand shape="flat" x={128} y={120} rot={8} />
          </g>
        </g>
      )
    case 'want':
      return (
        <g className="sign-hand-group sign-mover--want">
          <Hand shape="bunch" x={78} y={130} rot={-15} />
          <Hand shape="bunch" x={122} y={130} rot={15} />
        </g>
      )
    case 'bathroom':
      return (
        <g className="sign-hand-group sign-mover--bathroom">
          <Hand shape="fist-thumb" x={130} y={110} rot={0} />
        </g>
      )
    case 'home':
      return (
        <g className="sign-hand-group sign-mover--home">
          <Hand shape="bunch" x={88} y={62} rot={-10} />
        </g>
      )
    default:
      return (
        <g className="sign-hand-group">
          <Hand shape="open" x={118} y={90} rot={0} />
        </g>
      )
  }
}

type HandShape =
  | 'open'
  | 'flat'
  | 'fist'
  | 'fist-thumb'
  | 'bunch'
  | 'cup'
  | 'pinch'
  | 'hook'
  | 'y'
  | 'edge'

function Hand({
  shape,
  x,
  y,
  rot = 0,
  scale = 1,
}: {
  shape: HandShape
  x: number
  y: number
  rot?: number
  scale?: number
}) {
  return (
    <g
      className="sign-part-hand"
      transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}
    >
      {shape === 'open' ? (
        <g fill="#d8e6f4" stroke="#2a4460" strokeWidth="2.2" strokeLinejoin="round">
          <path d="M-10 8 C-14 -2, -8 -18, -2 -22 L2 -6" />
          <path d="M-2 6 C-4 -8, 0 -26, 4 -28 L6 -8" />
          <path d="M6 6 C8 -6, 10 -24, 14 -26 L14 -6" />
          <path d="M14 8 C18 -2, 20 -16, 22 -18 L20 -2" />
          <path d="M-12 10 C-18 4, -16 -6, -8 -8 L-4 6" />
          <ellipse cx="4" cy="14" rx="14" ry="12" />
        </g>
      ) : null}
      {shape === 'flat' ? (
        <g fill="#d8e6f4" stroke="#2a4460" strokeWidth="2.2" strokeLinejoin="round">
          <rect x="-14" y="-18" width="28" height="36" rx="10" />
          <path d="M-10 -18 V-28 M-2 -18 V-30 M6 -18 V-28 M12 -16 V-24" strokeLinecap="round" />
        </g>
      ) : null}
      {shape === 'fist' ? (
        <g fill="#d8e6f4" stroke="#2a4460" strokeWidth="2.2">
          <rect x="-14" y="-10" width="28" height="24" rx="11" />
        </g>
      ) : null}
      {shape === 'fist-thumb' ? (
        <g fill="#d8e6f4" stroke="#2a4460" strokeWidth="2.2" strokeLinejoin="round">
          <rect x="-14" y="-6" width="28" height="24" rx="11" />
          <path d="M-2 -6 V-24" strokeLinecap="round" strokeWidth="5" />
        </g>
      ) : null}
      {shape === 'bunch' ? (
        <g fill="#d8e6f4" stroke="#2a4460" strokeWidth="2.2" strokeLinejoin="round">
          <path d="M0 -18 C8 -14, 12 -4, 10 8 C6 18, -6 18, -10 8 C-12 -4, -8 -14, 0 -18 Z" />
        </g>
      ) : null}
      {shape === 'cup' ? (
        <g fill="none" stroke="#d8e6f4" strokeWidth="7" strokeLinecap="round">
          <path d="M-14 -8 C-18 10, -8 22, 0 24 C8 22, 18 10, 14 -8" />
          <path d="M-12 -10 H12" strokeWidth="5" />
        </g>
      ) : null}
      {shape === 'pinch' ? (
        <g fill="#d8e6f4" stroke="#2a4460" strokeWidth="2.2" strokeLinecap="round">
          <path d="M-6 -20 V4 M2 -18 V4" />
          <path d="M10 -4 C14 2, 12 12, 4 14" />
          <ellipse cx="0" cy="12" rx="12" ry="10" />
        </g>
      ) : null}
      {shape === 'hook' ? (
        <g fill="none" stroke="#d8e6f4" strokeWidth="6" strokeLinecap="round">
          <path d="M-8 10 V-6 C-8 -16, 8 -16, 8 -4" />
        </g>
      ) : null}
      {shape === 'y' ? (
        <g fill="#d8e6f4" stroke="#2a4460" strokeWidth="2.2" strokeLinecap="round">
          <ellipse cx="0" cy="8" rx="12" ry="11" />
          <path d="M-10 0 L-18 -16 M10 0 L18 -16" strokeWidth="5" />
        </g>
      ) : null}
      {shape === 'edge' ? (
        <g fill="#d8e6f4" stroke="#2a4460" strokeWidth="2.2">
          <rect x="-8" y="-22" width="16" height="40" rx="7" />
        </g>
      ) : null}
    </g>
  )
}

export { SignHandLive as SignHand }
