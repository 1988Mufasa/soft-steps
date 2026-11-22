import { createDefaultAacLibrary, type AacLibrary } from './data/aacPresets'

export type AgeBand = '3-6' | '7-12'

export type ModuleId = 'abc' | 'shapes' | 'colors' | 'numbers' | 'signs' | 'foods'

export type CareModuleId =
  | 'calm'
  | 'checkin'
  | 'feelings'
  | 'schedule'
  | 'stories'
  | 'talk'
  | 'friends'
  | 'interest'
  | 'videos'

/** @deprecated Legacy custom video entries — Soft Steps no longer embeds YouTube Kids. */
export type CustomLearningVideo = {
  id: string
  title: string
  emoji: string
  /** Legacy external id (unused; kept for backup restore compatibility) */
  youtubeId: string
}

export type OnlineActivityId = 'mix-quiz' | 'gentle-timer' | 'multi-match' | 'sync-demo'

export type InterestTheme = 'trains' | 'dinosaurs' | 'space' | 'patterns' | 'animals'

export type RewardTheme = 'trains' | 'space' | 'animals'

export type VoiceStyle = 'child' | 'gentle' | 'clear'

export type SensoryPrefs = {
  soundOn: boolean
  reducedMotion: boolean
  /** When true, OS “Reduce Motion” turns on reducedMotion automatically */
  followSystemMotion: boolean
  dimColors: boolean
  disableSuddenAnimations: boolean
  /** Mute celebratory chimes / sudden “yay” feedback */
  muteCelebrations: boolean
  /** Soften accent colors app-wide */
  mutedPalette: boolean
  /** Quieter tones + softer/slower speech (sensory-friendly / VoiceOver-friendly) */
  softAudio: boolean
  /** Accessibility: bigger body / UI text */
  largeText: boolean
  /** Accessibility: stronger ink / borders for contrast */
  highContrast: boolean
  /** Accessibility: larger tap targets */
  largeTapTargets: boolean
  /** Accessibility: always-visible focus rings for keyboard / switch / VoiceOver */
  showFocusOutlines: boolean
  /** System speechSynthesis voiceURI; empty = auto-pick best quality */
  voiceURI: string
  voiceStyle: VoiceStyle
}

export type CustomAacCard = {
  id: string
  label: string
  emoji: string
  photoDataUrl?: string
}

export type {
  AacAgeRange,
  AacButton,
  AacCategory,
  AacDisplayMode,
  AacGridLayout,
  AacLibrary,
  AacPartOfSpeech,
  AacPrefs,
  AacSensoryTheme,
  AacStage,
} from './data/aacPresets'

export type CareStats = {
  routinesCompleted: number
  routinesCompletedToday: number
  /** Local calendar day key YYYY-MM-DD for rolling “today” count */
  routinesDayKey: string
  lastRoutineAt: string | null
}

export type HomePrefs = {
  /** Practice module featured on Today’s path */
  todayPractice: ModuleId
  /** Favorite care/practice ids shown first under More */
  favorites: string[]
}

export type KidProfile = {
  id: string
  name: string
  emoji: string
  ageBand: AgeBand
  home: HomePrefs
  interestTheme: InterestTheme
}

/** Hour window 0–23 for auto-switching active routine */
export type RoutineHours = {
  startHour: number
  endHour: number
}

export type RoutineStep = {
  id: string
  label: string
  emoji: string
  photoDataUrl?: string
  voiceDataUrl?: string
  voiceText?: string
  timerSeconds: number
}

export type RoutineTemplateId = 'morning' | 'bedtime' | 'leaving'

export type Routine = {
  id: string
  templateId: RoutineTemplateId
  title: string
  steps: RoutineStep[]
  thenReward: {
    label: string
    emoji: string
    photoDataUrl?: string
  }
  /** When set, this routine auto-activates during these hours */
  hours?: RoutineHours
}

export type RoutinePrefs = {
  celebrateSounds: boolean
  reduceBrightness: boolean
  mutedPalette: boolean
  rewardTheme: RewardTheme
  tokensEarned: number
  stickers: string[]
  stepIndex: number
}

export type ScheduleSlot = {
  id: string
  label: string
  emoji: string
  photoDataUrl?: string
}

