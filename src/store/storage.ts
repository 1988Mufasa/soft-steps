import {
  DEFAULT_SETTINGS,
  emptyProgress,
  type ParentSettings,
  type ProgressState,
} from '../types'

const SETTINGS_KEY = 'soft-steps-settings'
const PROGRESS_KEY = 'soft-steps-progress'
const SESSION_KEY = 'soft-steps-session-started'

function cloneDefaults(): ParentSettings {
  return {
    ...DEFAULT_SETTINGS,
    enabledModules: { ...DEFAULT_SETTINGS.enabledModules },
    enabledCareModules: { ...DEFAULT_SETTINGS.enabledCareModules },
    enabledOnlineActivities: { ...DEFAULT_SETTINGS.enabledOnlineActivities },
    sensory: { ...DEFAULT_SETTINGS.sensory },
    schedule: {
      ...DEFAULT_SETTINGS.schedule,
      first: DEFAULT_SETTINGS.schedule.first
        ? { ...DEFAULT_SETTINGS.schedule.first }
        : null,
      then: DEFAULT_SETTINGS.schedule.then ? { ...DEFAULT_SETTINGS.schedule.then } : null,
    },
    stories: DEFAULT_SETTINGS.stories.map((s) => ({
      ...s,
      pages: s.pages.map((p) => ({ ...p })),
    })),
    interestChecklist: DEFAULT_SETTINGS.interestChecklist.map((c) => ({ ...c })),
  }
}

export function loadSettings(): ParentSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return cloneDefaults()
    const parsed = JSON.parse(raw) as Partial<ParentSettings>
    const base = cloneDefaults()
    return {
      ...base,
      ...parsed,
      enabledModules: { ...base.enabledModules, ...parsed.enabledModules },
      enabledCareModules: { ...base.enabledCareModules, ...parsed.enabledCareModules },
      enabledOnlineActivities: {
        ...base.enabledOnlineActivities,
        ...parsed.enabledOnlineActivities,
      },
      sensory: { ...base.sensory, ...parsed.sensory },
      schedule: {
        ...base.schedule,
        ...parsed.schedule,
        first: parsed.schedule?.first ?? base.schedule.first,
        then: parsed.schedule?.then ?? base.schedule.then,
      },
      stories: parsed.stories?.length ? parsed.stories : base.stories,
      interestChecklist: parsed.interestChecklist?.length
        ? parsed.interestChecklist
        : base.interestChecklist,
    }
  } catch {
    return cloneDefaults()
  }
}

export function saveSettings(settings: ParentSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return emptyProgress()
    return { ...emptyProgress(), ...JSON.parse(raw) }
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(progress: ProgressState) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
}

export function resetProgress() {
  const cleared = emptyProgress()
  saveProgress(cleared)
  return cleared
}

export function getSessionStarted(): number | null {
  const raw = sessionStorage.getItem(SESSION_KEY)
  return raw ? Number(raw) : null
}

export function markSessionStarted() {
  if (!sessionStorage.getItem(SESSION_KEY)) {
    sessionStorage.setItem(SESSION_KEY, String(Date.now()))
  }
}

export function clearSessionStarted() {
  sessionStorage.removeItem(SESSION_KEY)
}
