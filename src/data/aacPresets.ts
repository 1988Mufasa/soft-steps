/**
 * Soft Steps AAC — basic vocabulary presets for non-verbal communicators.
 * Grown-ups can hide, edit, and add photos / sign images / voice clips on top.
 *
 * Motor planning: button order is fixed by `order` only — never by tap frequency.
 */

/** Fitzgerald Key–style part of speech for color coding */
export type AacPartOfSpeech =
  | 'pronoun' // yellow — people / pronouns
  | 'verb' // green — actions
  | 'noun' // orange — things / places / foods
  | 'adjective' // blue — feelings / descriptors
  | 'social' // pink — social / polite
  | 'misc' // neutral — function / other

export type AacCategoryId =
  | 'core'
  | 'feelings'
  | 'needs'
  | 'people'
  | 'food'
  | 'actions'
  | 'places'
  | 'family'

export type AacDisplayMode = 'photo' | 'sign' | 'emoji' | 'auto'

/** Grid density for ages 3 → growing skills */
export type AacGridLayout = '2x2' | '2x3' | '3x3' | '3x4' | '4x4' | '4x6'

export type AacTouchTrigger = 'press' | 'release'

export type AacButton = {
  id: string
  label: string
  /** Spoken aloud (defaults to label) */
  speak?: string
  emoji: string
  categoryId: AacCategoryId | string
  partOfSpeech: AacPartOfSpeech
  /** Custom photo chosen by family / therapist / educator */
  photoDataUrl?: string
  /** Sign-language photo / still chosen by grown-ups */
  signPhotoDataUrl?: string
  /** Custom recorded voice clip (on-device) */
  audioDataUrl?: string
  hidden?: boolean
  /** Lower sorts first within a category — fixed slots for muscle memory */
  order: number
  /** Built-in preset vs family-added */
  source: 'preset' | 'custom'
}

export type AacCategory = {
  id: AacCategoryId | string
  title: string
  emoji: string
  order: number
  hidden?: boolean
  source: 'preset' | 'custom'
}

export type AacPrefs = {
  /** Adjustable grid density */
  gridLayout: AacGridLayout
  /** Prefer which visual when several exist */
  displayMode: AacDisplayMode
  showLabels: boolean
  /** Speak immediately on each successful activation */
  speakOnTap: boolean
  /** Sentence strip / message window */
  messageBar: boolean
  largeButtons: boolean
  /** Keep high-frequency core words pinned above fringe folders */
  corePinned: boolean
  /** Fitzgerald Key color coding */
  colorCoding: boolean
  /** Touch delay (ms) before a press counts — reduces accidental double-taps */
  touchDelayMs: 0 | 200 | 400 | 600
  /** Speak on finger down vs finger up */
  touchTrigger: AacTouchTrigger
  /** Soft visual feedback on tap */
  buttonAnimations: boolean
  /** Soft click/pop when activating a word */
  tapSounds: boolean
  /** On-device TTS pitch override (0.7–1.6) */
  speechPitch: number
  /** On-device TTS rate override (0.6–1.2) */
  speechRate: number
  /** Always-visible emergency / About Me button */
  aboutMeEnabled: boolean
  aboutMeText: string
}

export type AacLibrary = {
  categories: AacCategory[]
  buttons: AacButton[]
  prefs: AacPrefs
}

export const FITZGERALD_COLORS: Record<
  AacPartOfSpeech,
  { bg: string; border: string; label: string }
> = {
  pronoun: { bg: '#FFF3B0', border: '#E6C200', label: 'People / pronouns' },
  verb: { bg: '#C8E6C9', border: '#43A047', label: 'Actions / verbs' },
  noun: { bg: '#FFE0B2', border: '#FB8C00', label: 'Things / nouns' },
  adjective: { bg: '#BBDEFB', border: '#1E88E5', label: 'Feelings / adjectives' },
  social: { bg: '#F8BBD0', border: '#EC407A', label: 'Social' },
  misc: { bg: '#F5F5F5', border: '#9E9E9E', label: 'Other' },
}

export const GRID_LAYOUTS: {
  id: AacGridLayout
  label: string
  columns: number
  hint: string
}[] = [
  { id: '2x2', label: '2×2', columns: 2, hint: 'Biggest buttons · ages ~3' },
  { id: '2x3', label: '2×3', columns: 2, hint: 'Large · early AAC' },
  { id: '3x3', label: '3×3', columns: 3, hint: 'Balanced default' },
  { id: '3x4', label: '3×4', columns: 3, hint: 'More words' },
  { id: '4x4', label: '4×4', columns: 4, hint: 'Denser' },
  { id: '4x6', label: '4×6', columns: 4, hint: 'Most words · growing skills' },
]

