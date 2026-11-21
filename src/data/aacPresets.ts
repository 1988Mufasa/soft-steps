/**
 * Soft Steps AAC — age-adaptive board with fixed motor-planning slots.
 * Words never move when a child grows from starter → developing → expanded.
 * Soft Steps never rearranges by tap frequency.
 */

/** Fitzgerald Key–style part of speech for color coding */
export type AacPartOfSpeech =
  | 'pronoun' // yellow
  | 'verb' // green
  | 'noun' // orange
  | 'adjective' // blue — feelings / descriptors
  | 'social' // pink / purple — quick responses
  | 'misc'

export type AacCategoryId =
  | 'core'
  | 'feelings'
  | 'needs'
  | 'people'
  | 'food'
  | 'actions'
  | 'places'
  | 'signs'
  | 'family'

export type AacDisplayMode = 'photo' | 'sign' | 'emoji' | 'auto'

/** Grid density options offered at setup */
export type AacGridLayout = '2x2' | '2x3' | '3x3' | '3x4' | '4x4' | '4x6'

export type AacTouchTrigger = 'press' | 'release'

/**
 * Home vs School board context. Core words stay in the exact same slots;
 * fringe / family words can be context-specific.
 */
export type AacBoardContextId = 'home' | 'school'

/** Growth stages — unlock more cells without moving existing words */
export type AacStage = 'starter' | 'developing' | 'expanded'

/** Age ranges shown during parent / SLP / educator setup */
export type AacAgeRange = '3-4' | '5-7' | '8-12'

/** Master board is always 4 columns; stages reveal more of the same map */
export const AAC_MASTER_COLS = 4
export const AAC_MASTER_ROWS = 6

export type AacButton = {
  id: string
  label: string
  speak?: string
  emoji: string
  categoryId: AacCategoryId | string
  partOfSpeech: AacPartOfSpeech
  photoDataUrl?: string
  signPhotoDataUrl?: string
  audioDataUrl?: string
  /**
   * Fully removed from lists (rare). Prefer `masked` so slots stay put.
   */
  hidden?: boolean
  /**
   * Progressive vocabulary: button stays in its permanent slot but is blank /
   * non-interactive until an SLP unmasks it. Does not shift the grid.
   */
  masked?: boolean
  /**
   * Legacy sort key within fringe folders.
   * Core words use row/col instead.
   */
  order: number
  source: 'preset' | 'custom'
  /** Permanent motor-planning cell (core board only) */
  row?: number
  col?: number
  /** Earliest stage that shows this word */
  minStage?: AacStage
  /** Optional custom grammar forms (overrides built-in word-forms table) */
  forms?: string[]
  /**
   * Board context. Core is always `both`. Fringe may be home-only or school-only
   * so parents can switch boards without moving motor-planning slots.
   */
  boardContext?: AacBoardContextId | 'both'
}

export type AacCategory = {
  id: AacCategoryId | string
  title: string
  emoji: string
  order: number
  hidden?: boolean
  source: 'preset' | 'custom'
  /** Folders appear at this stage (core is always main) */
  minStage?: AacStage
}

export type AacPrefs = {
  gridLayout: AacGridLayout
  displayMode: AacDisplayMode
  showLabels: boolean
  speakOnTap: boolean
  messageBar: boolean
  largeButtons: boolean
  corePinned: boolean
  colorCoding: boolean
  touchDelayMs: 0 | 200 | 400 | 600
  touchTrigger: AacTouchTrigger
  buttonAnimations: boolean
  tapSounds: boolean
  speechPitch: number
  speechRate: number
  aboutMeEnabled: boolean
  aboutMeText: string
  /** Growth stage — unlocks words/folders without moving slots */
  stage: AacStage
  /** Age range chosen at setup (drives recommendations) */
  ageRange: AacAgeRange
  /** Setup wizard completed by parent / SLP / educator */
  setupComplete: boolean
  /** High-contrast icons for starter boards */
  highContrast: boolean
  /** Speak the word label when a button activates (audio labels) */
  audioLabels: boolean
  /** Show fringe category folders (Feelings, Food, …) */
  showFolders: boolean
  /**
   * Lock to AAC board — hides Home / Edit so the child stays on Talk.
   * Grown-ups unlock with a 4-second padlock hold (parental gate).
   */
  boardLocked: boolean
  /**
   * SLP modeling: adult taps glow + speak without adding to the sentence strip.
   */
  modelMode: boolean
  /** Press-and-hold pops verb tenses / plurals */
  wordFormsEnabled: boolean
  /** Show empty reserved cells for masked core words (muscle-memory slots) */
  showMaskedSlots: boolean
  /** Active Home / School board (core slots unchanged) */
  activeBoardContext: AacBoardContextId
  /** Always-visible “Excuse me / Look!” attention button */
  attentionEnabled: boolean
  attentionPhrase: string
  /** One-tap Pain & Body Check overlay on Talk */
  bodyCheckEnabled: boolean
}

