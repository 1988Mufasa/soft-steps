import { Capacitor } from '@capacitor/core'
import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

/**
 * Browser-only reminder: Soft Steps is meant as a Home Screen / store app,
 * not a website left open in a tab.
 */
export function AppShellBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [iosHint, setIosHint] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem('soft-steps-app-banner') === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (Capacitor.isNativePlatform() || isStandalone() || dismissed) return
    if (isIos()) setIosHint(true)
    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBip)
    return () => window.removeEventListener('beforeinstallprompt', onBip)
  }, [dismissed])

  if (Capacitor.isNativePlatform() || isStandalone() || dismissed) return null

  return (
    <aside className="app-shell-banner" role="region" aria-label="Install Soft Steps as an app">
      <div>
        <strong>Soft Steps is an app</strong>
        <p>
          {iosHint && !deferred
            ? 'On iPhone/iPad: Share → Add to Home Screen, then open from the icon for a full-screen AAC board.'
            : 'Install to your Home Screen for a full-screen, offline AAC board — no browser bars.'}
        </p>
        <p className="fine-print">
          Native builds: on a Mac run <code>npm run mobile:ios</code> or{' '}
          <code>npm run mobile:android</code> (Xcode / Android Studio).
        </p>
      </div>
      <div className="app-shell-banner-actions">
        {deferred ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              void deferred.prompt().then(async () => {
                await deferred.userChoice
                setDeferred(null)
              })
            }}
          >
            Install app
          </button>
        ) : null}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            try {
              localStorage.setItem('soft-steps-app-banner', '1')
            } catch {
              /* ignore */
            }
            setDismissed(true)
          }}
        >
          Got it
        </button>
      </div>
    </aside>
  )
}
