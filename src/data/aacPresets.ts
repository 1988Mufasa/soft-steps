/**
 * Soft Steps AAC — age-adaptive board with fixed motor-planning slots.
 * Words never move when a child grows from starter → developing → expanded.
 * Soft Steps never rearranges by tap frequency.
 */

import {
  mulberryUrl,
  resolveMulberryFileSync,
} from './mulberrySymbols'
import mulberryLookup from './mulberry-lookup.json'

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

export type AacDisplayMode = 'photo' | 'sign' | 'emoji' | 'mulberry' | 'auto'

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
  /** Mulberry Symbols SVG filename under /symbols/mulberry/ */
  mulberryFile?: string
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

/** Board lighting for light sensitivity — Calm Light (default) or Sensory Dark */
export type AacSensoryTheme = 'calm-light' | 'sensory-dark'

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
  /**
   * Anti-stimming: ignore repeat taps on the *same* tile within this window.
   * Different tiles stay instant. 0 = Off.
   */
  repeatCooldownMs: 0 | 1000 | 1500 | 2000 | 3000
  buttonAnimations: boolean
  tapSounds: boolean
  speechPitch: number
  speechRate: number
  aboutMeEnabled: boolean
  aboutMeText: string
  /** Show Classroom Quick-Talk strip when a temporary lesson strip is loaded */
  quickTalkEnabled: boolean
  /**
   * Show collapsible First–Then schedule bar on Talk.
   * Default off so the board stays uncluttered until parents enable it.
   */
  firstThenBarEnabled: boolean
  /** Louder classroom TTS / clips (overrides soft-audio quieting for AAC) */
  classroomVolumeBoost: boolean
  /** Strong, longer highlight so teachers can see the active word across the table */
  strongTapHighlight: boolean
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
  /**
   * Sensory theme for the Talk board, sentence strip, and First–Then bar.
   * Persisted with AAC prefs in local storage.
   */
  sensoryTheme: AacSensoryTheme
  /**
   * After tapping a word inside a category folder, return to the core board.
   * Helps kids build multi-word sentences (I + want + [folder word]).
   */
  autoReturnFromFolder: boolean
  /** Show recent + saved phrases strip under the sentence bar */
  phrasesBarEnabled: boolean
  /** Show Scripts folder alongside category folders */
  scriptsFolderEnabled: boolean
  /** Highlight a partner-chosen modeling path on core tiles */
  partnerModelEnabled: boolean
  /** Dwell/hover activation (0 = off). Helps with tremor. */
  dwellMs: 0 | 500 | 800 | 1200
  /** 1-switch row/column scanning for motor access */
  scanningEnabled: boolean
  scanningSpeedMs: 800 | 1200 | 1800
  /** Caregiver battery + offline status chip */
  showDeviceStatus: boolean
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

/** Temporary classroom fringe — never merges into permanent buttons. */
export type AacQuickTalkWord = {
  id: string
  label: string
  emoji: string
  speak?: string
}

export type AacQuickTalkStrip = {
  title: string
  words: AacQuickTalkWord[]
}

/** One slot on the AAC First–Then schedule bar (offline, board-local). */
export type AacFirstThenSlot = {
  label: string
  emoji: string
  photoDataUrl?: string
  /** Optional link to an AAC button id */
  buttonId?: string
}

export type AacFirstThenBoard = {
  first: AacFirstThenSlot | null
  then: AacFirstThenSlot | null
  /** Child/adult marked FIRST complete — card turns green with check */
  firstComplete: boolean
}

export const DEFAULT_FIRST_THEN: AacFirstThenBoard = {
  first: { label: 'Clean Up', emoji: '🧹' },
  then: { label: 'Snack', emoji: '🍎' },
  firstComplete: false,
}

export type AacLibrary = {
  categories: AacCategory[]
  buttons: AacButton[]
  prefs: AacPrefs
  /** Today’s lesson strip — clear anytime without touching home vocabulary */
  quickTalk: AacQuickTalkStrip | null
  /** Dedicated First–Then slots for Talk (independent of routines) */
  firstThen: AacFirstThenBoard
  /** Grown-up saved phrases for one-tap re-speak */
  savedPhrases: import('./aacExtras').AacSavedPhrase[]
  /** Recent spoken sentences (local only, newest first) */
  recentPhrases: import('./aacExtras').AacSavedPhrase[]
  /** Custom social scripts (plus built-in presets in UI) */
  customScripts: import('./aacExtras').AacScript[]
  /** SLP session notes — on-device only */
  sessionNotes: import('./aacExtras').AacSessionNote[]
  /** Ordered core/fringe button ids for partner modeling path */
  partnerModelPath: string[]
  /** Voice-bank recordings keyed by button id (data URLs) */
  voiceBank: Record<string, string>
}

