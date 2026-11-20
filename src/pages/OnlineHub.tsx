import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { playCorrect, playGentleNudge, playTap } from '../audio/feedback'
import { shuffle } from '../utils/quiz'

type WordRound = { prompt: string; answer: string; choices: string[] }

const WORD_BANK: WordRound[] = [
  { prompt: 'Which word starts with S?', answer: 'Sun', choices: ['Sun', 'Moon', 'Tree', 'Ball'] },
  { prompt: 'Which word rhymes with cat?', answer: 'Hat', choices: ['Hat', 'Dog', 'Cup', 'Leaf'] },
  { prompt: 'Which is a color?', answer: 'Green', choices: ['Green', 'Chair', 'Shoe', 'Door'] },
  { prompt: 'Which is a shape?', answer: 'Circle', choices: ['Circle', 'Water', 'Music', 'Happy'] },
  { prompt: 'Count: 2 + 2 =', answer: '4', choices: ['4', '3', '5', '6'] },
  { prompt: 'Which comes after 7?', answer: '8', choices: ['8', '6', '9', '5'] },
]

export function OnlineHub() {
  const { online, settings, recordAnswer } = useApp()
  const [synced, setSynced] = useState(false)
  const [syncNote, setSyncNote] = useState('Progress stays on this device. Online sync is a gentle demo.')
  const [round, setRound] = useState(() => {
    const base = shuffle(WORD_BANK)[0]
    return { ...base, choices: shuffle(base.choices) }
  })
  const [message, setMessage] = useState('Pick the best answer.')
  const [tone, setTone] = useState<'idle' | 'good' | 'try'>('idle')
  const [streak, setStreak] = useState(0)

  const canPlay = online && settings.onlineExtrasEnabled

  useEffect(() => {
    if (!online) {
      setSynced(false)
      setSyncNote('You are offline. Bonus games need a connection.')
    }
  }, [online])

  const next = () => {
    const base = shuffle(WORD_BANK)[0]
    setRound({ ...base, choices: shuffle(base.choices) })
    setTone('idle')
    setMessage('Pick the best answer.')
  }

  const demoSync = async () => {
    if (!online) return
    setSyncNote('Syncing sample progress…')
    await new Promise((r) => setTimeout(r, 700))
    setSynced(true)
    setSyncNote('Demo sync complete. Local progress is still the source of truth.')
  }

  const narrationHint = useMemo(
    () =>
      online
        ? 'Optional narration would load from a CDN when enabled. Soft Steps uses gentle device tones offline.'
        : 'Connect online to unlock CDN narration demos.',
    [online],
  )

  if (!settings.onlineExtrasEnabled) {
    return (
      <section className="online-hub">
        <Link to="/" className="back-link">
          ← Home
        </Link>
        <h1>Online extras off</h1>
        <p>A grown-up can turn these on in Parent tools.</p>
      </section>
    )
  }

  if (!canPlay) {
    return (
      <section className="online-hub">
        <Link to="/" className="back-link">
          ← Home
        </Link>
        <p className="eyebrow online-tag">Online</p>
        <h1>Needs a connection</h1>
        <p>Bonus games and sync tips work when you are online. Offline practice is still ready on Home.</p>
        <Link className="btn btn-primary" to="/">
          Back to offline practice
        </Link>
      </section>
    )
  }

  return (
    <section className="online-hub">
      <header className="activity-header">
        <Link to="/" className="back-link">
          ← Home
        </Link>
        <div className="activity-meta">
          <p className="eyebrow online-tag">Online</p>
          <h1>Bonus practice</h1>
        </div>
        <div className="streak-pill">★ {streak}</div>
      </header>

      <div className="online-panel">
        <h2>Word & number challenge</h2>
        <p className="prompt">{round.prompt}</p>
        <div className="choice-grid cols-2">
          {round.choices.map((choice) => (
            <button
              key={choice}
              type="button"
              className="choice-btn"
              onClick={() => {
                playTap(settings.sensory.soundOn)
                if (choice === round.answer) {
                  const s = streak + 1
                  setStreak(s)
                  setTone('good')
                  setMessage('Wonderful!')
                  playCorrect(settings.sensory.soundOn)
                  recordAnswer('abc', true, s)
                  window.setTimeout(next, settings.sensory.reducedMotion ? 500 : 900)
                } else {
                  setStreak(0)
                  setTone('try')
                  setMessage('Keep going — another try.')
                  playGentleNudge(settings.sensory.soundOn)
                }
              }}
            >
              {choice}
            </button>
          ))}
        </div>
        <div className={`feedback feedback-${tone}`}>{message}</div>
      </div>

      <div className="online-panel">
        <h2>Progress sync (demo)</h2>
        <p>{syncNote}</p>
        <button type="button" className="btn btn-secondary" onClick={demoSync}>
          {synced ? 'Synced' : 'Try demo sync'}
        </button>
        <p className="fine-print">{narrationHint}</p>
      </div>
    </section>
  )
}
