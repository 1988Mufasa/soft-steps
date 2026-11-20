export type AgeBand = '3-6' | '7-12'

export type ModuleId = 'abc' | 'shapes' | 'colors' | 'numbers'

export type SensoryPrefs = {
  soundOn: boolean
  reducedMotion: boolean
}

export type ParentSettings = {
  pin: string
  ageBand: AgeBand
  enabledModules: Record<ModuleId, boolean>
  sensory: SensoryPrefs
  sessionLimitMinutes: number | null
  onlineExtrasEnabled: boolean
}

export type ModuleProgress = {
  attempts: number
  correct: number
  bestStreak: number
  lastPlayedAt: string | null
}

export type ProgressState = Record<ModuleId, ModuleProgress>

export const DEFAULT_PIN = '1234'

export const DEFAULT_SETTINGS: ParentSettings = {
  pin: DEFAULT_PIN,
  ageBand: '3-6',
  enabledModules: {
    abc: true,
    shapes: true,
    colors: true,
    numbers: true,
  },
  sensory: {
    soundOn: true,
    reducedMotion: false,
  },
  sessionLimitMinutes: null,
  onlineExtrasEnabled: true,
}

export function emptyProgress(): ProgressState {
  return {
    abc: { attempts: 0, correct: 0, bestStreak: 0, lastPlayedAt: null },
    shapes: { attempts: 0, correct: 0, bestStreak: 0, lastPlayedAt: null },
    colors: { attempts: 0, correct: 0, bestStreak: 0, lastPlayedAt: null },
    numbers: { attempts: 0, correct: 0, bestStreak: 0, lastPlayedAt: null },
  }
}