export const AAC_BOARD_CONTEXTS: {
  id: AacBoardContextId
  label: string
  emoji: string
  blurb: string
}[] = [
  {
    id: 'home',
    label: 'Home board',
    emoji: '🏠',
    blurb: 'Favorite snacks, pets, family — core words stay put.',
  },
  {
    id: 'school',
    label: 'School board',
    emoji: '🏫',
    blurb: 'Teacher, recess, bus, classroom — same core slots.',
  },
]

export const DEFAULT_ATTENTION_PHRASE = 'Excuse me! Look!'

export type AacLibrary = {
  categories: AacCategory[]
  buttons: AacButton[]
  prefs: AacPrefs
}

export const FITZGERALD_COLORS: Record<
  AacPartOfSpeech,
  { bg: string; border: string; label: string }
> = {
  pronoun: { bg: '#FFF3B0', border: '#E6C200', label: 'Pronouns (yellow)' },
  verb: { bg: '#C8E6C9', border: '#43A047', label: 'Verbs / actions (green)' },
  noun: { bg: '#FFE0B2', border: '#FB8C00', label: 'Nouns (orange)' },
  adjective: { bg: '#BBDEFB', border: '#1E88E5', label: 'Feelings / descriptors (blue)' },
  social: { bg: '#E1BEE7', border: '#8E24AA', label: 'Social / quick responses (pink–purple)' },
  misc: { bg: '#F5F5F5', border: '#9E9E9E', label: 'Other' },
}

export const GRID_LAYOUTS: {
  id: AacGridLayout
  label: string
  columns: number
  rows: number
  hint: string
}[] = [
  { id: '2x2', label: '2×2', columns: 2, rows: 2, hint: 'Biggest buttons · ages 3–4' },
  { id: '2x3', label: '2×3', columns: 2, rows: 3, hint: 'Large starter · ages 3–4' },
  { id: '3x3', label: '3×3', columns: 3, rows: 3, hint: 'In between' },
  { id: '3x4', label: '3×4', columns: 3, rows: 4, hint: 'Developing · ages 5–7' },
  { id: '4x4', label: '4×4', columns: 4, rows: 4, hint: 'Denser' },
  { id: '4x6', label: '4×6', columns: 4, rows: 6, hint: 'Expanded · ages 8–12' },
]

export const AAC_STAGES: {
  id: AacStage
  ageRange: AacAgeRange
  title: string
  agesLabel: string
  recommendedLayouts: AacGridLayout[]
  defaultLayout: AacGridLayout
  blurb: string
  focusWords: string[]
}[] = [
  {
    id: 'starter',
    ageRange: '3-4',
    title: 'Starter grid',
    agesLabel: 'Ages 3–4',
    recommendedLayouts: ['2x2', '2x3'],
    defaultLayout: '2x3',
    blurb:
      'Large buttons, high-contrast icons, and audio labels. Focus on immediate needs — More, All Done, Help, Yes, No, Want. Positions stay put as your child grows.',
    focusWords: ['Want', 'Help', 'More', 'All Done', 'Yes', 'No'],
  },
  {
    id: 'developing',
    ageRange: '5-7',
    title: 'Developing grid',
    agesLabel: 'Ages 5–7',
    recommendedLayouts: ['3x4'],
    defaultLayout: '3x4',
    blurb:
      'Adds pronouns and basic actions so kids can build 2–3 word sentences in the message bar (I, You, Go, Stop, Eat, Drink, Play, Bathroom). Earlier words keep their exact spots.',
    focusWords: ['I', 'You', 'Go', 'Stop', 'Eat', 'Drink', 'Play', 'Bathroom'],
  },
  {
    id: 'expanded',
    ageRange: '8-12',
    title: 'Expanded grid',
    agesLabel: 'Ages 8–12',
    recommendedLayouts: ['4x6'],
    defaultLayout: '4x6',
    blurb:
      'Full core board with category folders (Feelings, Food, People, Places, ASL Signs). Core words stay in the same top/left slots — no re-learning.',
    focusWords: ['Full core board', 'Folders', 'ASL Signs'],
  },
]

