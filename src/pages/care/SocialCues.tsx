import { useState } from 'react'
import { Link } from 'react-router-dom'
import { playCorrect, playGentleNudge, playTap } from '../../audio/feedback'
import { useApp } from '../../store/AppContext'

type Scenario = {
  id: string
  prompt: string
  emoji: string
  choices: { id: string; label: string; gentle: boolean; feedback: string }[]
}

const SCENARIOS: Scenario[] = [
  {
    id: 'join',
    prompt: 'Friends are playing a game. What is a gentle way to join?',
    emoji: '🎲',
    choices: [
      {
        id: 'ask',
        label: 'Wait, then ask “Can I play?”',
        gentle: true,
        feedback: 'Nice — asking is clear and kind.',
      },
      {
        id: 'grab',
        label: 'Grab the pieces',
        gentle: false,
        feedback: 'That can feel surprising. Try asking first.',
      },
      {
        id: 'yell',
        label: 'Yell to start now',
        gentle: false,
        feedback: 'Loud starts can feel big. A calm ask helps.',
      },
    ],
  },
  {
    id: 'frustrated',
    prompt: 'A friend looks frustrated. What could you try?',
    emoji: '😔',
    choices: [
      {
        id: 'space',
        label: 'Give space and offer help',
        gentle: true,
        feedback: 'Thoughtful — space plus a soft offer.',
      },
      {
        id: 'tease',
        label: 'Tease them',
        gentle: false,
        feedback: 'Teasing can hurt when someone is upset.',
      },
      {
        id: 'ignore',
        label: 'Laugh loudly nearby',
        gentle: false,
        feedback: 'That might feel confusing. Soft help is better.',
      },
    ],
  },
  {
    id: 'turn',
    prompt: 'It is someone else’s turn. What helps?',
    emoji: '⏳',
    choices: [
      {
        id: 'wait',
        label: 'Wait and watch',
        gentle: true,
        feedback: 'Waiting is a strong social skill.',
      },
      {
        id: 'push',
        label: 'Push ahead',
        gentle: false,
        feedback: 'Pushing skips their turn. Waiting keeps it fair.',
      },
    ],
  },
]

export function SocialCues() {
  const { settings } = useApp()
  const [index, setIndex] = useState(0)
  const [message, setMessage] = useState('Choose a gentle option.')
  const [tone, setTone] = useState<'idle' | 'good' | 'try'>('idle')

  const scenario = SCENARIOS[index % SCENARIOS.length]

  return (
    <section className="care-page">
      <header className="activity-header">
        <Link to="/" className="back-link">
          ← Talk
        </Link>
        <div className="activity-meta">
          <p className="eyebrow offline-tag">Offline</p>
          <h1>Social cues</h1>
        </div>
        <span className="age-badge">
          {index + 1}/{SCENARIOS.length}
        </span>
      </header>

      <div className="story-card">
        <div className="story-emoji">{scenario.emoji}</div>
        <p className="prompt" style={{ margin: 0 }}>
          {scenario.prompt}
        </p>
      </div>

      <div className="choice-stack">
        {scenario.choices.map((c) => (
          <button
            key={c.id}
            type="button"
            className="choice-btn social-choice"
            onClick={() => {
              playTap(settings.sensory.soundOn)
              if (c.gentle) {
                setTone('good')
                setMessage(c.feedback)
                playCorrect(settings.sensory.soundOn)
                window.setTimeout(() => {
                  setIndex((i) => i + 1)
                  setTone('idle')
                  setMessage('Choose a gentle option.')
                }, settings.sensory.reducedMotion ? 500 : 1000)
              } else {
                setTone('try')
                setMessage(c.feedback)
                playGentleNudge(settings.sensory.soundOn)
              }
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className={`feedback feedback-${tone}`}>{message}</div>
    </section>
  )
}