/** Soft pastel Fitzgerald Key fills — dense AAC board look (Weave-inspired, not a copy). */
export const FITZGERALD_COLORS: Record<
  AacPartOfSpeech,
  { bg: string; border: string; label: string }
> = {
  pronoun: { bg: '#D4EDDA', border: '#8BC99A', label: 'Pronouns (soft green)' },
  verb: { bg: '#B7E0B8', border: '#6BB66E', label: 'Verbs / actions (green)' },
  noun: { bg: '#FFE8A3', border: '#E6C35C', label: 'Nouns / categories (yellow)' },
  adjective: { bg: '#C5D9F0', border: '#7FA8D4', label: 'Feelings / descriptors (blue)' },
  social: { bg: '#F5C6D0', border: '#E08A9E', label: 'Social / yes–no (pink)' },
  misc: { bg: '#EEF1F4', border: '#B0B8C0', label: 'Other' },
}

/** Vibrant Fitzgerald borders on dark slate fills for Sensory Dark Mode */
export const FITZGERALD_DARK: Record<AacPartOfSpeech, { bg: string; border: string }> = {
  pronoun: { bg: '#242730', border: '#FFD54F' },
  verb: { bg: '#242730', border: '#66BB6A' },
  noun: { bg: '#242730', border: '#FFA726' },
  adjective: { bg: '#242730', border: '#42A5F5' },
  social: { bg: '#242730', border: '#CE93D8' },
  misc: { bg: '#242730', border: '#90A4AE' },
}

/** Inline Fitzgerald styles for tiles / sentence chips by sensory theme */
export function fitzgeraldTileStyle(
  partOfSpeech: AacPartOfSpeech,
  theme: AacSensoryTheme = 'calm-light',
): { background: string; borderColor: string; color?: string } {
  if (theme === 'sensory-dark') {
    const d = FITZGERALD_DARK[partOfSpeech]
    return { background: d.bg, borderColor: d.border, color: '#FFFFFF' }
  }
  const c = FITZGERALD_COLORS[partOfSpeech]
  return { background: c.bg, borderColor: c.border }
}

export const AAC_SENSORY_THEMES: {
  id: AacSensoryTheme
  label: string
  blurb: string
}[] = [
  {
    id: 'calm-light',
    label: 'Calm Light Mode',
    blurb: 'Soft warm off-white board with crisp Fitzgerald Key tiles.',
  },
  {
    id: 'sensory-dark',
    label: 'Sensory Dark Mode',
    blurb: 'Deep charcoal board, slate tiles, bright text — easier on light-sensitive eyes.',
  },
]

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
  repeatCooldownMs: 0,
  buttonAnimations: true,
  tapSounds: false,
  speechPitch: 1.2,
  speechRate: 0.92,
  aboutMeEnabled: true,
  aboutMeText: DEFAULT_ABOUT_ME,
  quickTalkEnabled: true,
  firstThenBarEnabled: false,
  classroomVolumeBoost: false,
  strongTapHighlight: true,
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
  sensoryTheme: 'calm-light',
  autoReturnFromFolder: true,
  phrasesBarEnabled: true,
  scriptsFolderEnabled: true,
  partnerModelEnabled: false,
  dwellMs: 0,
  scanningEnabled: false,
  scanningSpeedMs: 1200,
  showDeviceStatus: true,
}

export const REPEAT_COOLDOWN_OPTIONS: { ms: AacPrefs['repeatCooldownMs']; label: string }[] = [
  { ms: 0, label: 'Off' },
  { ms: 1000, label: '1 second' },
  { ms: 1500, label: '1.5 seconds' },
  { ms: 2000, label: '2 seconds' },
  { ms: 3000, label: '3 seconds' },
]

