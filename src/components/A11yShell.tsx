import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

const TITLE_FOR_PATH: Record<string, string> = {
  '/': 'Talk board',
  '/hub': 'More tools',
  '/meltdown': 'Quiet calm',
  '/calm': 'Calm toolkit',
  '/check-in': 'AAC and check-in',
  '/feelings': 'Feelings',
  '/schedule': 'First Then routine',
  '/schedule/board': 'First Then board',
  '/schedule/builder': 'Routine builder',
  '/stories': 'Social stories',
  '/videos': 'Learning videos',
  '/talk/edit': 'AAC editor',
  '/friends': 'Social cues',
  '/interest': 'Interest rewards',
  '/abc': 'ABCs',
  '/shapes': 'Shapes',
  '/colors': 'Colors',
  '/numbers': 'Numbers',
  '/signs': 'Sign language',
  '/foods': 'Pictures',
  '/online': 'Extra games',
  '/parent': 'Grown-up unlock',
  '/parent/dashboard': 'Grown-up controls',
  '/privacy': 'Privacy',
}

function titleFor(pathname: string) {
  if (TITLE_FOR_PATH[pathname]) return TITLE_FOR_PATH[pathname]
  if (pathname.startsWith('/online/')) return 'Extra game'
  return 'Soft Steps'
}

/**
 * Skip link + VoiceOver route announcements for the app shell.
 */
export function A11yShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const liveRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const label = titleFor(pathname)
    document.title = `${label} · Soft Steps`
    // Polite live region helps VoiceOver announce navigation without stealing focus
    if (liveRef.current) {
      liveRef.current.textContent = ''
      // Force a DOM change so AT re-reads
      window.requestAnimationFrame(() => {
        if (liveRef.current) liveRef.current.textContent = label
      })
    }
  }, [pathname])

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div
        ref={liveRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
      <main id="main-content" className="app-main" tabIndex={-1}>
        {children}
      </main>
    </>
  )
}