export const DEFAULT_ABOUT_ME =
  'Hi. I am autistic and non-verbal. I use this device to talk. Please be patient and call my parent.'

export const DEFAULT_AAC_PREFS: AacPrefs = {
  gridLayout: '2x3',
  displayMode: 'auto',
  showLabels: true,
  speakOnTap: true,
  messageBar: true,
  largeButtons: true,
  corePinned: true,
  colorCoding: true,
  touchDelayMs: 0,
  touchTrigger: 'press',
  buttonAnimations: true,
  tapSounds: false,
  speechPitch: 1.2,
  speechRate: 0.92,
  aboutMeEnabled: true,
  aboutMeText: DEFAULT_ABOUT_ME,
  stage: 'starter',
  ageRange: '3-4',
  setupComplete: false,
  highContrast: true,
  audioLabels: true,
  showFolders: false,
  boardLocked: false,
  modelMode: false,
  wordFormsEnabled: true,
  showMaskedSlots: true,
  activeBoardContext: 'home',
  attentionEnabled: true,
  attentionPhrase: DEFAULT_ATTENTION_PHRASE,
  bodyCheckEnabled: true,
}

export const PRESET_CATEGORIES: AacCategory[] = [
  { id: 'core', title: 'Core', emoji: '⭐', order: 0, source: 'preset' },
  { id: 'feelings', title: 'Feelings', emoji: '💛', order: 1, source: 'preset', minStage: 'expanded' },
  { id: 'food', title: 'Food', emoji: '🍎', order: 2, source: 'preset', minStage: 'developing' },
  { id: 'people', title: 'People', emoji: '👥', order: 3, source: 'preset', minStage: 'expanded' },
  { id: 'places', title: 'Places', emoji: '🏠', order: 4, source: 'preset', minStage: 'expanded' },
  { id: 'signs', title: 'ASL Signs', emoji: '✋', order: 5, source: 'preset', minStage: 'expanded' },
  { id: 'needs', title: 'Needs', emoji: '🛟', order: 6, source: 'preset', minStage: 'developing' },
  { id: 'actions', title: 'Actions', emoji: '🏃', order: 7, source: 'preset', minStage: 'expanded' },
  { id: 'family', title: 'Family words', emoji: '📷', order: 8, source: 'preset', minStage: 'developing' },
]

const STAGE_RANK: Record<AacStage, number> = {
  starter: 0,
  developing: 1,
  expanded: 2,
}

export function stageAtLeast(current: AacStage, needed: AacStage) {
  return STAGE_RANK[current] >= STAGE_RANK[needed]
}

function core(
  id: string,
  label: string,
  emoji: string,
  row: number,
  col: number,
  partOfSpeech: AacPartOfSpeech,
  minStage: AacStage,
  speak?: string,
): AacButton {
  return {
    id,
    label,
    emoji,
    categoryId: 'core',
    order: row * AAC_MASTER_COLS + col,
    row,
    col,
    partOfSpeech,
    minStage,
    source: 'preset',
    speak,
  }
}

