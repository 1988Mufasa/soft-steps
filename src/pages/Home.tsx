import { Link } from 'react-router-dom'
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
  const { settings, online, progress } = useApp()
  const enabled = MODULES.filter((m) => settings.enabledModules[m.id])
  const care = CARE.filter((m) => settings.enabledCareModules[m.id])

  return (
    <div className="home">
      <header className="hero">
        <div className="hero-copy">
          <p className="brand">Soft Steps</p>
          <h1>Learn gently, one step at a time</h1>
          <p className="hero-sub">
            Calm tools, schedules, talk boards, and practice — for ages 3–12.
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
              <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#B8D9C8" />
                <stop offset="100%" stopColor="#7EB8A8" />
              </linearGradient>
            </defs>
            <rect width="320" height="240" rx="28" fill="url(#sky)" />
            <circle cx="250" cy="56" r="28" fill="#F6E7A1" opacity="0.9" />
            <ellipse cx="90" cy="170" rx="70" ry="28" fill="#5F9E88" opacity="0.55" />
            <ellipse cx="180" cy="190" rx="90" ry="30" fill="#4F8F7A" opacity="0.45" />
            <rect x="120" y="100" width="70" height="70" rx="14" fill="#F4FBF7" />
            <text
              x="155"
              y="148"
              textAnchor="middle"
              fontSize="42"
              fontFamily="Nunito, sans-serif"
              fill="#2C4A42"
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

      <footer className="home-footer">
        <Link to="/parent" className="parent-link">
          Grown-ups
        </Link>
      </footer>
    </div>
  )
}