export const DEFAULT_ABOUT_ME =
  'Hi. I am autistic and non-verbal. I use this device to talk. Please be patient and call my parent.'

export const DEFAULT_AAC_PREFS: AacPrefs = {
  gridLayout: '3x3',
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
}

export const PRESET_CATEGORIES: AacCategory[] = [
  { id: 'core', title: 'Core', emoji: '⭐', order: 0, source: 'preset' },
  { id: 'feelings', title: 'Feelings', emoji: '💛', order: 1, source: 'preset' },
  { id: 'needs', title: 'Needs', emoji: '🛟', order: 2, source: 'preset' },
  { id: 'people', title: 'People', emoji: '👥', order: 3, source: 'preset' },
  { id: 'food', title: 'Food & drink', emoji: '🍎', order: 4, source: 'preset' },
  { id: 'actions', title: 'Actions', emoji: '🏃', order: 5, source: 'preset' },
  { id: 'places', title: 'Places', emoji: '🏠', order: 6, source: 'preset' },
  { id: 'family', title: 'Family words', emoji: '📷', order: 7, source: 'preset' },
]

function b(
  id: string,
  label: string,
  emoji: string,
  categoryId: AacCategoryId,
  order: number,
  partOfSpeech: AacPartOfSpeech,
  speak?: string,
): AacButton {
  return { id, label, emoji, categoryId, order, source: 'preset', partOfSpeech, speak }
}

/**
 * Core = high-frequency words always reachable without digging through folders.
 * Fringe (other categories) = specific snacks, toys, places, people names, etc.
 * Order within each category is fixed for motor planning / muscle memory.
 */
export const PRESET_BUTTONS: AacButton[] = [
  // Core — always accessible
  b('i', 'I', '👆', 'core', 0, 'pronoun'),
  b('you', 'You', '👉', 'core', 1, 'pronoun'),
  b('yes', 'Yes', '👍', 'core', 2, 'misc'),
  b('no', 'No', '👎', 'core', 3, 'misc'),
  b('want', 'Want', '🤲', 'core', 4, 'verb', 'want'),
  b('help', 'Help', '🤝', 'core', 5, 'verb'),
  b('more', 'More', '➕', 'core', 6, 'misc'),
  b('stop', 'Stop', '🛑', 'core', 7, 'verb'),
  b('go', 'Go', '➡️', 'core', 8, 'verb'),
  b('alldone', 'All done', '✅', 'core', 9, 'misc', 'all done'),
  b('wait', 'Wait', '⏳', 'core', 10, 'verb'),
  b('please', 'Please', '🙏', 'core', 11, 'social'),
  // Feelings (fringe / adjectives)
  b('happy', 'Happy', '😊', 'feelings', 0, 'adjective'),
  b('sad', 'Sad', '😢', 'feelings', 1, 'adjective'),
  b('mad', 'Mad', '😠', 'feelings', 2, 'adjective'),
  b('scared', 'Scared', '😨', 'feelings', 3, 'adjective'),
  b('tired', 'Tired', '😴', 'feelings', 4, 'adjective'),
  b('okay', 'Okay', '🙂', 'feelings', 5, 'adjective'),
  b('excited', 'Excited', '🤩', 'feelings', 6, 'adjective'),
  b('calm', 'Calm', '😌', 'feelings', 7, 'adjective'),
  // Needs
  b('bathroom', 'Bathroom', '🚽', 'needs', 0, 'noun'),
  b('break', 'Break', '⏸️', 'needs', 1, 'noun'),
  b('quiet', 'Quiet', '🤫', 'needs', 2, 'adjective'),
  b('hurt', 'I hurt', '🤕', 'needs', 3, 'adjective', 'I hurt'),
  b('sick', 'Sick', '🤒', 'needs', 4, 'adjective'),
  b('space', 'Space', '🫧', 'needs', 5, 'noun', 'I need space'),
  b('hug', 'Hug', '🤗', 'needs', 6, 'verb'),
  b('home-need', 'Home', '🏠', 'needs', 7, 'noun', 'I want to go home'),
  // People (fringe names / roles — I/You stay on core)
  b('mom', 'Mom', '👩', 'people', 0, 'pronoun'),
  b('dad', 'Dad', '👨', 'people', 1, 'pronoun'),
  b('teacher', 'Teacher', '👩‍🏫', 'people', 2, 'pronoun'),
  b('friend', 'Friend', '🤝', 'people', 3, 'pronoun'),
  b('me', 'Me', '🧒', 'people', 4, 'pronoun'),
  // Food
  b('eat', 'Eat', '🍽️', 'food', 0, 'verb'),
  b('drink', 'Drink', '🥛', 'food', 1, 'verb'),
  b('water', 'Water', '💧', 'food', 2, 'noun'),
  b('snack', 'Snack', '🍎', 'food', 3, 'noun'),
  b('hungry', 'Hungry', '😋', 'food', 4, 'adjective'),
  b('thirsty', 'Thirsty', '🥤', 'food', 5, 'adjective'),
  // Actions
  b('play', 'Play', '🧩', 'actions', 0, 'verb'),
  b('look', 'Look', '👀', 'actions', 1, 'verb'),
  b('listen', 'Listen', '👂', 'actions', 2, 'verb'),
  b('come', 'Come', '🤙', 'actions', 3, 'verb'),
  b('sit', 'Sit', '🪑', 'actions', 4, 'verb'),
  b('walk', 'Walk', '🚶', 'actions', 5, 'verb'),
  b('read', 'Read', '📖', 'actions', 6, 'verb'),
  b('music', 'Music', '🎵', 'actions', 7, 'noun'),
  // Places
  b('school', 'School', '🏫', 'places', 0, 'noun'),
  b('park', 'Park', '🌳', 'places', 1, 'noun'),
  b('outside', 'Outside', '☀️', 'places', 2, 'noun'),
  b('car', 'Car', '🚗', 'places', 3, 'noun'),
  b('bed', 'Bed', '🛏️', 'places', 4, 'noun'),
  b('class', 'Classroom', '📚', 'places', 5, 'noun'),
]