function fringe(
  id: string,
  label: string,
  emoji: string,
  categoryId: AacCategoryId,
  order: number,
  partOfSpeech: AacPartOfSpeech,
  minStage: AacStage,
  speak?: string,
  boardContext: AacBoardContextId | 'both' = 'both',
): AacButton {
  return {
    id,
    label,
    emoji,
    categoryId,
    order,
    partOfSpeech,
    minStage,
    source: 'preset',
    speak,
    boardContext,
  }
}

function matchesBoardContext(
  btn: AacButton,
  active: AacBoardContextId,
): boolean {
  // Core motor-planning board is always shared
  if (btn.categoryId === 'core') return true
  const ctx = btn.boardContext ?? 'both'
  return ctx === 'both' || ctx === active
}

/**
 * Essential core — permanent (row, col) on a 4×6 master board.
 * Growing the stage only unlocks more cells; coordinates never change.
 *
 * Starter viewport (2×3 top-left): Want, Help / More, All Done / Yes, No
 * Developing adds pronouns + actions in the next columns/rows
 * Expanded fills the full 4×6 + folders
 */
export const PRESET_BUTTONS: AacButton[] = [
  // —— Core board (fixed slots) ——
  // Row 0
  core('want', 'Want', '🤲', 0, 0, 'verb', 'starter'),
  core('help', 'Help', '🤝', 0, 1, 'verb', 'starter'),
  core('i', 'I', '👆', 0, 2, 'pronoun', 'developing'),
  core('you', 'You', '👉', 0, 3, 'pronoun', 'developing'),
  // Row 1
  core('more', 'More', '➕', 1, 0, 'verb', 'starter'),
  core('alldone', 'All Done', '✅', 1, 1, 'social', 'starter', 'all done'),
  core('me', 'Me', '🧒', 1, 2, 'pronoun', 'expanded'),
  core('my', 'My', '📎', 1, 3, 'pronoun', 'expanded'),
  // Row 2
  core('yes', 'Yes', '👍', 2, 0, 'social', 'starter'),
  core('no', 'No', '👎', 2, 1, 'social', 'starter'),
  core('go', 'Go', '➡️', 2, 2, 'verb', 'developing'),
  core('stop', 'Stop', '🛑', 2, 3, 'verb', 'developing'),
  // Row 3
  core('eat', 'Eat', '🍽️', 3, 0, 'verb', 'developing'),
  core('drink', 'Drink', '🥛', 3, 1, 'verb', 'developing'),
  core('play', 'Play', '🧩', 3, 2, 'verb', 'developing'),
  core('bathroom', 'Bathroom', '🚽', 3, 3, 'noun', 'developing'),
  // Row 4 — more verbs + social
  core('need', 'Need', '🆘', 4, 0, 'verb', 'expanded'),
  core('look', 'Look', '👀', 4, 1, 'verb', 'expanded'),
  core('like', 'Like', '💛', 4, 2, 'verb', 'expanded'),
  core('wait', 'Wait', '⏳', 4, 3, 'social', 'expanded'),
  // Row 5 — social + feelings on main
  core('please', 'Please', '🙏', 5, 0, 'social', 'expanded'),
  core('thankyou', 'Thank You', '💜', 5, 1, 'social', 'expanded', 'thank you'),
  core('happy', 'Happy', '😊', 5, 2, 'adjective', 'expanded'),
  core('sad', 'Sad', '😢', 5, 3, 'adjective', 'expanded'),

  // —— Fringe folders (extra descriptors + vocabulary) ——
  fringe('mad', 'Mad', '😠', 'feelings', 0, 'adjective', 'expanded'),
  fringe('scared', 'Scared', '😨', 'feelings', 1, 'adjective', 'expanded'),
  fringe('tired', 'Tired', '😴', 'feelings', 2, 'adjective', 'expanded'),
  fringe('hurt', 'Hurt', '🤕', 'feelings', 3, 'adjective', 'expanded'),
  fringe('good', 'Good', '👍', 'feelings', 4, 'adjective', 'expanded'),
  fringe('bad', 'Bad', '👎', 'feelings', 5, 'adjective', 'expanded'),
  fringe('excited', 'Excited', '🤩', 'feelings', 6, 'adjective', 'expanded'),
  fringe('calm', 'Calm', '😌', 'feelings', 7, 'adjective', 'expanded'),

  fringe('water', 'Water', '💧', 'food', 0, 'noun', 'developing'),
  fringe('snack', 'Snack', '🍎', 'food', 1, 'noun', 'developing'),
  fringe('hungry', 'Hungry', '😋', 'food', 2, 'adjective', 'expanded'),
  fringe('thirsty', 'Thirsty', '🥤', 'food', 3, 'adjective', 'expanded'),

  fringe('mom', 'Mom', '👩', 'people', 0, 'pronoun', 'expanded', undefined, 'home'),
  fringe('dad', 'Dad', '👨', 'people', 1, 'pronoun', 'expanded', undefined, 'home'),
  fringe('grandma', 'Grandma', '👵', 'people', 4, 'pronoun', 'expanded', undefined, 'home'),
  fringe('grandpa', 'Grandpa', '👴', 'people', 5, 'pronoun', 'expanded', undefined, 'home'),
  fringe('pet', 'Pet', '🐶', 'people', 6, 'noun', 'developing', undefined, 'home'),
  fringe('teacher', 'Teacher', '👩‍🏫', 'people', 2, 'pronoun', 'expanded', undefined, 'school'),
  fringe('friend', 'Friend', '🤝', 'people', 3, 'pronoun', 'expanded'),
  fringe('aide', 'Aide', '🧑‍🏫', 'people', 7, 'pronoun', 'expanded', undefined, 'school'),

  fringe('school', 'School', '🏫', 'places', 0, 'noun', 'expanded', undefined, 'school'),
  fringe('park', 'Park', '🌳', 'places', 1, 'noun', 'expanded', undefined, 'home'),
  fringe('outside', 'Outside', '☀️', 'places', 2, 'noun', 'expanded'),
  fringe('car', 'Car', '🚗', 'places', 3, 'noun', 'expanded', undefined, 'home'),
  fringe('bed', 'Bed', '🛏️', 'places', 4, 'noun', 'expanded', undefined, 'home'),
  fringe('class', 'Classroom', '📚', 'places', 5, 'noun', 'expanded', undefined, 'school'),
  fringe('home-place', 'Home', '🏠', 'places', 6, 'noun', 'developing', 'home', 'home'),
  fringe('recess', 'Recess', '⚽', 'places', 7, 'noun', 'expanded', undefined, 'school'),
  fringe('bus', 'Bus', '🚌', 'places', 8, 'noun', 'expanded', undefined, 'school'),

  // Home family words (photo placeholders parents customize)
  fringe('sippy', 'Sippy cup', '🍼', 'family', 0, 'noun', 'developing', 'sippy cup', 'home'),
  fringe('favorite-toy', 'My toy', '🧸', 'family', 1, 'noun', 'developing', 'my toy', 'home'),
  fringe('tablet', 'Tablet', '📱', 'family', 2, 'noun', 'expanded', undefined, 'home'),

  // School supplies / routines
  fringe('backpack', 'Backpack', '🎒', 'family', 3, 'noun', 'expanded', undefined, 'school'),
  fringe('pencil', 'Pencil', '✏️', 'family', 4, 'noun', 'expanded', undefined, 'school'),
  fringe('lunch', 'Lunch', '🍱', 'food', 4, 'noun', 'expanded', undefined, 'school'),
  fringe('recess-play', 'Play outside', '🛝', 'actions', 6, 'verb', 'expanded', 'play outside', 'school'),

  fringe('sign-more', 'More (sign)', '✋', 'signs', 0, 'misc', 'expanded', 'more'),
  fringe('sign-help', 'Help (sign)', '🤝', 'signs', 1, 'misc', 'expanded', 'help'),
  fringe('sign-alldone', 'All done (sign)', '✅', 'signs', 2, 'misc', 'expanded', 'all done'),
  fringe('sign-want', 'Want (sign)', '🤲', 'signs', 3, 'misc', 'expanded', 'want'),

  fringe('break', 'Break', '⏸️', 'needs', 0, 'noun', 'developing'),
  fringe('quiet', 'Quiet', '🤫', 'needs', 1, 'adjective', 'developing'),
  fringe('sick', 'Sick', '🤒', 'needs', 2, 'adjective', 'expanded'),
  fringe('space', 'Space', '🫧', 'needs', 3, 'noun', 'expanded', 'I need space'),
  fringe('hug', 'Hug', '🤗', 'needs', 4, 'verb', 'expanded'),

  fringe('listen', 'Listen', '👂', 'actions', 0, 'verb', 'expanded'),
  fringe('come', 'Come', '🤙', 'actions', 1, 'verb', 'expanded'),
  fringe('sit', 'Sit', '🪑', 'actions', 2, 'verb', 'expanded'),
  fringe('walk', 'Walk', '🚶', 'actions', 3, 'verb', 'expanded'),
  fringe('read', 'Read', '📖', 'actions', 4, 'verb', 'expanded'),
  fringe('music', 'Music', '🎵', 'actions', 5, 'noun', 'expanded'),
]

