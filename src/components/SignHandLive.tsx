import { useEffect, useState, type ReactNode } from 'react'
import type { SignPose } from '../data/signs'

type Props = {
  pose: SignPose
  title?: string
  replayKey?: string | number
  large?: boolean
}

/** Detailed palm + fingers for flipbook frames. */
function Hand({
  x,
  y,
  rot = 0,
  scale = 1,
  mirror = false,
  skin = '#F0D2B0',
  sleeve = '#3661B0',
}: {
  x: number
  y: number
  rot?: number
  scale?: number
  mirror?: boolean
  skin?: string
  sleeve?: string
}) {
  const sx = mirror ? -scale : scale
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sx} ${scale})`}>
      <ellipse cx="0" cy="18" rx="16" ry="12" fill={sleeve} />
      <ellipse cx="0" cy="0" rx="18" ry="20" fill={skin} />
      <rect x="-7" y="-38" width="7" height="26" rx="3.5" fill={skin} />
      <rect x="-1" y="-40" width="7" height="28" rx="3.5" fill={skin} />
      <rect x="5" y="-36" width="7" height="24" rx="3.5" fill={skin} />
      <rect x="11" y="-30" width="6" height="18" rx="3" fill={skin} />
      <rect x="-16" y="-8" width="8" height="18" rx="4" fill={skin} transform="rotate(-35 -12 1)" />
    </g>
  )
}

type Frame = { label: string; nodes: ReactNode }

function framesFor(pose: SignPose): Frame[] {
  switch (pose) {
    case 'wave':
      return [
        {
          label: 'Hand up',
          nodes: (
            <>
              <circle cx="60" cy="34" r="14" fill="#F0D2B0" />
              <Hand x={78} y={48} rot={-20} />
            </>
          ),
        },
        {
          label: 'Wave out',
          nodes: (
            <>
              <circle cx="60" cy="34" r="14" fill="#F0D2B0" />
              <Hand x={88} y={44} rot={18} />
            </>
          ),
        },
        {
          label: 'Wave back',
          nodes: (
            <>
              <circle cx="60" cy="34" r="14" fill="#F0D2B0" />
              <Hand x={72} y={46} rot={-28} />
            </>
          ),
        },
      ]
    case 'chin-out':
      return [
        {
          label: 'Touch chin',
          nodes: (
            <>
              <circle cx="60" cy="36" r="16" fill="#F0D2B0" />
              <Hand x={58} y={58} rot={10} scale={0.9} />
            </>
          ),
        },
        {
          label: 'Move forward',
          nodes: (
            <>
              <circle cx="60" cy="36" r="16" fill="#F0D2B0" />
              <Hand x={86} y={50} rot={-8} scale={0.9} />
            </>
          ),
        },
      ]
    case 'circle-chest':
      return [
        {
          label: 'On chest',
          nodes: (
            <>
              <ellipse cx="60" cy="72" rx="28" ry="30" fill="#B7DAF5" />
              <Hand x={48} y={62} rot={-20} scale={0.85} />
            </>
          ),
        },
        {
          label: 'Circle',
          nodes: (
            <>
              <ellipse cx="60" cy="72" rx="28" ry="30" fill="#B7DAF5" />
              <Hand x={70} y={52} rot={30} scale={0.85} />
            </>
          ),
        },
        {
          label: 'Around',
          nodes: (
            <>
              <ellipse cx="60" cy="72" rx="28" ry="30" fill="#B7DAF5" />
              <Hand x={74} y={74} rot={100} scale={0.85} />
            </>
          ),
        },
      ]
    case 'tips-together':
      return [
        {
          label: 'Hands apart',
          nodes: (
            <>
              <Hand x={38} y={70} rot={20} scale={0.8} mirror />
              <Hand x={82} y={70} rot={-20} scale={0.8} />
            </>
          ),
        },
        {
          label: 'Tips tap',
          nodes: (
            <>
              <Hand x={50} y={62} rot={10} scale={0.8} mirror />
              <Hand x={70} y={62} rot={-10} scale={0.8} />
            </>
          ),
        },
      ]
    case 'thumbs-up':
      return [
        {
          label: 'Fist',
          nodes: <Hand x={60} y={68} rot={0} scale={1.05} />,
        },
        {
          label: 'Nod yes',
          nodes: <Hand x={60} y={68} rot={18} scale={1.05} />,
        },
        {
          label: 'Nod back',
          nodes: <Hand x={60} y={68} rot={-12} scale={1.05} />,
        },
      ]
    case 'thumbs-down':
      return [
        {
          label: 'Open',
          nodes: <Hand x={62} y={60} rot={-30} scale={1} sleeve="#C7303A" />,
        },
        {
          label: 'Close no',
          nodes: <Hand x={70} y={58} rot={10} scale={0.95} sleeve="#C7303A" />,
        },
      ]
    case 'fist-help':
      return [
        {
          label: 'Fist on palm',
          nodes: (
            <>
              <Hand x={60} y={86} rot={90} scale={0.85} sleeve="#74B8D2" />
              <Hand x={60} y={58} rot={0} scale={0.85} />
            </>
          ),
        },
        {
          label: 'Lift up',
          nodes: (
            <>
              <Hand x={60} y={70} rot={90} scale={0.85} sleeve="#74B8D2" />
              <Hand x={60} y={42} rot={0} scale={0.85} />
            </>
          ),
        },
      ]
    case 'hand-heart':
      return [
        {
          label: 'Cross arms',
          nodes: (
            <>
              <Hand x={48} y={70} rot={40} scale={0.9} mirror sleeve="#C7303A" />
              <Hand x={72} y={70} rot={-40} scale={0.9} sleeve="#C7303A" />
              <path
                d="M60 78 C48 68 48 58 54 56 C57 55 59 58 60 62 C61 58 63 55 66 56 C72 58 72 68 60 78Z"
                fill="#C7303A"
                opacity="0.9"
              />
            </>
          ),
        },
        {
          label: 'Hold heart',
          nodes: (
            <>
              <Hand x={46} y={72} rot={35} scale={0.9} mirror sleeve="#C7303A" />
              <Hand x={74} y={72} rot={-35} scale={0.9} sleeve="#C7303A" />
              <path
                d="M60 82 C44 68 46 54 56 54 C59 54 60 58 60 62 C60 58 61 54 64 54 C74 54 76 68 60 82Z"
                fill="#C7303A"
              />
            </>
          ),
        },
      ]
    case 'to-mouth':
      return [
        {
          label: 'Hand low',
          nodes: (
            <>
              <circle cx="60" cy="34" r="15" fill="#F0D2B0" />
              <Hand x={60} y={78} rot={0} scale={0.85} />
            </>
          ),
        },
        {
          label: 'To mouth',
          nodes: (
            <>
              <circle cx="60" cy="34" r="15" fill="#F0D2B0" />
              <Hand x={60} y={52} rot={0} scale={0.85} />
            </>
          ),
        },
      ]
    case 'cup-drink':
      return [
        {
          label: 'Cup hand',
          nodes: (
            <>
              <circle cx="60" cy="34" r="15" fill="#F0D2B0" />
              <Hand x={62} y={78} rot={-15} scale={0.9} />
            </>
          ),
        },
        {
          label: 'Tip to drink',
          nodes: (
            <>
              <circle cx="60" cy="34" r="15" fill="#F0D2B0" />
              <Hand x={68} y={48} rot={-40} scale={0.9} />
            </>
          ),
        },
      ]
    case 'palms-down':
      return [
        {
          label: 'Palms in',
          nodes: (
            <>
              <Hand x={40} y={64} rot={100} scale={0.85} mirror sleeve="#6BA84E" />
              <Hand x={80} y={64} rot={-100} scale={0.85} sleeve="#6BA84E" />
            </>
          ),
        },
        {
          label: 'Flip done',
          nodes: (
            <>
              <Hand x={34} y={74} rot={160} scale={0.85} mirror sleeve="#6BA84E" />
              <Hand x={86} y={74} rot={-160} scale={0.85} sleeve="#6BA84E" />
            </>
          ),
        },
      ]
    case 'stop-flat':
      return [
        {
          label: 'Hand up',
          nodes: (
            <>
              <Hand x={60} y={86} rot={90} scale={0.9} sleeve="#74B8D2" />
              <Hand x={60} y={40} rot={0} scale={0.9} sleeve="#C7303A" />
            </>
          ),
        },
        {
          label: 'Chop stop',
          nodes: (
            <>
              <Hand x={60} y={86} rot={90} scale={0.9} sleeve="#74B8D2" />
              <Hand x={60} y={62} rot={0} scale={0.9} sleeve="#C7303A" />
            </>
          ),
        },
      ]
    case 'link-friends':
      return [
        {
          label: 'Hook',
          nodes: (
            <>
              <Hand x={44} y={70} rot={25} scale={0.8} mirror />
              <Hand x={76} y={70} rot={-25} scale={0.8} />
            </>
          ),
        },
        {
          label: 'Switch',
          nodes: (
            <>
              <Hand x={48} y={62} rot={-15} scale={0.8} mirror />
              <Hand x={72} y={62} rot={15} scale={0.8} />
            </>
          ),
        },
      ]
    case 'm-tap':
      return [
        {
          label: 'Near chin',
          nodes: (
            <>
              <circle cx="60" cy="40" r="16" fill="#F0D2B0" />
              <Hand x={78} y={58} rot={-25} scale={0.85} sleeve="#8B3A6B" />
            </>
          ),
        },
        {
          label: 'Tap chin',
          nodes: (
            <>
              <circle cx="60" cy="40" r="16" fill="#F0D2B0" />
              <Hand x={68} y={52} rot={-10} scale={0.85} sleeve="#8B3A6B" />
            </>
          ),
        },
      ]
    case 'd-tap':
      return [
        {
          label: 'Near forehead',
          nodes: (
            <>
              <circle cx="60" cy="40" r="16" fill="#F0D2B0" />
              <Hand x={78} y={36} rot={-20} scale={0.85} />
            </>
          ),
        },
        {
          label: 'Tap forehead',
          nodes: (
            <>
              <circle cx="60" cy="40" r="16" fill="#F0D2B0" />
              <Hand x={70} y={30} rot={-5} scale={0.85} />
            </>
          ),
        },
      ]
    case 'play-y':
      return [
        {
          label: 'Y hands',
          nodes: (
            <>
              <Hand x={40} y={68} rot={-25} scale={0.85} sleeve="#E0B84A" />
              <Hand x={80} y={68} rot={25} scale={0.85} sleeve="#E0B84A" />
            </>
          ),
        },
        {
          label: 'Shake play',
          nodes: (
            <>
              <Hand x={36} y={64} rot={15} scale={0.85} sleeve="#E0B84A" />
              <Hand x={84} y={64} rot={-15} scale={0.85} sleeve="#E0B84A" />
            </>
          ),
        },
      ]
    default:
      return [{ label: 'Sign', nodes: <Hand x={60} y={70} /> }]
  }
}

/**
 * Multi-frame “live” sign demo — flipbook of clearer hand illustrations.
 */
export function SignHandLive({ pose, title, replayKey = 0, large }: Props) {
  const frames = framesFor(pose)
  const [frame, setFrame] = useState(0)
  const reduced =
    typeof document !== 'undefined' &&
    (document.documentElement.dataset.reducedMotion === 'true' ||
      document.documentElement.dataset.noSudden === 'true')

  useEffect(() => {
    setFrame(0)
  }, [pose, replayKey])

  useEffect(() => {
    if (reduced || frames.length < 2) return
    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % frames.length)
    }, 700)
    return () => window.clearInterval(id)
  }, [pose, replayKey, frames.length, reduced])

  const current = frames[frame] ?? frames[0]

  return (
    <div className={`sign-live-hq ${large ? 'is-large' : ''}`}>
      <svg
        className="sign-hand-svg"
        viewBox="0 0 120 120"
        role="img"
        aria-label={title || current.label}
      >
        <defs>
          <linearGradient id="signBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F7F7F2" />
            <stop offset="100%" stopColor="#D6E6F6" />
          </linearGradient>
        </defs>
        <rect width="120" height="120" rx="26" fill="url(#signBg)" />
        {current.nodes}
      </svg>
      <div className="sign-live-meta">
        <span className="sign-live-badge">Live sign</span>
        <span className="sign-frame-label">{current.label}</span>
      </div>
      <div className="sign-frame-dots" aria-hidden="true">
        {frames.map((_, i) => (
          <span key={i} className={i === frame ? 'is-on' : ''} />
        ))}
      </div>
    </div>
  )
}

// Re-export alias used by older imports
export { SignHandLive as SignHand }
