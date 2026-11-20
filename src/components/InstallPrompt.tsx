import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

/**
 * Gentle Add-to-Home-Screen guidance for PWA / native-feel install.
 * Hides once installed or dismissed for this device.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [iosHint, setIosHint] = useState(false)
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem('soft-steps-a2hs-dismiss') === '1' || isStandalone()
    } catch {
      return isStandalone()
    }
  })

  useEffect(() => {
    if (hidden || isStandalone()) return
    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBip)
    if (isIos()) setIosHint(true)
    return () => window.removeEventListener('beforeinstallprompt', onBip)
  }, [hidden])

  if (hidden || isStandalone()) return null
  if (!deferred && !iosHint) return null

  const dismiss = () => {
    try {
      localStorage.setItem('soft-steps-a2hs-dismiss', '1')
    } catch {
      /* ignore */
    }
    setHidden(true)
  }

  return (
    <aside className="install-prompt" role="status">
      <div>
        <strong>Add Soft Steps to your Home Screen</strong>
        <p>
          {iosHint && !deferred
            ? 'On iPhone: Share → Add to Home Screen. Camera & mic work best from the home icon.'
            : 'Install for offline care tools, camera photos, and full-screen calm.'}
        </p>
      </div>
      <div className="install-prompt-actions">
        {deferred ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              void deferred.prompt().then(() => {
                setDeferred(null)
                dismiss()
              })
            }}
          >
            Install
          </button>
        ) : null}
        <button type="button" className="btn btn-ghost" onClick={dismiss}>
          Not now
        </button>
      </div>
    </aside>
  )
}
