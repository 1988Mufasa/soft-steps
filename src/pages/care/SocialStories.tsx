import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { speakText } from '../../audio/calmAudio'
import { useApp } from '../../store/AppContext'
import type { Story, StoryPage } from '../../types'

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

type DraftPage = { title: string; body: string; emoji: string; photoDataUrl?: string }

const EMPTY_PAGE: DraftPage = { title: '', body: '', emoji: '📖' }

export function SocialStories() {
  const { settings, updateSettings } = useApp()
  const [params] = useSearchParams()
  const [storyId, setStoryId] = useState(settings.stories[0]?.id ?? '')
  const [pageIndex, setPageIndex] = useState(0)
  const [building, setBuilding] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftPages, setDraftPages] = useState<DraftPage[]>([{ ...EMPTY_PAGE }])
  const [buildMsg, setBuildMsg] = useState('')

  useEffect(() => {
    const q = params.get('story')
    if (q && settings.stories.some((s) => s.id === q)) {
      setStoryId(q)
      setPageIndex(0)
    }
  }, [params, settings.stories])

  const story = settings.stories.find((s) => s.id === storyId) ?? settings.stories[0]
  const page = story?.pages[pageIndex]

  const onPagePhoto = (file: File | null) => {
    if (!file || !story) return
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

  const onDraftPhoto = (index: number, file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setDraftPages((pages) =>
        pages.map((p, i) => (i === index ? { ...p, photoDataUrl: String(reader.result) } : p)),
      )
    }
    reader.readAsDataURL(file)
  }

  const saveNewStory = () => {
    const title = draftTitle.trim() || 'My story'
    const pages: StoryPage[] = draftPages
      .filter((p) => p.title.trim() || p.body.trim())
      .map((p, i) => ({
        id: newId(`p${i}`),
        title: p.title.trim() || `Page ${i + 1}`,
        body: p.body.trim() || p.title.trim() || '…',
        emoji: p.emoji.trim() || '📖',
        photoDataUrl: p.photoDataUrl,
        voiceText: p.body.trim() || p.title.trim(),
      }))
    if (pages.length === 0) {
      setBuildMsg('Add at least one page with a title or sentence.')
      return
    }
    const next: Story = { id: newId('story'), title, pages }
    updateSettings({ stories: [...settings.stories, next] })
    setStoryId(next.id)
    setPageIndex(0)
    setBuilding(false)
    setDraftTitle('')
    setDraftPages([{ ...EMPTY_PAGE }])
    setBuildMsg('Story saved on this device.')
  }

  if (building) {
    return (
      <section className="care-page">
        <header className="activity-header">
          <button type="button" className="back-link" onClick={() => setBuilding(false)}>
            ← Cancel
          </button>
          <div className="activity-meta">
            <p className="eyebrow offline-tag">Offline</p>
            <h1>New social story</h1>
          </div>
        </header>

        <label className="field-label">
          Story title
          <input
            className="text-input"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="e.g. Going to the park"
          />
        </label>

        {draftPages.map((p, i) => (
          <article key={i} className="story-builder-page">
            <h3>Page {i + 1}</h3>
            {p.photoDataUrl ? (
              <img src={p.photoDataUrl} alt="" className="story-photo" />
            ) : (
              <div className="story-emoji" aria-hidden="true">
                {p.emoji || '📖'}
              </div>
            )}
            <label className="field-label">
              Emoji
              <input
                className="text-input"
                value={p.emoji}
                onChange={(e) =>
                  setDraftPages((pages) =>
                    pages.map((x, j) => (j === i ? { ...x, emoji: e.target.value } : x)),
                  )
                }
                maxLength={4}
              />
            </label>
            <label className="field-label">
              Page title
              <input
                className="text-input"
                value={p.title}
                onChange={(e) =>
                  setDraftPages((pages) =>
                    pages.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
                  )
                }
                placeholder="Short title"
              />
            </label>
            <label className="field-label">
              Sentence
              <textarea
                className="text-input"
                rows={2}
                value={p.body}
                onChange={(e) =>
                  setDraftPages((pages) =>
                    pages.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)),
                  )
                }
                placeholder="What happens on this page"
              />
            </label>
            <label className="btn btn-ghost upload-btn">
              Add photo
              <input
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={(e) => onDraftPhoto(i, e.target.files?.[0] ?? null)}
              />
            </label>
            {draftPages.length > 1 ? (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setDraftPages((pages) => pages.filter((_, j) => j !== i))}
              >
                Remove page
              </button>
            ) : null}
          </article>
        ))}

        <div className="confirm-row">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setDraftPages((pages) => [...pages, { ...EMPTY_PAGE }])}
          >
            + Add page
          </button>
          <button type="button" className="btn btn-primary" onClick={saveNewStory}>
            Save story
          </button>
        </div>
        {buildMsg ? (
          <p className="fine-print" role="status">
            {buildMsg}
          </p>
        ) : null}
      </section>
    )
  }

  if (!story || !page) {
    return (
      <section className="care-page">
        <Link to="/" className="back-link">
          ← Home
        </Link>
        <h1>Social stories</h1>
        <p>No stories yet.</p>
        <button type="button" className="btn btn-primary" onClick={() => setBuilding(true)}>
          Create a story
        </button>
      </section>
    )
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
        <button type="button" className="chip chip-new" onClick={() => setBuilding(true)}>
          + New story
        </button>
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
              capture="environment"
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
      {buildMsg ? (
        <p className="fine-print" role="status">
          {buildMsg}
        </p>
      ) : null}
    </section>
  )
}
