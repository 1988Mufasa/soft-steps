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

type PermState = 'unknown' | 'granted' | 'denied' | 'prompt' | 'unsupported'

async function queryPerm(name: 'camera' | 'microphone'): Promise<PermState> {
  try {
    if (!navigator.permissions?.query) return 'unsupported'
    const status = await navigator.permissions.query({ name: name as PermissionName })
    if (status.state === 'granted') return 'granted'
    if (status.state === 'denied') return 'denied'
    return 'prompt'
  } catch {
    return 'unsupported'
  }
}

/**
 * Gentle Add-to-Home-Screen guidance for PWA / native-feel install.
 * Includes a camera/mic checklist and a success state after install.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [iosHint, setIosHint] = useState(false)
  const [installed, setInstalled] = useState(() => isStandalone())
  const [showSuccess, setShowSuccess] = useState(false)
  const [cam, setCam] = useState<PermState>('unknown')
  const [mic, setMic] = useState<PermState>('unknown')
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem('soft-steps-a2hs-dismiss') === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    void queryPerm('camera').then(setCam)
    void queryPerm('microphone').then(setMic)
  }, [])

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true)
      try {
        if (sessionStorage.getItem('soft-steps-a2hs-just') === '1') {
          setShowSuccess(true)
          sessionStorage.removeItem('soft-steps-a2hs-just')
        }
      } catch {
        /* ignore */
      }
      return
    }
    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBip)
    if (isIos()) setIosHint(true)
    const onInstalled = () => {
      try {
        sessionStorage.setItem('soft-steps-a2hs-just', '1')
      } catch {
        /* ignore */
      }
      setInstalled(true)
      setShowSuccess(true)
      setDeferred(null)
    }
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBip)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const dismiss = () => {
    try {
      localStorage.setItem('soft-steps-a2hs-dismiss', '1')
    } catch {
      /* ignore */
    }
    setHidden(true)
    setShowSuccess(false)
  }

  const requestMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      stream.getTracks().forEach((t) => t.stop())
      setCam('granted')
      setMic('granted')
    } catch {
      void queryPerm('camera').then(setCam)
      void queryPerm('microphone').then(setMic)
    }
  }

  const permLabel = (s: PermState) =>
    s === 'granted' ? 'Ready' : s === 'denied' ? 'Blocked' : s === 'prompt' ? 'Tap to allow' : 'Check on device'

  if (showSuccess && installed) {
    return (
      <aside className="install-prompt install-success" role="status">
        <div>
          <strong>Soft Steps is on your Home Screen</strong>
          <p>Full-screen calm, offline tools, and camera photos work best from the home icon.</p>
          <ul className="install-checklist">
            <li>Camera: {permLabel(cam)}</li>
            <li>Microphone: {permLabel(mic)}</li>
          </ul>
        </div>
        <div className="install-prompt-actions">
          {(cam !== 'granted' || mic !== 'granted') && cam !== 'unsupported' ? (
            <button type="button" className="btn btn-secondary" onClick={() => void requestMedia()}>
              Allow camera & mic
            </button>
          ) : null}
          <button type="button" className="btn btn-primary" onClick={dismiss}>
            Got it
          </button>
        </div>
      </aside>
    )
  }

  if (hidden || installed) return null
  if (!deferred && !iosHint) return null

  return (
    <aside className="install-prompt" role="status">
      <div>
        <strong>Add Soft Steps to your Home Screen</strong>
        <p>
          {iosHint && !deferred
            ? 'On iPhone: Share → Add to Home Screen. Then open from the icon for camera & mic.'
            : 'One tap for offline care, full-screen calm, and device camera photos.'}
        </p>
        <ul className="install-checklist">
          <li>Camera for story & AAC photos — {permLabel(cam)}</li>
          <li>Mic for voice practice — {permLabel(mic)}</li>
        </ul>
      </div>
      <div className="install-prompt-actions">
        {deferred ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              void deferred.prompt().then(async () => {
                const choice = await deferred.userChoice
                setDeferred(null)
                if (choice.outcome === 'accepted') {
                  try {
                    sessionStorage.setItem('soft-steps-a2hs-just', '1')
                  } catch {
                    /* ignore */
                  }
                  setShowSuccess(true)
                  setInstalled(true)
                }
              })
            }}
          >
            Add to Home Screen
          </button>
        ) : null}
        {(cam !== 'granted' || mic !== 'granted') && cam !== 'unsupported' ? (
          <button type="button" className="btn btn-secondary" onClick={() => void requestMedia()}>
            Check camera & mic
          </button>
        ) : null}
        <button type="button" className="btn btn-ghost" onClick={dismiss}>
          Not now
        </button>
      </div>
    </aside>
  )
}
