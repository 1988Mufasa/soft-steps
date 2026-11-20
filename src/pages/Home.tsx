import { Link, useNavigate } from 'react-router-dom'
import { HappyFaceHold } from '../components/HappyFaceHold'
import { useApp } from '../store/AppContext'
import type { CareModuleId, ModuleId } from '../types'

const MODULES: {
  id: ModuleId
  title: string
  blurb: string
  path: string
  accent: string
}[] = [
  { id: 'abc', title: 'ABCs', blurb: 'Find the letter', path: '/abc', accent: 'mod-abc' },
  { id: 'shapes', title: 'Shapes', blurb: 'Match the shape', path: '/shapes', accent: 'mod-shapes' },
  { id: 'colors', title: 'Colors', blurb: 'Name the color', path: '/colors', accent: 'mod-colors' },
  { id: 'numbers', title: 'Numbers', blurb: 'Count and choose', path: '/numbers', accent: 'mod-numbers' },
]

const CARE: {
  id: CareModuleId
  title: string
  blurb: string
  path: string
}[] = [
  { id: 'calm', title: 'Calm toolkit', blurb: 'Breathe, liquid, bubbles, sand', path: '/calm' },
  { id: 'feelings', title: 'Feelings', blurb: 'Body + emotion check-in', path: '/feelings' },
  { id: 'schedule', title: 'First / Then', blurb: 'Routine · timer · rewards', path: '/schedule' },
  { id: 'stories', title: 'What to expect', blurb: 'Picture social stories', path: '/stories' },
  { id: 'talk', title: 'Talk board', blurb: 'Offline AAC by time of day', path: '/talk' },
  { id: 'friends', title: 'Social cues', blurb: 'Gentle practice scenes', path: '/friends' },
  { id: 'interest', title: 'Interest rewards', blurb: 'Unlock special-interest facts', path: '/interest' },
]

export function Home() {
  const navigate = useNavigate()
  const { settings, online, progress } = useApp()
  const enabled = MODULES.filter((m) => settings.enabledModules[m.id])
  const care = CARE.filter((m) => settings.enabledCareModules[m.id])

  return (
    <div className="home">
      <header className="hero">
        <div className="hero-copy">
          <p className="brand">Soft Steps</p>
          <span className="brand-ribbon" aria-hidden="true" />
          <h1>Learn gently, one step at a time</h1>
          <p className="hero-sub">
            Smart, kind, brave colors — calm tools for kids on the spectrum, ages 3–12.
          </p>
          <div className="status-row">
            <span className={`net-badge ${online ? 'is-online' : 'is-offline'}`}>
              {online ? 'Online ready' : 'Offline mode'}
            </span>
            <span className="age-badge">Ages {settings.ageBand}</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <svg viewBox="0 0 320 240" className="hero-svg">
            <defs>
              <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F7F7F2" />
                <stop offset="100%" stopColor="#E7EEF6" />
              </linearGradient>
              <linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#C7303A" />
                <stop offset="16%" stopColor="#C45137" />
                <stop offset="33%" stopColor="#E0B84A" />
                <stop offset="50%" stopColor="#6BA84E" />
                <stop offset="66%" stopColor="#5AADC8" />
                <stop offset="83%" stopColor="#3661B0" />
                <stop offset="100%" stopColor="#8B3A6B" />
              </linearGradient>
              <linearGradient id="pencil" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#74B8D2" />
                <stop offset="70%" stopColor="#5AADC8" />
                <stop offset="100%" stopColor="#E0B84A" />
              </linearGradient>
            </defs>
            <rect width="320" height="240" rx="32" fill="url(#sky)" />
            {/* notebook lines */}
            <g stroke="#74B8D2" strokeWidth="1.5" opacity="0.35">
              <line x1="24" y1="56" x2="296" y2="56" />
              <line x1="24" y1="88" x2="296" y2="88" />
              <line x1="24" y1="120" x2="296" y2="120" />
              <line x1="24" y1="152" x2="296" y2="152" />
              <line x1="24" y1="184" x2="296" y2="184" />
            </g>
            <path
              d="M24 204 C70 160, 120 230, 160 170 C200 110, 250 220, 296 150"
              fill="none"
              stroke="url(#ribbon)"
              strokeWidth="14"
              strokeLinecap="round"
              opacity="0.95"
            />
            <rect x="98" y="70" width="124" height="36" rx="10" fill="url(#pencil)" />
            <polygon points="222,70 250,88 222,106" fill="#E0B84A" />
            <rect x="118" y="118" width="84" height="84" rx="22" fill="#FFFFFF" stroke="#3661B0" strokeWidth="4" />
            <text
              x="160"
              y="178"
              textAnchor="middle"
              fontSize="48"
              fontWeight="800"
              fontFamily="Nunito, sans-serif"
              fill="#C7303A"
            >
              A
            </text>
          </svg>
        </div>
      </header>

      {settings.enabledCareModules.calm ? (
        <section className="section">
          <Link to="/meltdown" className="meltdown-home-btn" aria-label="Meltdown Mode — quiet calm tools">
            <span className="meltdown-home-orb" aria-hidden="true" />
            <span>Quiet calm</span>
          </Link>
        </section>
      ) : null}

      <section className="section">
        <div className="section-head">
          <h2>
            <span className="eyebrow offline-tag">Offline</span> Care & routines
          </h2>
          <p>Calming, feelings, schedules, talk, stories — work without Wi‑Fi.</p>
        </div>
        <div className="module-grid care-grid">
          {care.map((mod) => (
            <Link key={mod.id} to={mod.path} className="module-card mod-care">
              <span className="module-title">{mod.title}</span>
              <span className="module-blurb">{mod.blurb}</span>
            </Link>
          ))}
          {care.length === 0 ? (
            <p className="empty-note">Care tools are turned off in Parent tools.</p>
          ) : null}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>
            <span className="eyebrow offline-tag">Offline</span> Practice
          </h2>
          <p>ABCs, shapes, colors, and numbers.</p>
        </div>
        <div className="module-grid">
          {enabled.map((mod) => {
            const p = progress[mod.id]
            return (
              <Link key={mod.id} to={mod.path} className={`module-card ${mod.accent}`}>
                <span className="module-title">{mod.title}</span>
                <span className="module-blurb">{mod.blurb}</span>
                <span className="module-stat">
                  {p.correct} correct · best ★ {p.bestStreak}
                </span>
              </Link>
            )
          })}
          {enabled.length === 0 ? (
            <p className="empty-note">Practice modules are turned off in Parent tools.</p>
          ) : null}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>
            <span className="eyebrow online-tag">Online</span> Network activities
          </h2>
          <p>Needs Wi‑Fi for mix quizzes, gentle timed rounds, and multi-step paths.</p>
        </div>
        {settings.onlineExtrasEnabled ? (
          <Link to="/online" className={`online-card ${online ? '' : 'is-disabled'}`}>
            <div>
              <strong>Open online hub</strong>
              <p>
                {online
                  ? 'Mix quiz · Gentle timer · Multi-step match'
                  : 'You’re offline — open for a clear message, or use Offline tools above'}
              </p>
            </div>
            <span className="chev">→</span>
          </Link>
        ) : (
          <p className="empty-note">Online extras are turned off in Parent tools.</p>
        )}
      </section>

      <footer className="home-footer home-footer-secure">
        <HappyFaceHold onUnlock={() => navigate('/parent')} />
      </footer>
    </div>
  )
}
