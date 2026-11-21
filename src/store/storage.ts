import { hashPin } from '../security/pinCrypto'
import {
  DEFAULT_CARE_STATS,
  DEFAULT_HOME,
  DEFAULT_PIN,
  DEFAULT_ROUTINE_PREFS,
  DEFAULT_SETTINGS,
  SAMPLE_STORIES,
  emptyProgress,
  type ParentSettings,
  type ProgressState,
  type Routine,
  type Story,
} from '../types'

function mergeStories(parsed: Story[] | undefined, base: Story[]): Story[] {
  if (!parsed?.length) return base.map((s) => ({ ...s, pages: s.pages.map((p) => ({ ...p })) }))
  const byId = new Map(parsed.map((s) => [s.id, s]))
  for (const sample of SAMPLE_STORIES) {
    if (!byId.has(sample.id)) {
      byId.set(sample.id, {
        ...sample,
        pages: sample.pages.map((p) => ({ ...p })),
      })
    }
  }
  return [...byId.values()]
}

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
    routines: DEFAULT_SETTINGS.routines.map((r) => ({
      ...r,
      steps: r.steps.map((s) => ({ ...s })),
      thenReward: { ...r.thenReward },
    })),
    routinePrefs: { ...DEFAULT_SETTINGS.routinePrefs, stickers: [...DEFAULT_SETTINGS.routinePrefs.stickers] },
    stories: DEFAULT_SETTINGS.stories.map((s) => ({
      ...s,
      pages: s.pages.map((p) => ({ ...p })),
    })),
    interestChecklist: DEFAULT_SETTINGS.interestChecklist.map((c) => ({ ...c })),
    customAacCards: [],
    customVideos: [],
    careStats: { ...DEFAULT_CARE_STATS },
    home: { ...DEFAULT_HOME, favorites: [...DEFAULT_HOME.favorites] },
  }
}

/** Migrate legacy plaintext PIN → salted PBKDF2 hash. Never leave PIN in localStorage. */
export async function ensurePinHashed(settings: ParentSettings): Promise<ParentSettings> {
  if (settings.pinHash && settings.pinSalt) {
    if (settings.pin) {
      const cleared = { ...settings, pin: '' }
      saveSettings(cleared)
      return cleared
    }
    return settings
  }

  const legacyPin =
    settings.pin && /^\d{4,6}$/.test(settings.pin) ? settings.pin : DEFAULT_PIN
  const secrets = await hashPin(legacyPin, legacyPin === DEFAULT_PIN)
  const next: ParentSettings = {
    ...settings,
    pin: '',
    pinHash: secrets.pinHash,
    pinSalt: secrets.pinSalt,
    pinIsDefault: secrets.pinIsDefault,
  }
  saveSettings(next)
  return next
}

function migrateLegacySchedule(parsed: Partial<ParentSettings>, base: ParentSettings): Routine[] {
  if (parsed.routines?.length) {
    return parsed.routines.map((r) => ({
      ...r,
      steps: r.steps.map((s) => ({ ...s })),
      thenReward: { ...r.thenReward },
    }))
  }
  if (parsed.schedule?.first || parsed.schedule?.then) {
    const steps = []
    if (parsed.schedule.first) {
      steps.push({
        id: parsed.schedule.first.id || 'first',
        label: parsed.schedule.first.label,
        emoji: parsed.schedule.first.emoji,
        photoDataUrl: parsed.schedule.first.photoDataUrl,
        timerSeconds: parsed.schedule.timerSeconds || 60,
        voiceText: parsed.schedule.first.label,
      })
    }
    const then = parsed.schedule.then
    return [
      {
        id: 'routine-migrated',
        templateId: 'leaving' as const,
        title: 'My routine',
        steps:
          steps.length > 0
            ? steps
            : base.routines[0].steps.map((s) => ({ ...s })),
        thenReward: then
          ? { label: then.label, emoji: then.emoji, photoDataUrl: then.photoDataUrl }
          : { ...base.routines[0].thenReward },
      },
    ]
  }
  return base.routines.map((r) => ({
    ...r,
    steps: r.steps.map((s) => ({ ...s })),
    thenReward: { ...r.thenReward },
  }))
}

export function loadSettings(): ParentSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return cloneDefaults()
    const parsed = JSON.parse(raw) as Partial<ParentSettings>
    const base = cloneDefaults()
    const routines = migrateLegacySchedule(parsed, base)
    const activeRoutineId =
      parsed.activeRoutineId && routines.some((r) => r.id === parsed.activeRoutineId)
        ? parsed.activeRoutineId
        : routines[0]?.id ?? base.activeRoutineId

    return {
      ...base,
      ...parsed,
      pin: typeof parsed.pin === 'string' ? parsed.pin : '',
      pinHash: typeof parsed.pinHash === 'string' ? parsed.pinHash : '',
      pinSalt: typeof parsed.pinSalt === 'string' ? parsed.pinSalt : '',
      pinIsDefault:
        typeof parsed.pinIsDefault === 'boolean'
          ? parsed.pinIsDefault
          : !parsed.pinHash,
      enabledModules: { ...base.enabledModules, ...parsed.enabledModules },
      enabledCareModules: { ...base.enabledCareModules, ...parsed.enabledCareModules },
      enabledOnlineActivities: {
        ...base.enabledOnlineActivities,
        ...parsed.enabledOnlineActivities,
      },
      sensory: { ...base.sensory, ...parsed.sensory },
      routines,
      activeRoutineId,
      routinePrefs: {
        ...DEFAULT_ROUTINE_PREFS,
        ...parsed.routinePrefs,
        stickers: parsed.routinePrefs?.stickers ?? [],
      },
      stories: mergeStories(parsed.stories, base.stories),
      interestChecklist: parsed.interestChecklist?.length
        ? parsed.interestChecklist
        : base.interestChecklist,
      customAacCards: Array.isArray(parsed.customAacCards) ? parsed.customAacCards : [],
      customVideos: Array.isArray(parsed.customVideos) ? parsed.customVideos : [],
      careStats: { ...DEFAULT_CARE_STATS, ...parsed.careStats },
      home: {
        ...DEFAULT_HOME,
        ...parsed.home,
        favorites: parsed.home?.favorites ?? [...DEFAULT_HOME.favorites],
      },
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
