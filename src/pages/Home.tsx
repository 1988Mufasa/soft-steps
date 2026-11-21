import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HappyFaceHold } from '../components/HappyFaceHold'
import { InstallPrompt } from '../components/InstallPrompt'
import { useApp } from '../store/AppContext'
import type { CareModuleId, ModuleId } from '../types'

const MODULES: {
  id: ModuleId
  title: string
  blurb: string
  path: string
  accent: string
}[] = [
  { id: 'abc', title: 'ABCs', blurb: '8-round letter adventure', path: '/abc', accent: 'mod-abc' },
  { id: 'shapes', title: 'Shapes', blurb: 'Shape hunt game', path: '/shapes', accent: 'mod-shapes' },
  { id: 'colors', title: 'Colors', blurb: 'Color quest game', path: '/colors', accent: 'mod-colors' },
  {
    id: 'numbers',
    title: 'Numbers',
    blurb: 'Counting star game',
    path: '/numbers',
    accent: 'mod-numbers',
  },
  {
    id: 'signs',
    title: 'Sign language',
    blurb: 'Photo & clip sign games',
    path: '/signs',
    accent: 'mod-signs',
  },
  {
    id: 'foods',
    title: 'Foods',
    blurb: 'Fruits & vegetables games',
    path: '/foods',
    accent: 'mod-foods',
  },
]

const CARE: {
  id: CareModuleId
  title: string
  blurb: string
  path: string
}[] = [
  { id: 'calm', title: 'Calm toolkit', blurb: 'Breathe, liquid, bubbles, sand', path: '/calm' },
  {
    id: 'checkin',
    title: 'AAC & check-in',
    blurb: 'Feelings, body signals, needs — speak it',
    path: '/check-in',
  },
  { id: 'feelings', title: 'Feelings', blurb: 'Quick emotion check-in', path: '/feelings' },
  { id: 'schedule', title: 'First / Then', blurb: 'Routine · timer · rewards', path: '/schedule' },
  { id: 'stories', title: 'What to expect', blurb: 'Picture social stories', path: '/stories' },
  { id: 'videos', title: 'Learning videos', blurb: 'Watch lessons · YouTube Kids', path: '/videos' },
  { id: 'talk', title: 'Talk board', blurb: 'Offline AAC by time of day', path: '/talk' },
  { id: 'friends', title: 'Social cues', blurb: 'Gentle practice scenes', path: '/friends' },
  { id: 'interest', title: 'Interest rewards', blurb: 'Unlock special-interest facts', path: '/interest' },
]

