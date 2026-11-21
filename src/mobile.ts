import { Capacitor } from '@capacitor/core'

/** Soft mobile shell init — safe on web/PWA when plugins are absent. */
export async function initMobileShell() {
  document.documentElement.dataset.platform = Capacitor.getPlatform()
  document.documentElement.dataset.native = Capacitor.isNativePlatform() ? 'true' : 'false'

  if (!Capacitor.isNativePlatform()) return

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: Style.Light })
    await StatusBar.setBackgroundColor({ color: '#E8F0E9' })
  } catch {
    /* plugin unavailable */
  }

  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide()
  } catch {
    /* plugin unavailable */
  }

  try {
    const { App } = await import('@capacitor/app')
    App.addListener('backButton', ({ canGoBack }) => {
      // Respect Adult Communication Lock on Talk AAC
      try {
        const raw = localStorage.getItem('soft-steps-settings')
        if (raw) {
          const parsed = JSON.parse(raw) as {
            aacLibrary?: { prefs?: { boardLocked?: boolean } }
          }
          const path = window.location.pathname
          const onTalkBoard = path === '/' || path.startsWith('/talk')
          if (parsed.aacLibrary?.prefs?.boardLocked && onTalkBoard) {
            return
          }
        }
      } catch {
        /* ignore */
      }
      if (canGoBack) {
        window.history.back()
      } else {
        void App.exitApp()
      }
    })
  } catch {
    /* plugin unavailable */
  }
}
