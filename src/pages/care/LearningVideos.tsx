import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { speakText } from '../../audio/calmAudio'
import {
  VIDEO_CATEGORIES,
  parseYoutubeId,
  videosForAge,
  type BuiltInVideo,
  type VideoCategory,
} from '../../data/videos'
import { useApp } from '../../store/AppContext'
import { GameCelebration } from '../../components/GameCelebration'

type View =
  | { kind: 'hub' }
  | { kind: 'list'; category: VideoCategory | 'family' }
  | { kind: 'play-offline'; video: BuiltInVideo }
  | { kind: 'play-youtube'; id: string; title: string; emoji: string }
  | { kind: 'done'; title: string }

const FRAME_MS = 2200

export function LearningVideos() {
  const { settings, online, updateSettings } = useApp()
  const [view, setView] = useState<View>({ kind: 'hub' })
  const [frame, setFrame] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [emoji, setEmoji] = useState('📺')
  const [error, setError] = useState('')

  const family = settings.customVideos
  const reduced =
    settings.sensory.reducedMotion || settings.sensory.disableSuddenAnimations

  const list = useMemo(() => {
    if (view.kind !== 'list' || view.category === 'family') return []
    return videosForAge(settings.ageBand, view.category)
  }, [view, settings.ageBand])

  // Offline lesson autoplay
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

  const addFamilyVideo = (e: FormEvent) => {
    e.preventDefault()
    const yt = parseYoutubeId(url)
    if (!yt) {
      setError('Paste a YouTube Kids link (or YouTube link/id that works in Kids).')
      return
    }
    const trimmed = title.trim() || 'Family video'
    updateSettings({
      customVideos: [
        { id: `vid-${Date.now()}`, title: trimmed, emoji: emoji.trim() || '📺', youtubeId: yt },
        ...family,
      ].slice(0, 20),
    })
    setTitle('')
    setUrl('')
    setEmoji('📺')
    setError('')
    setAdding(false)
  }

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

  if (view.kind === 'play-youtube') {
    return (
      <section className="care-page video-page">
        <header className="activity-header">
          <button type="button" className="back-link" onClick={() => setView({ kind: 'list', category: 'family' })}>
            ← Family
          </button>
          <div className="activity-meta">
            <p className="eyebrow online-tag">YouTube Kids</p>
            <h1>
              {view.emoji} {view.title}
            </h1>
          </div>
        </header>
        <aside className={`video-wifi-banner ${online ? 'is-online' : 'is-offline'}`} role="status">
          {online
            ? 'Wi‑Fi connected — YouTube Kids can play.'
            : 'Wi‑Fi required — connect to watch YouTube Kids videos.'}
        </aside>
        {!online ? (
          <p className="empty-note">
            You’re offline. Topic lessons (Letters, Numbers, and more) still work without Wi‑Fi from the
            Videos home.
          </p>
        ) : (
          <>
            <div className="video-embed-wrap">
              <iframe
                title={view.title}
                src={`https://www.youtubekids.com/embed/${view.id}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <a
              className="btn btn-secondary"
              href={`https://www.youtubekids.com/watch?v=${view.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in YouTube Kids
            </a>
          </>
        )}
        <p className="fine-print">
          YouTube Kids needs a Wi‑Fi (or data) connection. Soft Steps does not host the file.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setView({ kind: 'done', title: view.title })}
        >
          I’m done watching
        </button>
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
    const isFamily = view.category === 'family'
    return (
      <section className="care-page video-page">
        <header className="activity-header">
          <button type="button" className="back-link" onClick={() => setView({ kind: 'hub' })}>
            ← Videos
          </button>
          <div className="activity-meta">
            <p className="eyebrow offline-tag">Learning videos</p>
            <h1>{isFamily ? 'Family videos' : catMeta?.title}</h1>
          </div>
          <span className="age-badge">Ages {settings.ageBand}</span>
        </header>

        {isFamily ? (
          <>
            <aside className={`video-wifi-banner ${online ? 'is-online' : 'is-offline'}`} role="status">
              {online
                ? 'Wi‑Fi connected — tap a video to watch on YouTube Kids.'
                : 'Wi‑Fi required for YouTube Kids. You can still add videos; play them when connected.'}
            </aside>
            <p className="prompt">Grown-up YouTube Kids picks. These need Wi‑Fi to play.</p>
            <div className="video-card-grid">
              {family.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={`video-pick-card ${online ? '' : 'is-wifi-locked'}`}
                  disabled={!online}
                  onClick={() => {
                    if (!online) return
                    setView({ kind: 'play-youtube', id: v.youtubeId, title: v.title, emoji: v.emoji })
                  }}
                >
                  <span className="sign-mode-emoji" aria-hidden="true">
                    {v.emoji}
                  </span>
                  <strong>{v.title}</strong>
                  <span className="fine-print">{online ? 'YouTube Kids' : 'Needs Wi‑Fi'}</span>
                </button>
              ))}
            </div>
            {family.length === 0 ? <p className="empty-note">No family videos yet.</p> : null}

            {!adding ? (
              <button type="button" className="btn btn-secondary" onClick={() => setAdding(true)}>
                Add YouTube Kids video
              </button>
            ) : (
              <form className="aac-add-form" onSubmit={addFamilyVideo}>
                <label>
                  Title
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={48} />
                </label>
                <label>
                  Emoji
                  <input type="text" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={8} />
                </label>
                <label>
                  YouTube Kids link or video id
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtubekids.com/watch?v=… or video id"
                    required
                  />
                </label>
                {error ? <p className="form-error">{error}</p> : null}
                <div className="confirm-row">
                  <button type="submit" className="btn btn-primary">
                    Save video
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setAdding(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {family.length > 0 ? (
              <ul className="module-toggles" style={{ marginTop: '1rem' }}>
                {family.map((v) => (
                  <li key={`rm-${v.id}`}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() =>
                        updateSettings({ customVideos: family.filter((x) => x.id !== v.id) })
                      }
                    >
                      Remove {v.title}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : (
          <>
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
          </>
        )}
      </section>
    )
  }

  // hub
  return (
    <section className="care-page video-page">
      <header className="activity-header">
        <Link to="/" className="back-link">
          ← Home
        </Link>
        <div className="activity-meta">
          <p className="eyebrow offline-tag">Watch & learn</p>
          <h1>Learning videos</h1>
        </div>
        <span className={`net-badge ${online ? 'is-online' : 'is-offline'}`}>
          {online ? 'Online' : 'Offline'}
        </span>
      </header>
      <aside className={`video-wifi-banner ${online ? 'is-online' : 'is-offline'}`} role="status">
        {online
          ? 'Online: topic lessons work anytime · YouTube Kids ready.'
          : 'Offline: topic lessons work now · YouTube Kids needs Wi‑Fi.'}
      </aside>
      <p className="prompt">
        Topic lessons work without Wi‑Fi. Family YouTube Kids videos require a Wi‑Fi connection.
      </p>
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
        <button
          type="button"
          className={`sign-mode-card ${online ? '' : 'is-wifi-needed'}`}
          onClick={() => setView({ kind: 'list', category: 'family' })}
        >
          <span className="sign-mode-emoji" aria-hidden="true">
            📺
          </span>
          <strong>Family videos</strong>
          <span>{online ? 'YouTube Kids · Wi‑Fi on' : 'Requires Wi‑Fi to play'}</span>
        </button>
      </div>
    </section>
  )
}