export type ScheduleBoard = {
  first: ScheduleSlot | null
  then: ScheduleSlot | null
  timerSeconds: number
}

export type StoryPage = {
  id: string
  title: string
  body: string
  emoji: string
  photoDataUrl?: string
  voiceText?: string
}

export type Story = {
  id: string
  title: string
  pages: StoryPage[]
}

export type ParentSettings = {
  /** @deprecated plaintext removed — kept empty after hash migration */
  pin: string
  pinHash: string
  pinSalt: string
  pinIsDefault: boolean
  /** PBKDF2 iterations for pinHash (defaults to legacy 120k if missing) */
  pinIterations?: number
  ageBand: AgeBand
  enabledModules: Record<ModuleId, boolean>
  enabledCareModules: Record<CareModuleId, boolean>
  enabledOnlineActivities: Record<OnlineActivityId, boolean>
  sensory: SensoryPrefs
  sessionLimitMinutes: number | null
  onlineExtrasEnabled: boolean
  interestTheme: InterestTheme
  activeRoutineId: string
  routines: Routine[]
  routinePrefs: RoutinePrefs
  schedule?: ScheduleBoard
  stories: Story[]
  interestChecklist: { id: string; label: string; done: boolean }[]
  customAacCards: CustomAacCard[]
  /** Full AAC library — presets + family/therapist/educator customizations */
  aacLibrary: AacLibrary
  customVideos: CustomLearningVideo[]
  careStats: CareStats
  home: HomePrefs
  /** Sibling profiles — age band / favorites / interest live here */
  profiles: KidProfile[]
  activeProfileId: string
  /** Follow routine hour windows automatically */
  autoSwitchRoutines: boolean
}

export type ModuleProgress = {
  attempts: number
  correct: number
  bestStreak: number
  lastPlayedAt: string | null
}

export type ProgressState = Record<ModuleId, ModuleProgress>

export const DEFAULT_PIN = '1234'

export const DEFAULT_ONLINE_ACTIVITIES: Record<OnlineActivityId, boolean> = {
  'mix-quiz': true,
  'gentle-timer': true,
  'multi-match': true,
  'sync-demo': true,
}

export const DEFAULT_CARE_MODULES: Record<CareModuleId, boolean> = {
  calm: true,
  checkin: true,
  feelings: true,
  schedule: true,
  stories: true,
  talk: true,
  friends: true,
  interest: true,
  videos: true,
}

export const DEFAULT_ROUTINE_PREFS: RoutinePrefs = {
  celebrateSounds: true,
  reduceBrightness: false,
  mutedPalette: false,
  rewardTheme: 'trains',
  tokensEarned: 0,
  stickers: [],
  stepIndex: 0,
}

const DEFAULT_MORNING: Routine = {
  id: 'routine-morning-default',
  templateId: 'morning',
  title: 'Morning',
  steps: [
    { id: 'm1', label: 'Bathroom', emoji: '🚽', timerSeconds: 45, voiceText: 'Bathroom' },
    { id: 'm2', label: 'Wash hands', emoji: '🧼', timerSeconds: 40, voiceText: 'Wash hands' },
    { id: 'm3', label: 'Clothes on', emoji: '👕', timerSeconds: 90, voiceText: 'Clothes on' },
    { id: 'm4', label: 'Breakfast', emoji: '🥣', timerSeconds: 120, voiceText: 'Breakfast' },
    { id: 'm5', label: 'Brush teeth', emoji: '🪥', timerSeconds: 60, voiceText: 'Brush teeth' },
  ],
  thenReward: { label: 'Quiet interest time', emoji: '⭐' },
}