export const PRESET_CATEGORIES: AacCategory[] = [
  { id: 'core', title: 'Core', emoji: '⭐', order: 0, source: 'preset' },
  { id: 'food', title: 'Food & Drink', emoji: '🍎', order: 1, source: 'preset', minStage: 'developing' },
  { id: 'family', title: 'Toys & Play', emoji: '🧸', order: 2, source: 'preset', minStage: 'developing' },
  { id: 'places', title: 'Places', emoji: '🏠', order: 3, source: 'preset', minStage: 'expanded' },
  { id: 'needs', title: 'Body & Pain', emoji: '🩹', order: 4, source: 'preset', minStage: 'developing' },
  { id: 'feelings', title: 'Feelings', emoji: '💛', order: 5, source: 'preset', minStage: 'expanded' },
  { id: 'people', title: 'People', emoji: '👥', order: 6, source: 'preset', minStage: 'expanded' },
  { id: 'actions', title: 'Actions', emoji: '🏃', order: 7, source: 'preset', minStage: 'expanded' },
  { id: 'signs', title: 'ASL Signs', emoji: '✋', order: 8, source: 'preset', minStage: 'expanded' },
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
  fringe('juice', 'Juice', '🧃', 'food', 5, 'noun', 'developing'),
  fringe('milk', 'Milk', '🥛', 'food', 6, 'noun', 'developing'),
  fringe('apple', 'Apple', '🍎', 'food', 7, 'noun', 'developing'),

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
  fringe('ball', 'Ball', '⚽', 'family', 5, 'noun', 'developing'),
  fringe('blocks', 'Blocks', '🧱', 'family', 6, 'noun', 'developing'),
  fringe('book-play', 'Book', '📚', 'family', 7, 'noun', 'developing', 'book'),

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
  fringe('ouch', 'Ouch', '😣', 'needs', 5, 'adjective', 'developing', 'ouch it hurts'),
  fringe('tummy', 'Tummy', '🤢', 'needs', 6, 'noun', 'developing', 'my tummy'),
  fringe('head', 'Head', '🤕', 'needs', 7, 'noun', 'developing', 'my head'),

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
    buttons: withMulberryDefaults(PRESET_BUTTONS.map((btn) => ({ ...btn }))),
    prefs: { ...DEFAULT_AAC_PREFS },
    quickTalk: null,
    firstThen: {
      ...DEFAULT_FIRST_THEN,
      first: { ...DEFAULT_FIRST_THEN.first! },
      then: { ...DEFAULT_FIRST_THEN.then! },
    },
    savedPhrases: [],
    recentPhrases: [],
    customScripts: [],
    sessionNotes: [],
    partnerModelPath: ['i', 'want'],
    voiceBank: {},
  }
}

function normalizeFirstThenSlot(raw: unknown): AacFirstThenSlot | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as Partial<AacFirstThenSlot>
  if (typeof s.label !== 'string' || !s.label.trim()) return null
  return {
    label: s.label.trim().slice(0, 40),
    emoji: (typeof s.emoji === 'string' && s.emoji ? s.emoji : '💬').slice(0, 8),
    photoDataUrl: typeof s.photoDataUrl === 'string' ? s.photoDataUrl : undefined,
    buttonId: typeof s.buttonId === 'string' ? s.buttonId : undefined,
  }
}

function normalizeFirstThen(saved?: Partial<AacFirstThenBoard> | null): AacFirstThenBoard {
  if (!saved) {
    return {
      first: DEFAULT_FIRST_THEN.first ? { ...DEFAULT_FIRST_THEN.first } : null,
      then: DEFAULT_FIRST_THEN.then ? { ...DEFAULT_FIRST_THEN.then } : null,
      firstComplete: false,
    }
  }
  return {
    first: normalizeFirstThenSlot(saved.first),
    then: normalizeFirstThenSlot(saved.then),
    firstComplete: Boolean(saved.firstComplete),
  }
}