export function createDefaultAacLibrary(): AacLibrary {
  return {
    categories: PRESET_CATEGORIES.map((c) => ({ ...c })),
    buttons: PRESET_BUTTONS.map((btn) => ({ ...btn })),
    prefs: { ...DEFAULT_AAC_PREFS },
  }
}

/** Apply an age-stage recommendation — unlocks growth without moving slots. */
export function prefsForStage(stage: AacStage, layout?: AacGridLayout): Partial<AacPrefs> {
  const meta = AAC_STAGES.find((s) => s.id === stage) ?? AAC_STAGES[0]
  const gridLayout =
    layout && meta.recommendedLayouts.includes(layout) ? layout : meta.defaultLayout
  return {
    stage,
    ageRange: meta.ageRange,
    gridLayout,
    largeButtons: stage !== 'expanded',
    highContrast: stage === 'starter',
    audioLabels: stage !== 'expanded',
    showFolders: stage !== 'starter',
    messageBar: true,
    colorCoding: true,
    corePinned: true,
    setupComplete: true,
  }
}

export function applyStageToLibrary(library: AacLibrary, stage: AacStage, layout?: AacGridLayout): AacLibrary {
  return {
    ...library,
    prefs: { ...library.prefs, ...prefsForStage(stage, layout) },
  }
}

