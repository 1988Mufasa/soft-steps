export type AgeBand = '3-6' | '7-12'

export type ModuleId = 'abc' | 'shapes' | 'colors' | 'numbers' | 'signs'

export type CareModuleId =
  | 'calm'
  | 'checkin'
  | 'feelings'
  | 'schedule'
  | 'stories'
  | 'talk'
  | 'friends'
  | 'interest'

export type OnlineActivityId = 'mix-quiz' | 'gentle-timer' | 'multi-match' | 'sync-demo'

export type InterestTheme = 'trains' | 'dinosaurs' | 'space' | 'patterns' | 'animals'

export type RewardTheme = 'trains' | 'space' | 'animals'

export type VoiceStyle = 'child' | 'gentle' | 'clear'

export type SensoryPrefs = {
  soundOn: boolean
  reducedMotion: boolean
  dimColors: boolean
  disableSuddenAnimations: boolean
  /** System speechSynthesis voiceURI; empty = auto-pick best quality */
  voiceURI: string
  voiceStyle: VoiceStyle
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
]

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
  },
  enabledCareModules: { ...DEFAULT_CARE_MODULES },
  enabledOnlineActivities: { ...DEFAULT_ONLINE_ACTIVITIES },
  sensory: {
    soundOn: true,
    reducedMotion: false,
    dimColors: false,
    disableSuddenAnimations: false,
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
    },
  ],
  routinePrefs: { ...DEFAULT_ROUTINE_PREFS },
  stories: SAMPLE_STORIES.map((s) => ({
    ...s,
    pages: s.pages.map((p) => ({ ...p })),
  })),
  interestChecklist: DEFAULT_INTEREST_CHECKLIST.map((c) => ({ ...c })),
}

export function emptyProgress(): ProgressState {
  return {
    abc: { attempts: 0, correct: 0, bestStreak: 0, lastPlayedAt: null },
    shapes: { attempts: 0, correct: 0, bestStreak: 0, lastPlayedAt: null },
    colors: { attempts: 0, correct: 0, bestStreak: 0, lastPlayedAt: null },
    numbers: { attempts: 0, correct: 0, bestStreak: 0, lastPlayedAt: null },
    signs: { attempts: 0, correct: 0, bestStreak: 0, lastPlayedAt: null },
  }
}