export const SAMPLE_STORIES: Story[] = [
  {
    id: 'haircut',
    title: 'Haircut',
    pages: [
      { id: 'h1', title: 'We go in', body: 'We walk into the quiet shop.', emoji: '🚪', voiceText: 'We walk into the quiet shop.' },
      { id: 'h2', title: 'Cape on', body: 'A soft cape goes on my shoulders.', emoji: '🧥', voiceText: 'A soft cape goes on my shoulders.' },
      { id: 'h3', title: 'Snip snip', body: 'The scissors make soft sounds. I can hold still.', emoji: '✂️', voiceText: 'The scissors make soft sounds. I can hold still.' },
      { id: 'h4', title: 'All done', body: 'Haircut finished. Time for a calm reward.', emoji: '⭐', voiceText: 'Haircut finished. Time for a calm reward.' },
    ],
  },
  {
    id: 'dentist',
    title: 'Dentist',
    pages: [
      { id: 'd1', title: 'Waiting', body: 'We wait in a calm room.', emoji: '🪑', voiceText: 'We wait in a calm room.' },
      { id: 'd2', title: 'Chair', body: 'I sit in the big chair.', emoji: '🦷', voiceText: 'I sit in the big chair.' },
      { id: 'd3', title: 'Open', body: 'I open my mouth for a gentle look.', emoji: '👄', voiceText: 'I open my mouth for a gentle look.' },
      { id: 'd4', title: 'Done', body: 'Visit finished. We leave together.', emoji: '👋', voiceText: 'Visit finished. We leave together.' },
    ],
  },
  {
    id: 'airplane',
    title: 'Airplane',
    pages: [
      { id: 'a1', title: 'Airport', body: 'We walk through the airport.', emoji: '🏢', voiceText: 'We walk through the airport.' },
      { id: 'a2', title: 'Seatbelt', body: 'I buckle my seatbelt.', emoji: '🛟', voiceText: 'I buckle my seatbelt.' },
      { id: 'a3', title: 'Flying', body: 'The plane moves. Ears may feel funny.', emoji: '✈️', voiceText: 'The plane moves. Ears may feel funny.' },
      { id: 'a4', title: 'Landed', body: 'We landed. Next step is bags.', emoji: '🧳', voiceText: 'We landed. Next step is bags.' },
    ],
  },
  {
    id: 'doctor',
    title: 'Doctor visit',
    pages: [
      { id: 'dr1', title: 'Check in', body: 'We say hello at the desk.', emoji: '🏥', voiceText: 'We say hello at the desk.' },
      { id: 'dr2', title: 'Wait', body: 'We wait. I can hold a quiet toy.', emoji: '🧸', voiceText: 'We wait. I can hold a quiet toy.' },
      { id: 'dr3', title: 'Listen', body: 'The doctor listens to my body gently.', emoji: '🩺', voiceText: 'The doctor listens to my body gently.' },
      { id: 'dr4', title: 'Done', body: 'Visit finished. We go home together.', emoji: '🏠', voiceText: 'Visit finished. We go home together.' },
    ],
  },
  {
    id: 'school',
    title: 'School morning',
    pages: [
      { id: 'sc1', title: 'Bag', body: 'I pack my bag with what I need.', emoji: '🎒', voiceText: 'I pack my bag with what I need.' },
      { id: 'sc2', title: 'Ride', body: 'We travel to school.', emoji: '🚌', voiceText: 'We travel to school.' },
      { id: 'sc3', title: 'Hello', body: 'I say hello to my teacher.', emoji: '👩‍🏫', voiceText: 'I say hello to my teacher.' },
      { id: 'sc4', title: 'Ready', body: 'I am ready for the first activity.', emoji: '📗', voiceText: 'I am ready for the first activity.' },
    ],
  },
]

export const DEFAULT_CARE_STATS: CareStats = {
  routinesCompleted: 0,
  routinesCompletedToday: 0,
  routinesDayKey: '',
  lastRoutineAt: null,
}

export const DEFAULT_HOME: HomePrefs = {
  todayPractice: 'abc',
  favorites: ['schedule', 'talk', 'signs'],
}

export const DEFAULT_PROFILE_ID = 'kid-1'

export const DEFAULT_PROFILES: KidProfile[] = [
  {
    id: DEFAULT_PROFILE_ID,
    name: 'My kid',
    emoji: '🧒',
    ageBand: '3-6',
    home: { ...DEFAULT_HOME, favorites: [...DEFAULT_HOME.favorites] },
    interestTheme: 'dinosaurs',
  },
]

export const ROUTINE_HOUR_PRESETS: Record<RoutineTemplateId, RoutineHours> = {
  morning: { startHour: 5, endHour: 11 },
  leaving: { startHour: 11, endHour: 16 },
  bedtime: { startHour: 16, endHour: 5 },
}