function normalizePrefs(saved?: Partial<AacPrefs> | null): AacPrefs {
  const merged = { ...DEFAULT_AAC_PREFS, ...(saved || {}) }
  const legacy = saved as Partial<AacPrefs> & { columns?: 2 | 3 | 4 }
  if (!saved?.gridLayout && legacy?.columns) {
    merged.gridLayout = legacy.columns === 2 ? '2x3' : legacy.columns === 4 ? '4x6' : '3x4'
  }
  if (!GRID_LAYOUTS.some((g) => g.id === merged.gridLayout)) {
    merged.gridLayout = DEFAULT_AAC_PREFS.gridLayout
  }
  if (!['starter', 'developing', 'expanded'].includes(merged.stage)) {
    merged.stage = DEFAULT_AAC_PREFS.stage
  }
  if (!['3-4', '5-7', '8-12'].includes(merged.ageRange)) {
    const fromStage = AAC_STAGES.find((s) => s.id === merged.stage)
    merged.ageRange = fromStage?.ageRange ?? '3-4'
  }
  merged.speechPitch = clamp(merged.speechPitch, 0.7, 1.6)
  merged.speechRate = clamp(merged.speechRate, 0.6, 1.2)
  if (![0, 200, 400, 600].includes(merged.touchDelayMs)) merged.touchDelayMs = 0
  if (merged.touchTrigger !== 'release') merged.touchTrigger = 'press'
  if (typeof merged.aboutMeText !== 'string' || !merged.aboutMeText.trim()) {
    merged.aboutMeText = DEFAULT_ABOUT_ME
  }
  if (merged.activeBoardContext !== 'school') merged.activeBoardContext = 'home'
  if (typeof merged.attentionPhrase !== 'string' || !merged.attentionPhrase.trim()) {
    merged.attentionPhrase = DEFAULT_ATTENTION_PHRASE
  }
  if (typeof merged.attentionEnabled !== 'boolean') merged.attentionEnabled = true
  if (typeof merged.bodyCheckEnabled !== 'boolean') merged.bodyCheckEnabled = true
  return merged
}

