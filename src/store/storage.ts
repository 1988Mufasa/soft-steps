import { hashPin } from '../security/pinCrypto'
import { mergeAacLibrary } from '../data/aacPresets'
import {
  DEFAULT_CARE_STATS,
  DEFAULT_HOME,
  DEFAULT_PIN,
  DEFAULT_PROFILE_ID,
  DEFAULT_PROFILES,
  DEFAULT_ROUTINE_PREFS,
  DEFAULT_SETTINGS,
  ROUTINE_HOUR_PRESETS,
  SAMPLE_STORIES,
  emptyProgress,
  type KidProfile,
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
const PROGRESS_MAP_KEY = 'soft-steps-progress-by-profile'
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
      hours: r.hours ? { ...r.hours } : undefined,
    })),
    routinePrefs: { ...DEFAULT_SETTINGS.routinePrefs, stickers: [...DEFAULT_SETTINGS.routinePrefs.stickers] },
    stories: DEFAULT_SETTINGS.stories.map((s) => ({
      ...s,
      pages: s.pages.map((p) => ({ ...p })),
    })),
    interestChecklist: DEFAULT_SETTINGS.interestChecklist.map((c) => ({ ...c })),
    customAacCards: [],
    aacLibrary: mergeAacLibrary(DEFAULT_SETTINGS.aacLibrary),
    customVideos: [],
    careStats: { ...DEFAULT_CARE_STATS },
    home: { ...DEFAULT_HOME, favorites: [...DEFAULT_HOME.favorites] },
    profiles: DEFAULT_PROFILES.map((p) => ({
      ...p,
      home: { ...p.home, favorites: [...p.home.favorites] },
    })),
    activeProfileId: DEFAULT_PROFILE_ID,
    autoSwitchRoutines: true,
  }
}

function migrateAacLibrary(parsed: Partial<ParentSettings>) {
  const library = mergeAacLibrary(parsed.aacLibrary)
  // Fold legacy customAacCards into Family words if not already present
  const legacy = Array.isArray(parsed.customAacCards) ? parsed.customAacCards : []
  const existingIds = new Set(library.buttons.map((b) => b.id))
  const existingLabels = new Set(library.buttons.map((b) => b.label.toLowerCase()))
  let order = 1000
  for (const card of legacy) {
    if (!card?.label) continue
    const id = card.id || `legacy-${card.label}`
    if (existingIds.has(id) || existingLabels.has(card.label.toLowerCase())) continue
    library.buttons.push({
      id,
      label: card.label,
      emoji: card.emoji || '💬',
      categoryId: 'family',
      photoDataUrl: card.photoDataUrl,
      order: order++,
      source: 'custom',
    })
  }
  return library
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
    pinIterations: secrets.pinIterations,
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
      hours: r.hours ?? ROUTINE_HOUR_PRESETS[r.templateId],
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
        hours: { ...ROUTINE_HOUR_PRESETS.leaving },
      },
    ]
  }
  return base.routines.map((r) => ({
    ...r,
    steps: r.steps.map((s) => ({ ...s })),
    thenReward: { ...r.thenReward },
    hours: r.hours ? { ...r.hours } : undefined,
  }))
}

function migrateProfiles(parsed: Partial<ParentSettings>, base: ParentSettings): KidProfile[] {
  if (parsed.profiles?.length) {
    return parsed.profiles.map((p) => ({
      ...p,
      home: {
        ...DEFAULT_HOME,
        ...p.home,
        favorites: p.home?.favorites ?? [...DEFAULT_HOME.favorites],
      },
    }))
  }
  return [
    {
      id: DEFAULT_PROFILE_ID,
      name: 'My kid',
      emoji: '🧒',
      ageBand: parsed.ageBand ?? base.ageBand,
      home: {
        ...DEFAULT_HOME,
        ...parsed.home,
        favorites: parsed.home?.favorites ?? [...DEFAULT_HOME.favorites],
      },
      interestTheme: parsed.interestTheme ?? base.interestTheme,
    },
  ]
}

export function loadSettings(): ParentSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return cloneDefaults()
    const parsed = JSON.parse(raw) as Partial<ParentSettings>
    const base = cloneDefaults()
    const routines = migrateLegacySchedule(parsed, base)
    const profiles = migrateProfiles(parsed, base)
    const activeProfileId =
      parsed.activeProfileId && profiles.some((p) => p.id === parsed.activeProfileId)
        ? parsed.activeProfileId
        : profiles[0]?.id ?? DEFAULT_PROFILE_ID
    const active = profiles.find((p) => p.id === activeProfileId) ?? profiles[0]
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
      pinIterations:
        typeof parsed.pinIterations === 'number' && parsed.pinIterations > 0
          ? parsed.pinIterations
          : undefined,
      pinIsDefault:
        typeof parsed.pinIsDefault === 'boolean'
          ? parsed.pinIsDefault
          : !parsed.pinHash,
      ageBand: active?.ageBand ?? base.ageBand,
      interestTheme: active?.interestTheme ?? base.interestTheme,
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
      aacLibrary: migrateAacLibrary(parsed),
      customVideos: Array.isArray(parsed.customVideos) ? parsed.customVideos : [],
      careStats: { ...DEFAULT_CARE_STATS, ...parsed.careStats },
      home: active?.home ?? {
        ...DEFAULT_HOME,
        ...parsed.home,
        favorites: parsed.home?.favorites ?? [...DEFAULT_HOME.favorites],
      },
      profiles,
      activeProfileId,
      autoSwitchRoutines:
        typeof parsed.autoSwitchRoutines === 'boolean' ? parsed.autoSwitchRoutines : true,
    }
  } catch {
    return cloneDefaults()
  }
}

export function saveSettings(settings: ParentSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

function loadProgressMap(): Record<string, ProgressState> {
  try {
    const raw = localStorage.getItem(PROGRESS_MAP_KEY)
    if (raw) return JSON.parse(raw) as Record<string, ProgressState>
  } catch {
    /* fall through */
  }
  // Migrate legacy single progress blob into default profile
  try {
    const legacy = localStorage.getItem(PROGRESS_KEY)
    if (legacy) {
      const parsed = { ...emptyProgress(), ...JSON.parse(legacy) } as ProgressState
      const map = { [DEFAULT_PROFILE_ID]: parsed }
      localStorage.setItem(PROGRESS_MAP_KEY, JSON.stringify(map))
      return map
    }
  } catch {
    /* ignore */
  }
  return {}
}

export function loadProgress(profileId = DEFAULT_PROFILE_ID): ProgressState {
  const map = loadProgressMap()
  return { ...emptyProgress(), ...(map[profileId] ?? {}) }
}

export function saveProgress(progress: ProgressState, profileId = DEFAULT_PROFILE_ID) {
  const map = loadProgressMap()
  map[profileId] = progress
  localStorage.setItem(PROGRESS_MAP_KEY, JSON.stringify(map))
  // Keep legacy key in sync for older readers
  if (profileId === DEFAULT_PROFILE_ID) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  }
}

export function loadAllProgress(): Record<string, ProgressState> {
  return loadProgressMap()
}

export function saveAllProgress(map: Record<string, ProgressState>) {
  localStorage.setItem(PROGRESS_MAP_KEY, JSON.stringify(map))
}

export function resetProgress(profileId = DEFAULT_PROFILE_ID) {
  const cleared = emptyProgress()
  saveProgress(cleared, profileId)
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
