import { Capacitor, registerPlugin } from '@capacitor/core'

export type GuidedAccessStatus = {
  /** Whether we could read Guided Access from the OS */
  available: boolean
  /** UIAccessibility.isGuidedAccessEnabled when on iOS native */
  enabled: boolean
  platform: string
}

type GuidedAccessPlugin = {
  isEnabled(): Promise<{ enabled: boolean }>
}

const GuidedAccess = registerPlugin<GuidedAccessPlugin>('GuidedAccess', {
  web: {
    async isEnabled() {
      return { enabled: false }
    },
  },
})

/**
 * Reads iOS Guided Access (UIAccessibility.isGuidedAccessEnabled) via a
 * Capacitor plugin when running in the native iOS shell. Web / Android
 * report available: false so the UI can show an explanatory badge.
 */
export async function getGuidedAccessStatus(): Promise<GuidedAccessStatus> {
  const platform = Capacitor.getPlatform()
  if (!Capacitor.isNativePlatform() || platform !== 'ios') {
    return { available: false, enabled: false, platform }
  }
  try {
    const { enabled } = await GuidedAccess.isEnabled()
    return { available: true, enabled: Boolean(enabled), platform }
  } catch {
    return { available: false, enabled: false, platform }
  }
}