function clamp(n: number, min: number, max: number) {
  if (typeof n !== 'number' || Number.isNaN(n)) return min
  return Math.min(max, Math.max(min, n))
}

function inferPartOfSpeech(btn: Partial<AacButton>): AacPartOfSpeech {
  if (btn.partOfSpeech) return btn.partOfSpeech
  const cat = btn.categoryId
  if (cat === 'people' || cat === 'core') {
    const id = (btn.id || '').toLowerCase()
    if (['i', 'you', 'me', 'my', 'mom', 'dad', 'teacher', 'friend'].includes(id)) return 'pronoun'
  }
  if (cat === 'feelings') return 'adjective'
  if (cat === 'actions') return 'verb'
  if (cat === 'food' || cat === 'places' || cat === 'needs' || cat === 'family') return 'noun'
  if (['yes', 'no', 'please', 'thankyou', 'alldone', 'wait'].includes((btn.id || '').toLowerCase())) {
    return 'social'
  }
  return 'misc'
}

/** Merge saved library with new presets (adds missing preset buttons/categories). */
export function mergeAacLibrary(saved?: Partial<AacLibrary> | null): AacLibrary {
  const base = createDefaultAacLibrary()
  if (!saved) return base

  const catById = new Map(base.categories.map((c) => [c.id, c]))
  for (const c of saved.categories ?? []) {
    if (!c?.id) continue
    const prev = catById.get(c.id)
    catById.set(c.id, prev ? { ...prev, ...c } : { ...c, source: c.source ?? 'custom' })
  }

  const btnById = new Map(base.buttons.map((b) => [b.id, b]))
  for (const btn of saved.buttons ?? []) {
    if (!btn?.id || !btn.label) continue
    const prev = btnById.get(btn.id)
    const partOfSpeech = inferPartOfSpeech(btn)
    btnById.set(
      btn.id,
      prev
        ? {
            ...prev,
            ...btn,
            // Preset motor-planning slots + category win so growth never relocates words
            ...(prev.source === 'preset'
              ? {
                  categoryId: prev.categoryId,
                  row: prev.row,
                  col: prev.col,
                  order: prev.order,
                  minStage: prev.minStage,
                  partOfSpeech: prev.partOfSpeech,
                }
              : {
                  row: btn.row ?? prev.row,
                  col: btn.col ?? prev.col,
                  minStage: btn.minStage ?? prev.minStage,
                  partOfSpeech: btn.partOfSpeech ?? prev.partOfSpeech ?? partOfSpeech,
                }),
            // Keep family media / labels / mask from save
            label: btn.label || prev.label,
            speak: btn.speak ?? prev.speak,
            emoji: btn.emoji || prev.emoji,
            hidden: btn.hidden ?? prev.hidden,
            masked: btn.masked ?? prev.masked,
            forms: btn.forms ?? prev.forms,
            boardContext:
              prev.source === 'preset'
                ? (prev.boardContext ?? btn.boardContext ?? 'both')
                : (btn.boardContext ?? prev.boardContext ?? 'both'),
            photoDataUrl: btn.photoDataUrl ?? prev.photoDataUrl,
            signPhotoDataUrl: btn.signPhotoDataUrl ?? prev.signPhotoDataUrl,
            audioDataUrl: btn.audioDataUrl ?? prev.audioDataUrl,
          }
        : {
            ...btn,
            emoji: btn.emoji || '💬',
            categoryId: btn.categoryId || 'family',
            order: typeof btn.order === 'number' ? btn.order : 999,
            source: btn.source ?? 'custom',
            partOfSpeech,
            minStage: btn.minStage ?? 'developing',
            boardContext: btn.boardContext ?? 'both',
          },
    )
  }

  return {
    categories: [...catById.values()].sort((a, b) => a.order - b.order),
    buttons: [...btnById.values()].sort(
      (a, b) => a.categoryId.localeCompare(b.categoryId) || a.order - b.order,
    ),
    prefs: normalizePrefs(saved.prefs),
  }
}