function normalizeQuickTalk(saved?: AacQuickTalkStrip | null): AacQuickTalkStrip | null {
  if (!saved || !Array.isArray(saved.words) || !saved.words.length) return null
  const words = saved.words
    .filter((w) => w && typeof w.label === 'string' && w.label.trim())
    .slice(0, 12)
    .map((w, i) => ({
      id: typeof w.id === 'string' && w.id ? w.id : `qt-${i}-${w.label}`,
      label: w.label.trim().slice(0, 32),
      emoji: (w.emoji || '💬').slice(0, 8),
      speak: typeof w.speak === 'string' ? w.speak : undefined,
    }))
  if (!words.length) return null
  return {
    title: (saved.title || 'Today’s words').trim().slice(0, 48),
    words,
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
  if (![0, 1000, 1500, 2000, 3000].includes(merged.repeatCooldownMs)) {
    merged.repeatCooldownMs = 0
  }
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
  if (typeof merged.quickTalkEnabled !== 'boolean') merged.quickTalkEnabled = true
  if (typeof merged.firstThenBarEnabled !== 'boolean') merged.firstThenBarEnabled = false
  if (typeof merged.classroomVolumeBoost !== 'boolean') merged.classroomVolumeBoost = false
  if (typeof merged.strongTapHighlight !== 'boolean') merged.strongTapHighlight = true
  if (merged.sensoryTheme !== 'sensory-dark') merged.sensoryTheme = 'calm-light'
  if (typeof merged.autoReturnFromFolder !== 'boolean') merged.autoReturnFromFolder = true
  if (typeof merged.phrasesBarEnabled !== 'boolean') merged.phrasesBarEnabled = true
  if (typeof merged.scriptsFolderEnabled !== 'boolean') merged.scriptsFolderEnabled = true
  if (typeof merged.partnerModelEnabled !== 'boolean') merged.partnerModelEnabled = false
  if (![0, 500, 800, 1200].includes(merged.dwellMs)) merged.dwellMs = 0
  if (typeof merged.scanningEnabled !== 'boolean') merged.scanningEnabled = false
  if (![800, 1200, 1800].includes(merged.scanningSpeedMs)) merged.scanningSpeedMs = 1200
  if (typeof merged.showDeviceStatus !== 'boolean') merged.showDeviceStatus = true
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
    if (!prev) {
      catById.set(c.id, { ...c, source: c.source ?? 'custom' })
      continue
    }
    // Refresh preset folder titles/emoji; keep custom hide flags from save
    catById.set(c.id, {
      ...prev,
      ...c,
      ...(prev.source === 'preset'
        ? {
            title: prev.title,
            emoji: prev.emoji,
            order: prev.order,
            minStage: prev.minStage,
            source: 'preset' as const,
          }
        : {}),
      hidden: c.hidden ?? prev.hidden,
    })
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
            mulberryFile: btn.mulberryFile ?? prev.mulberryFile,
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

  const baseExtras = createDefaultAacLibrary()
  return {
    categories: [...catById.values()].sort((a, b) => a.order - b.order),
    buttons: withMulberryDefaults(
      [...btnById.values()].sort(
        (a, b) => a.categoryId.localeCompare(b.categoryId) || a.order - b.order,
      ),
    ),
    prefs: normalizePrefs(saved.prefs),
    quickTalk: normalizeQuickTalk(saved.quickTalk),
    firstThen: normalizeFirstThen(saved.firstThen),
    savedPhrases: Array.isArray(saved.savedPhrases) ? saved.savedPhrases : baseExtras.savedPhrases,
    recentPhrases: Array.isArray(saved.recentPhrases) ? saved.recentPhrases : baseExtras.recentPhrases,
    customScripts: Array.isArray(saved.customScripts) ? saved.customScripts : baseExtras.customScripts,
    sessionNotes: Array.isArray(saved.sessionNotes) ? saved.sessionNotes : baseExtras.sessionNotes,
    partnerModelPath: Array.isArray(saved.partnerModelPath)
      ? saved.partnerModelPath.filter((x): x is string => typeof x === 'string')
      : baseExtras.partnerModelPath,
    voiceBank:
      saved.voiceBank && typeof saved.voiceBank === 'object' ? { ...saved.voiceBank } : {},
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

function mulberrySrcFor(button: AacButton): string | undefined {
  const file =
    button.mulberryFile ||
    resolveMulberryFileSync(button.label, mulberryLookup.byKey) ||
    resolveMulberryFileSync(button.speak || '', mulberryLookup.byKey)
  return file ? mulberryUrl(file) : undefined
}

export function resolveAacVisual(
  button: AacButton,
  mode: AacDisplayMode,
): { kind: 'photo' | 'sign' | 'emoji' | 'mulberry'; src?: string; emoji: string } {
  if (mode === 'photo' && button.photoDataUrl) return { kind: 'photo', src: button.photoDataUrl, emoji: button.emoji }
  if (mode === 'sign' && button.signPhotoDataUrl)
    return { kind: 'sign', src: button.signPhotoDataUrl, emoji: button.emoji }
  if (mode === 'mulberry') {
    const src = mulberrySrcFor(button)
    if (src) return { kind: 'mulberry', src, emoji: button.emoji }
    return { kind: 'emoji', emoji: button.emoji }
  }
  if (mode === 'emoji') return { kind: 'emoji', emoji: button.emoji }
  // auto: parent photo → Mulberry → sign → emoji
  if (button.photoDataUrl) return { kind: 'photo', src: button.photoDataUrl, emoji: button.emoji }
  const mulberry = mulberrySrcFor(button)
  if (mulberry) return { kind: 'mulberry', src: mulberry, emoji: button.emoji }
  if (button.signPhotoDataUrl) return { kind: 'sign', src: button.signPhotoDataUrl, emoji: button.emoji }
  return { kind: 'emoji', emoji: button.emoji }
}

/** Attach Mulberry filenames onto buttons that still lack an explicit assignment. */
export function withMulberryDefaults(buttons: AacButton[]): AacButton[] {
  return buttons.map((b) => {
    if (b.mulberryFile) return b
    const file =
      resolveMulberryFileSync(b.label, mulberryLookup.byKey) ||
      resolveMulberryFileSync(b.speak || '', mulberryLookup.byKey)
    return file ? { ...b, mulberryFile: file } : b
  })
}
