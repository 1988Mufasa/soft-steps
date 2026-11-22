import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { speakText } from '../../audio/calmAudio'
import {
  VIDEO_CATEGORIES,
  videosForAge,
  type BuiltInVideo,
  type VideoCategory,
} from '../../data/videos'
import { useApp } from '../../store/AppContext'
import { GameCelebration } from '../../components/GameCelebration'

type View =
  | { kind: 'hub' }
  | { kind: 'list'; category: VideoCategory }
  | { kind: 'play-offline'; video: BuiltInVideo }
  | { kind: 'done'; title: string }

const FRAME_MS = 2200
const CAT_IDS = new Set(VIDEO_CATEGORIES.map((c) => c.id))

/** Offline watch lessons only — no YouTube Kids / external video embeds. */
export function LearningVideos() {
  const { settings } = useApp()
  const [params] = useSearchParams()
  const [view, setView] = useState<View>(() => {
    const cat = params.get('cat')
    if (cat && CAT_IDS.has(cat as VideoCategory)) {
      return { kind: 'list', category: cat as VideoCategory }
    }
    return { kind: 'hub' }
  })

  useEffect(() => {
    const cat = params.get('cat')
    if (cat && CAT_IDS.has(cat as VideoCategory)) {
      setView({ kind: 'list', category: cat as VideoCategory })
    }
  }, [params])

  const [frame, setFrame] = useState(0)
  const [playing, setPlaying] = useState(true)

  const reduced =
    settings.sensory.reducedMotion || settings.sensory.disableSuddenAnimations

  const list = useMemo(() => {
    if (view.kind !== 'list') return []
    return videosForAge(settings.ageBand, view.category)
  }, [view, settings.ageBand])

  useEffect(() => {
    if (view.kind !== 'play-offline' || !playing || reduced) return
    const frames = view.video.frames
    const current = frames[frame]
    if (current) speakText(current.speak, settings.sensory.soundOn)
    if (frame >= frames.length - 1) {
      const t = window.setTimeout(() => setView({ kind: 'done', title: view.video.title }), FRAME_MS)
      return () => window.clearTimeout(t)
    }
    const t = window.setTimeout(() => setFrame((f) => f + 1), FRAME_MS)
    return () => window.clearTimeout(t)
  }, [view, frame, playing, reduced, settings.sensory.soundOn])

  const playingVideoId = view.kind === 'play-offline' ? view.video.id : ''
  useEffect(() => {
    if (!playingVideoId) return
    setFrame(0)
    setPlaying(true)
  }, [playingVideoId])

  if (view.kind === 'done') {
    return (
      <section className="care-page video-page">
        <header className="activity-header">
          <button type="button" className="back-link" onClick={() => setView({ kind: 'hub' })}>
            ← Videos
          </button>
          <div className="activity-meta">
            <p className="eyebrow offline-tag">Finished</p>
            <h1>{view.title}</h1>
          </div>
        </header>
        <GameCelebration subtitle="Nice watching.">
          <button type="button" className="btn btn-primary" onClick={() => setView({ kind: 'hub' })}>
            More videos
          </button>
          <Link to="/" className="btn btn-secondary">
            Home
          </Link>
        </GameCelebration>
      </section>
    )
  }

  if (view.kind === 'play-offline') {
    const frames = view.video.frames
    const current = frames[frame] ?? frames[0]
    const progress = ((frame + 1) / frames.length) * 100
    return (
      <section className="care-page video-page">
        <header className="activity-header">
          <button
            type="button"
            className="back-link"
            onClick={() => setView({ kind: 'list', category: view.video.category })}
          >
            ← Back
          </button>
          <div className="activity-meta">
            <p className="eyebrow offline-tag">Watch lesson</p>
            <h1>{view.video.title}</h1>
          </div>
          <span className="age-badge">
            {frame + 1}/{frames.length}
          </span>
        </header>

        <div className="video-lesson-stage">
          <span className="video-lesson-emoji" aria-hidden="true">
            {current.emoji}
          </span>
          <p className="video-lesson-caption">{current.caption}</p>
          <div className="video-lesson-progress" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="confirm-row">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setPlaying((p) => !p)}
            aria-pressed={playing}
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => speakText(current.speak, settings.sensory.soundOn)}
          >
            Hear it
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              if (frame >= frames.length - 1) {
                setView({ kind: 'done', title: view.video.title })
              } else {
                setFrame((f) => f + 1)
              }
            }}
          >
            Next
          </button>
        </div>
      </section>
    )
  }

  if (view.kind === 'list') {
    const catMeta = VIDEO_CATEGORIES.find((c) => c.id === view.category)
    return (
      <section className="care-page video-page">
        <header className="activity-header">
          <button type="button" className="back-link" onClick={() => setView({ kind: 'hub' })}>
            ← Videos
          </button>
          <div className="activity-meta">
            <p className="eyebrow offline-tag">Learning videos</p>
            <h1>{catMeta?.title}</h1>
          </div>
          <span className="age-badge">Ages {settings.ageBand}</span>
        </header>

        <aside className="video-wifi-banner is-online" role="status">
          No Wi‑Fi needed — these watch lessons work offline.
        </aside>
        <p className="prompt">Short offline watch lessons — tap to play.</p>
        <div className="video-card-grid">
          {list.map((v) => (
            <button
              key={v.id}
              type="button"
              className="video-pick-card"
              onClick={() => setView({ kind: 'play-offline', video: v })}
            >
              <span className="sign-mode-emoji" aria-hidden="true">
                {v.emoji}
              </span>
              <strong>{v.title}</strong>
              <span>{v.blurb}</span>
            </button>
          ))}
        </div>
        {list.length === 0 ? <p className="empty-note">No lessons in this age band yet.</p> : null}
      </section>
    )
  }

  return (
    <section className="care-page video-page">
      <header className="activity-header">
        <Link to="/" className="back-link">
          ← Talk
        </Link>
        <div className="activity-meta">
          <p className="eyebrow offline-tag">Watch & learn</p>
          <h1>Learning videos</h1>
        </div>
      </header>
      <aside className="video-wifi-banner is-online" role="status">
        All topic lessons work offline — Soft Steps does not use YouTube Kids.
      </aside>
      <p className="prompt">Pick a topic for a short offline watch lesson.</p>
      <div className="sign-mode-grid">
        {VIDEO_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className="sign-mode-card"
            onClick={() => setView({ kind: 'list', category: c.id })}
          >
            <span className="sign-mode-emoji" aria-hidden="true">
              {c.emoji}
            </span>
            <strong>{c.title}</strong>
            <span>Works offline</span>
          </button>
        ))}
      </div>
    </section>
  )
}
