import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { InstallPrompt } from '../components/InstallPrompt'
import { ParentalGateModal } from '../components/ParentalGateModal'
import { themeForDate } from '../data/themes'
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
    blurb: 'Foods, animals, body & objects',
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
  {
    id: 'talk',
    title: 'Talk (AAC)',
    blurb: 'Full communication board — words, photos, signs',
    path: '/talk',
  },
  { id: 'friends', title: 'Social cues', blurb: 'Gentle practice scenes', path: '/friends' },
  { id: 'interest', title: 'Interest rewards', blurb: 'Unlock special-interest facts', path: '/interest' },
]

export function Home() {
  const navigate = useNavigate()
  const {
    settings,
    online,
    progress,
    updateSettings,
    activeProfile,
    switchProfile,
  } = useApp()
  const [showMore, setShowMore] = useState(false)
  const [showParentGate, setShowParentGate] = useState(false)
  const [privacyPending, setPrivacyPending] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return localStorage.getItem('soft-steps-onboard-v1') !== '1'
    } catch {
      return true
    }
  })
  const weekTheme = useMemo(() => themeForDate(), [])

  const dismissOnboarding = () => {
    try {
      localStorage.setItem('soft-steps-onboard-v1', '1')
    } catch {
      /* ignore */
    }
    setShowOnboarding(false)
  }

  const enabled = MODULES.filter((m) => settings.enabledModules[m.id])
  const care = CARE.filter((m) => settings.enabledCareModules[m.id])

  // Align today’s practice with the weekly theme when that module is on
  useEffect(() => {
    if (!settings.enabledModules[weekTheme.practice]) return
    if (settings.home.todayPractice === weekTheme.practice) return
    updateSettings({ home: { ...settings.home, todayPractice: weekTheme.practice } })
    // Only on mount / theme id change
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-shot theme nudge
  }, [weekTheme.id])

  const practice =
    enabled.find((m) => m.id === settings.home.todayPractice) ?? enabled[0] ?? null

  const themePracticePath =
    weekTheme.practice === 'foods' && weekTheme.foodKind
      ? `/foods?kind=${weekTheme.foodKind}`
      : MODULES.find((m) => m.id === weekTheme.practice)?.path ?? '/foods'

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
      const themed =
        practice.id === weekTheme.practice
          ? {
              title: `${weekTheme.emoji} ${practice.title}`,
              blurb: weekTheme.title,
              path: themePracticePath,
            }
          : {
              title: practice.title,
              blurb: 'One gentle practice',
              path: practice.path,
            }
      steps.push({
        key: practice.id,
        title: themed.title,
        blurb: themed.blurb,
        path: themed.path,
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
  }, [
    practice,
    settings.enabledCareModules.calm,
    settings.enabledCareModules.schedule,
    themePracticePath,
    weekTheme.emoji,
    weekTheme.practice,
    weekTheme.title,
  ])

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

  const activeRoutine =
    settings.routines.find((r) => r.id === settings.activeRoutineId) ?? settings.routines[0]

  return (
    <div className="home home-simple">
      <header className="hero hero-compact">
        <div className="hero-copy">
          <p className="brand">Soft Steps</p>
          <span className="brand-ribbon" aria-hidden="true" />
          <h1>Today’s path</h1>
          <p className="hero-sub">
            {activeProfile ? (
              <>
                {activeProfile.emoji} {activeProfile.name} · Ages {settings.ageBand}
              </>
            ) : (
              <>Ages {settings.ageBand}</>
            )}
            {online ? '' : ' · Offline ready'}
            {activeRoutine ? ` · ${activeRoutine.title}` : ''}
          </p>
        </div>
      </header>

      {settings.profiles.length > 1 ? (
        <section className="section profile-switcher" aria-label="Kid profiles">
          <div className="toggle-row wrap">
            {settings.profiles.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`chip profile-chip ${p.id === settings.activeProfileId ? 'is-active' : ''}`}
                onClick={() => switchProfile(p.id)}
              >
                <span aria-hidden="true">{p.emoji}</span> {p.name}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <aside className="week-theme-banner" aria-label="This week’s theme">
        <span className="week-theme-emoji" aria-hidden="true">
          {weekTheme.emoji}
        </span>
        <div>
          <strong>{weekTheme.title}</strong>
          <p>{weekTheme.blurb}</p>
          <div className="week-theme-links">
            {settings.enabledModules[weekTheme.practice] ? (
              <Link to={themePracticePath} className="chip is-active">
                Play theme games
              </Link>
            ) : null}
            {weekTheme.storyId && settings.enabledCareModules.stories ? (
              <Link to={`/stories?story=${weekTheme.storyId}`} className="chip">
                Story
              </Link>
            ) : null}
            {weekTheme.videoCategory && settings.enabledCareModules.videos ? (
              <Link to={`/videos?cat=${weekTheme.videoCategory}`} className="chip">
                Videos
              </Link>
            ) : null}
          </div>
        </div>
      </aside>

      <InstallPrompt />

      {showOnboarding ? (
        <aside className="onboard-banner" role="region" aria-label="Quick start for grown-ups">
          <div>
            <strong>Quick start</strong>
            <ol className="onboard-steps">
              <li>Follow Today’s path: First / Then → practice → Calm.</li>
              <li>Add photos in stories or Talk board when you’re ready.</li>
              <li>
                Grown-ups: open Grown-ups → PIN (change starter <code>1234</code>).
              </li>
            </ol>
          </div>
          <button type="button" className="btn btn-primary" onClick={dismissOnboarding}>
            Got it
          </button>
        </aside>
      ) : null}

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
        <button
          type="button"
          className="grownups-link"
          onClick={() => {
            setPrivacyPending(false)
            setShowParentGate(true)
          }}
        >
          Grown-ups
        </button>
        <button
          type="button"
          className="btn btn-ghost home-privacy-link"
          onClick={() => {
            setPrivacyPending(true)
            setShowParentGate(true)
          }}
        >
          Privacy
        </button>
      </footer>

      {showParentGate ? (
        <ParentalGateModal
          title={privacyPending ? 'Privacy' : 'Parent Controls'}
          blurb={
            privacyPending
              ? 'Grown-ups confirm before opening the privacy policy.'
              : 'Grown-ups confirm before opening Parent Controls.'
          }
          onCancel={() => {
            setShowParentGate(false)
            setPrivacyPending(false)
          }}
          onVerified={() => {
            const goPrivacy = privacyPending
            setShowParentGate(false)
            setPrivacyPending(false)
            navigate(goPrivacy ? '/privacy' : '/parent')
          }}
        />
      ) : null}
    </div>
  )
}
