import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../store/AppContext'
import type { InterestTheme } from '../../types'

const THEME_FACTS: Record<InterestTheme, { title: string; facts: string[]; emoji: string }> = {
  trains: {
    title: 'Trains',
    emoji: '🚂',
    facts: [
      'Some trains have many cars linked together.',
      'Tracks help trains stay on a clear path.',
      'A whistle can mean “ready” or “hello.”',
    ],
  },
  dinosaurs: {
    title: 'Dinosaurs',
    emoji: '🦕',
    facts: [
      'Some dinosaurs walked on two feet.',
      'Fossils are clues from long ago.',
      'Plant-eaters and meat-eaters lived in different ways.',
    ],
  },
  space: {
    title: 'Space',
    emoji: '🚀',
    facts: [
      'The Moon lights up from the Sun.',
      'Stars look tiny because they are far away.',
      'Astronauts float when gravity feels soft.',
    ],
  },
  patterns: {
    title: 'Patterns',
    emoji: '🔢',
    facts: [
      'AAB AAB is a repeating pattern.',
      'Even numbers can pair up.',
      'Shapes can tessellate like tiles.',
    ],
  },
}

export function InterestRewards() {
  const { settings, updateSettings } = useApp()
  const theme = THEME_FACTS[settings.interestTheme]
  const doneCount = settings.interestChecklist.filter((c) => c.done).length
  const unlocked = Math.min(theme.facts.length, doneCount)
  const allDone = doneCount >= settings.interestChecklist.length

  const progressPct = useMemo(() => {
    const total = settings.interestChecklist.length || 1
    return Math.round((doneCount / total) * 100)
  }, [doneCount, settings.interestChecklist.length])

  return (
    <section className="care-page">
      <header className="activity-header">
        <Link to="/" className="back-link">
          ← Home
        </Link>
        <div className="activity-meta">
          <p className="eyebrow offline-tag">Offline</p>
          <h1>Interest rewards</h1>
        </div>
        <span className="age-badge">
          {theme.emoji} {theme.title}
        </span>
      </header>

      <p className="prompt">
        Finish life-skill / learning checkboxes to unlock {theme.title.toLowerCase()} facts.
      </p>

      <div className="gentle-timer-track" aria-hidden="true">
        <div className="gentle-timer-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <ul className="interest-list">
        {settings.interestChecklist.map((item) => (
          <li key={item.id}>
            <label className="check-line">
              <input
                type="checkbox"
                checked={item.done}
                onChange={(e) => {
                  updateSettings({
                    interestChecklist: settings.interestChecklist.map((c) =>
                      c.id === item.id ? { ...c, done: e.target.checked } : c,
                    ),
                  })
                }}
              />
              {item.label}
            </label>
          </li>
        ))}
      </ul>

      <div className="online-panel">
        <h2>
          Unlocked {theme.emoji} facts ({unlocked}/{theme.facts.length})
        </h2>
        {theme.facts.slice(0, Math.max(1, unlocked)).map((fact, i) => (
          <p key={fact} className={i < unlocked ? '' : 'is-locked'}>
            {i < unlocked ? fact : 'Keep going to unlock…'}
          </p>
        ))}
        {allDone ? (
          <p className="feedback feedback-good">All tasks done — enjoy your special interest!</p>
        ) : null}
      </div>

      <p className="fine-print">Grown-ups can change the interest theme in Parent tools.</p>
    </section>
  )
}