export const DEFAULT_INTEREST_CHECKLIST = [
  { id: 'c1', label: 'Put shoes away', done: false },
  { id: 'c2', label: 'Wash hands', done: false },
  { id: 'c3', label: 'Sound out 3 letters', done: false },
  { id: 'c4', label: 'Try a calm breath', done: false },
]

export const DEFAULT_SETTINGS: ParentSettings = {
  pin: '',
  pinHash: '',
  pinSalt: '',
  pinIsDefault: true,
  ageBand: '3-6',
  enabledModules: {
    abc: true,
    shapes: true,
    colors: true,
    numbers: true,
    signs: true,
    foods: true,
  },
  enabledCareModules: { ...DEFAULT_CARE_MODULES },
  enabledOnlineActivities: { ...DEFAULT_ONLINE_ACTIVITIES },
  sensory: {
    soundOn: true,
    reducedMotion: false,
    followSystemMotion: true,
    dimColors: false,
    disableSuddenAnimations: false,
    muteCelebrations: false,
    mutedPalette: false,
    softAudio: false,
    largeText: false,
    highContrast: false,
    largeTapTargets: false,
    showFocusOutlines: true,
    voiceURI: '',
    voiceStyle: 'child',
  },
  sessionLimitMinutes: null,
  onlineExtrasEnabled: true,
  interestTheme: 'dinosaurs',
  activeRoutineId: DEFAULT_MORNING.id,
  routines: [
    {
      ...DEFAULT_MORNING,
      steps: DEFAULT_MORNING.steps.map((s) => ({ ...s })),
      thenReward: { ...DEFAULT_MORNING.thenReward },
      hours: { ...ROUTINE_HOUR_PRESETS.morning },
    },
    {
      id: 'routine-after-default',
      templateId: 'leaving',
      title: 'After school',
      steps: [
        { id: 'a1', label: 'Snack', emoji: '🍎', timerSeconds: 60, voiceText: 'Snack' },
        { id: 'a2', label: 'Backpack away', emoji: '🎒', timerSeconds: 45, voiceText: 'Backpack away' },
        { id: 'a3', label: 'Quiet play', emoji: '🧩', timerSeconds: 120, voiceText: 'Quiet play' },
      ],
      thenReward: { label: 'Interest time', emoji: '⭐' },
      hours: { ...ROUTINE_HOUR_PRESETS.leaving },
    },
    {
      id: 'routine-bed-default',
      templateId: 'bedtime',
      title: 'Bedtime',
      steps: [
        { id: 'b1', label: 'Bath', emoji: '🛁', timerSeconds: 90, voiceText: 'Bath' },
        { id: 'b2', label: 'Pajamas', emoji: '🩱', timerSeconds: 60, voiceText: 'Pajamas' },
        { id: 'b3', label: 'Brush teeth', emoji: '🪥', timerSeconds: 60, voiceText: 'Brush teeth' },
        { id: 'b4', label: 'Story', emoji: '📖', timerSeconds: 120, voiceText: 'Story' },
      ],
      thenReward: { label: 'Lights soft', emoji: '🌙' },
      hours: { ...ROUTINE_HOUR_PRESETS.bedtime },
    },
  ],
  routinePrefs: { ...DEFAULT_ROUTINE_PREFS },
  stories: SAMPLE_STORIES.map((s) => ({
    ...s,
    pages: s.pages.map((p) => ({ ...p })),
  })),
  interestChecklist: DEFAULT_INTEREST_CHECKLIST.map((c) => ({ ...c })),
  customAacCards: [],
  aacLibrary: createDefaultAacLibrary(),
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

export function emptyProgress(): ProgressState {
  return {
    abc: { attempts: 0, correct: 0, bestStreak: 0, lastPlayedAt: null },
    shapes: { attempts: 0, correct: 0, bestStreak: 0, lastPlayedAt: null },
    colors: { attempts: 0, correct: 0, bestStreak: 0, lastPlayedAt: null },
    numbers: { attempts: 0, correct: 0, bestStreak: 0, lastPlayedAt: null },
    signs: { attempts: 0, correct: 0, bestStreak: 0, lastPlayedAt: null },
    foods: { attempts: 0, correct: 0, bestStreak: 0, lastPlayedAt: null },
  }
}
