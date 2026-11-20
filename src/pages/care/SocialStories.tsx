import { useState } from 'react'
import { Link } from 'react-router-dom'
import { speakText } from '../../audio/calmAudio'
import { useApp } from '../../store/AppContext'

export function SocialStories() {
  const { settings, updateSettings } = useApp()
  const [storyId, setStoryId] = useState(settings.stories[0]?.id ?? '')
  const [pageIndex, setPageIndex] = useState(0)

  const story = settings.stories.find((s) => s.id === storyId) ?? settings.stories[0]
  const page = story?.pages[pageIndex]

  if (!story || !page) {
    return (
      <section className="care-page">
        <Link to="/" className="back-link">
          ← Home
        </Link>
        <h1>Social stories</h1>
        <p>No stories yet. Grown-ups can reset samples in Parent tools.</p>
      </section>
    )
  }

  const onPagePhoto = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const stories = settings.stories.map((s) => {
        if (s.id !== story.id) return s
        return {
          ...s,
          pages: s.pages.map((p, i) =>
            i === pageIndex ? { ...p, photoDataUrl: String(reader.result) } : p,
          ),
        }
      })
      updateSettings({ stories })
    }
    reader.readAsDataURL(file)
  }

  return (
    <section className="care-page">
      <header className="activity-header">
        <Link to="/" className="back-link">
          ← Home
        </Link>
        <div className="activity-meta">
          <p className="eyebrow offline-tag">Offline</p>
          <h1>What to expect</h1>
        </div>
        <span className="age-badge">
          {pageIndex + 1}/{story.pages.length}
        </span>
      </header>

      <div className="tool-picker wrap">
        {settings.stories.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`chip ${story.id === s.id ? 'is-active' : ''}`}
            onClick={() => {
              setStoryId(s.id)
              setPageIndex(0)
            }}
          >
            {s.title}
          </button>
        ))}
      </div>

      <article className="story-card">
        {page.photoDataUrl ? (
          <img src={page.photoDataUrl} alt="" className="story-photo" />
        ) : (
          <div className="story-emoji" aria-hidden="true">
            {page.emoji}
          </div>
        )}
        <h2>{page.title}</h2>
        <p>{page.body}</p>
        <div className="confirm-row">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => speakText(page.voiceText || page.body, settings.sensory.soundOn)}
          >
            Listen
          </button>
          <label className="btn btn-ghost upload-btn">
            Add photo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onPagePhoto(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      </article>

      <div className="confirm-row">
        <button
          type="button"
          className="btn btn-ghost"
          disabled={pageIndex === 0}
          onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
        >
          ← Back
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={pageIndex >= story.pages.length - 1}
          onClick={() => setPageIndex((i) => Math.min(story.pages.length - 1, i + 1))}
        >
          Next →
        </button>
      </div>
    </section>
  )
}