export function Home() {
  const navigate = useNavigate()
  const { settings, online, progress, updateSettings } = useApp()
  const [showMore, setShowMore] = useState(false)

  const enabled = MODULES.filter((m) => settings.enabledModules[m.id])
  const care = CARE.filter((m) => settings.enabledCareModules[m.id])

  const practice =
    enabled.find((m) => m.id === settings.home.todayPractice) ?? enabled[0] ?? null

  const pathSteps = useMemo(() => {
    const steps: { key: string; title: string; blurb: string; path: string; num: string }[] = []
    if (settings.enabledCareModules.schedule) {
      steps.push({
        key: 'schedule',
        title: 'First / Then',
        blurb: 'Start your routine',
        path: '/schedule',
        num: '1',
      })
    }
    if (practice) {
      steps.push({
        key: practice.id,
        title: practice.title,
        blurb: 'One gentle practice',
        path: practice.path,
        num: String(steps.length + 1),
      })
    }
    if (settings.enabledCareModules.calm) {
      steps.push({
        key: 'calm',
        title: 'Calm',
        blurb: 'Quiet tools when needed',
        path: '/calm',
        num: String(steps.length + 1),
      })
    }
    return steps
  }, [practice, settings.enabledCareModules.calm, settings.enabledCareModules.schedule])

  const favorites = useMemo(() => {
    const fav = new Set(settings.home.favorites)
    const careFav = care.filter((c) => fav.has(c.id))
    const modFav = enabled.filter((m) => fav.has(m.id))
    return { careFav, modFav }
  }, [care, enabled, settings.home.favorites])

  const toggleFavorite = (id: string) => {
    const set = new Set(settings.home.favorites)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    updateSettings({ home: { ...settings.home, favorites: [...set] } })
  }

  return (
    <div className="home home-simple">
      <header className="hero hero-compact">
        <div className="hero-copy">
          <p className="brand">Soft Steps</p>
          <span className="brand-ribbon" aria-hidden="true" />
          <h1>Today’s path</h1>
          <p className="hero-sub">
            Three calm steps. Ages {settings.ageBand}
            {online ? '' : ' · Offline ready'}.
          </p>
        </div>
      </header>

      <InstallPrompt />

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
          <h2>Start here</h2>
          <p>First / Then → practice → calm. One job at a time.</p>
        </div>
        {pathSteps.length ? (
          <ol className="today-path">
            {pathSteps.map((step) => (
              <li key={step.key}>
                <Link to={step.path} className="today-path-card">
                  <span className="today-path-num" aria-hidden="true">
                    {step.num}
                  </span>
                  <span>
                    <strong>{step.title}</strong>
                    <span className="today-path-blurb">{step.blurb}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="empty-note">Turn on care or practice tools in Grown-ups.</p>
        )}

        {enabled.length > 1 ? (
          <div className="today-practice-picker">
            <p className="fine-print">Practice on today’s path</p>
            <div className="toggle-row wrap">
              {enabled.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`chip ${practice?.id === m.id ? 'is-active' : ''}`}
                  onClick={() => updateSettings({ home: { ...settings.home, todayPractice: m.id } })}
                >
                  {m.title}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {(favorites.careFav.length > 0 || favorites.modFav.length > 0) && (
        <section className="section">
          <div className="section-head">
            <h2>Favorites</h2>
            <p>Quick opens you starred.</p>
          </div>
          <div className="module-grid care-grid">
            {favorites.careFav.map((mod) => (
              <Link key={mod.id} to={mod.path} className="module-card mod-care">
                <span className="module-title">{mod.title}</span>
                <span className="module-blurb">{mod.blurb}</span>
              </Link>
            ))}
            {favorites.modFav.map((mod) => {
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
          </div>
        </section>
      )}

      <section className="section">
        <button
          type="button"
          className="more-tools-toggle"
          aria-expanded={showMore}
          onClick={() => setShowMore((v) => !v)}
        >
          {showMore ? 'Hide more tools' : 'More tools'}
        </button>

        {showMore ? (
          <>
            <div className="section-head" style={{ marginTop: '1rem' }}>
              <h2>
                <span className="eyebrow offline-tag">Offline</span> Care & routines
              </h2>
            </div>
            <div className="module-grid care-grid">
              {care.map((mod) => (
                <div key={mod.id} className="module-card-wrap">
                  <Link to={mod.path} className="module-card mod-care">
                    <span className="module-title">{mod.title}</span>
                    <span className="module-blurb">{mod.blurb}</span>
                  </Link>
                  <button
                    type="button"
                    className={`fav-star ${settings.home.favorites.includes(mod.id) ? 'is-on' : ''}`}
                    aria-label={
                      settings.home.favorites.includes(mod.id)
                        ? `Remove ${mod.title} from favorites`
                        : `Favorite ${mod.title}`
                    }
                    onClick={() => toggleFavorite(mod.id)}
                  >
                    ★
                  </button>
                </div>
              ))}
            </div>

            <div className="section-head" style={{ marginTop: '1.25rem' }}>
              <h2>
                <span className="eyebrow offline-tag">Offline</span> Practice
              </h2>
            </div>
            <div className="module-grid">
              {enabled.map((mod) => {
                const p = progress[mod.id]
                return (
                  <div key={mod.id} className="module-card-wrap">
                    <Link to={mod.path} className={`module-card ${mod.accent}`}>
                      <span className="module-title">{mod.title}</span>
                      <span className="module-blurb">{mod.blurb}</span>
                      <span className="module-stat">
                        {p.correct} correct · best ★ {p.bestStreak}
                      </span>
                    </Link>
                    <button
                      type="button"
                      className={`fav-star ${settings.home.favorites.includes(mod.id) ? 'is-on' : ''}`}
                      aria-label={
                        settings.home.favorites.includes(mod.id)
                          ? `Remove ${mod.title} from favorites`
                          : `Favorite ${mod.title}`
                      }
                      onClick={() => toggleFavorite(mod.id)}
                    >
                      ★
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="section-head" style={{ marginTop: '1.25rem' }}>
              <h2>
                <span className="eyebrow online-tag">Online</span> Network
              </h2>
            </div>
            {settings.onlineExtrasEnabled ? (
              <Link to="/online" className={`online-card ${online ? '' : 'is-disabled'}`}>
                <div>
                  <strong>Open online hub</strong>
                  <p>
                    {online
                      ? 'Mix quiz · Gentle timer · Multi-step match'
                      : 'You’re offline — use Today’s path and Favorites above'}
                  </p>
                </div>
                <span className="chev">→</span>
              </Link>
            ) : (
              <p className="empty-note">Online extras are turned off in Grown-ups.</p>
            )}
          </>
        ) : null}
      </section>

      <footer className="home-footer home-footer-secure">
        <HappyFaceHold onUnlock={() => navigate('/parent')} />
      </footer>
    </div>
  )
}