export function createDefaultAacLibrary(): AacLibrary {
  return {
    categories: PRESET_CATEGORIES.map((c) => ({ ...c })),
    buttons: PRESET_BUTTONS.map((btn) => ({ ...btn })),
    prefs: { ...DEFAULT_AAC_PREFS },
  }
}

function normalizePrefs(saved?: Partial<AacPrefs> | null): AacPrefs {
  const merged = { ...DEFAULT_AAC_PREFS, ...(saved || {}) }
  // Migrate legacy `columns` if present on old saves
  const legacy = saved as Partial<AacPrefs> & { columns?: 2 | 3 | 4 }
  if (!saved?.gridLayout && legacy?.columns) {
    merged.gridLayout = legacy.columns === 2 ? '2x3' : legacy.columns === 4 ? '4x4' : '3x3'
  }
  if (!GRID_LAYOUTS.some((g) => g.id === merged.gridLayout)) {
    merged.gridLayout = DEFAULT_AAC_PREFS.gridLayout
  }
  merged.speechPitch = clamp(merged.speechPitch, 0.7, 1.6)
  merged.speechRate = clamp(merged.speechRate, 0.6, 1.2)
  if (![0, 200, 400, 600].includes(merged.touchDelayMs)) merged.touchDelayMs = 0
  if (merged.touchTrigger !== 'release') merged.touchTrigger = 'press'
  if (typeof merged.aboutMeText !== 'string' || !merged.aboutMeText.trim()) {
    merged.aboutMeText = DEFAULT_ABOUT_ME
  }
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
    if (['i', 'you', 'me', 'mom', 'dad', 'teacher', 'friend'].includes(id)) return 'pronoun'
  }
  if (cat === 'feelings') return 'adjective'
  if (cat === 'actions') return 'verb'
  if (cat === 'food' || cat === 'places' || cat === 'needs' || cat === 'family') return 'noun'
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
            partOfSpeech: btn.partOfSpeech ?? prev.partOfSpeech ?? partOfSpeech,
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
          },
    )
  }

  return {
    categories: [...catById.values()].sort((a, b) => a.order - b.order),
    // Fixed order only — never frequency / recency
    buttons: [...btnById.values()].sort(
      (a, b) => a.categoryId.localeCompare(b.categoryId) || a.order - b.order,
    ),
    prefs: normalizePrefs(saved.prefs),
  }
}

export function visibleCategories(library: AacLibrary) {
  return library.categories.filter((c) => !c.hidden).sort((a, b) => a.order - b.order)
}

export function fringeCategories(library: AacLibrary) {
  return visibleCategories(library).filter((c) => c.id !== 'core')
}

/** Buttons in a category — sorted by fixed `order` only (motor planning). */
export function buttonsForCategory(library: AacLibrary, categoryId: string) {
  return library.buttons
    .filter((b) => !b.hidden && b.categoryId === categoryId)
    .sort((a, b) => a.order - b.order)
}

export function gridColumns(layout: AacGridLayout): number {
  return GRID_LAYOUTS.find((g) => g.id === layout)?.columns ?? 3
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