export function layoutMeta(layout: AacGridLayout) {
  return GRID_LAYOUTS.find((g) => g.id === layout) ?? GRID_LAYOUTS[1]
}

export function gridColumns(layout: AacGridLayout): number {
  return layoutMeta(layout).columns
}

export function gridRows(layout: AacGridLayout): number {
  return layoutMeta(layout).rows
}

/**
 * Core words unlocked for the current stage, still at permanent coordinates.
 * Masked words are included so their slots stay reserved (progressive vocab).
 */
export function coreButtonsForStage(library: AacLibrary) {
  const stage = library.prefs.stage
  return library.buttons
    .filter(
      (b) =>
        !b.hidden &&
        b.categoryId === 'core' &&
        typeof b.row === 'number' &&
        typeof b.col === 'number' &&
        stageAtLeast(stage, b.minStage ?? 'starter'),
    )
    .sort((a, b) => (a.row! - b.row!) * AAC_MASTER_COLS + (a.col! - b.col!))
}

/** Interactive (unmasked) core buttons in the viewport. */
export function activeCoreButtonsInViewport(library: AacLibrary) {
  return coreButtonsInViewport(library).filter((b) => !b.masked)
}

/** Core cells visible in the active grid viewport (absolute positions). */
export function coreButtonsInViewport(library: AacLibrary) {
  const { columns, rows } = layoutMeta(library.prefs.gridLayout)
  return coreButtonsForStage(library).filter(
    (b) => b.row! < rows && b.col! < columns,
  )
}

export function visibleCategories(library: AacLibrary) {
  const stage = library.prefs.stage
  return library.categories
    .filter((c) => {
      if (c.hidden) return false
      if (c.id === 'core') return true
      if (!library.prefs.showFolders) return false
      return stageAtLeast(stage, c.minStage ?? 'expanded')
    })
    .sort((a, b) => a.order - b.order)
}

export function fringeCategories(library: AacLibrary) {
  return visibleCategories(library).filter((c) => c.id !== 'core')
}

export function buttonsForCategory(library: AacLibrary, categoryId: string) {
  const stage = library.prefs.stage
  const ctx = library.prefs.activeBoardContext
  return library.buttons
    .filter(
      (b) =>
        !b.hidden &&
        !b.masked &&
        b.categoryId === categoryId &&
        stageAtLeast(stage, b.minStage ?? 'starter') &&
        matchesBoardContext(b, ctx),
    )
    .sort((a, b) => a.order - b.order)
}

/** Editor list: includes masked words so SLPs can unmask without shifting slots. */
export function buttonsForCategoryEditor(library: AacLibrary, categoryId: string) {
  const stage = library.prefs.stage
  const ctx = library.prefs.activeBoardContext
  return library.buttons
    .filter(
      (b) =>
        !b.hidden &&
        b.categoryId === categoryId &&
        stageAtLeast(stage, b.minStage ?? 'starter') &&
        // Editor shows active context + both; core always
        matchesBoardContext(b, ctx),
    )
    .sort((a, b) => a.order - b.order)
}

export function resolveAacVisual(
  button: AacButton,
  mode: AacDisplayMode,
): { kind: 'photo' | 'sign' | 'emoji'; src?: string; emoji: string } {
  if (mode === 'photo' && button.photoDataUrl) return { kind: 'photo', src: button.photoDataUrl, emoji: button.emoji }
  if (mode === 'sign' && button.signPhotoDataUrl)
    return { kind: 'sign', src: button.signPhotoDataUrl, emoji: button.emoji }
  if (mode === 'emoji') return { kind: 'emoji', emoji: button.emoji }
  if (button.photoDataUrl) return { kind: 'photo', src: button.photoDataUrl, emoji: button.emoji }
  if (button.signPhotoDataUrl) return { kind: 'sign', src: button.signPhotoDataUrl, emoji: button.emoji }
  return { kind: 'emoji', emoji: button.emoji }
}
