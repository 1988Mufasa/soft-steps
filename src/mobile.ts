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
