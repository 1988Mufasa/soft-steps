/**
 * Soft Steps AAC — basic vocabulary presets for non-verbal communicators.
 * Grown-ups can hide, edit, and add photos / sign images on top of these.
 */

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

export type AacButton = {
  id: string
  label: string
  /** Spoken aloud (defaults to label) */
  speak?: string
  emoji: string
  categoryId: AacCategoryId | string
  /** Custom photo chosen by family / therapist / educator */
  photoDataUrl?: string
  /** Sign-language photo / still chosen by grown-ups */
  signPhotoDataUrl?: string
  hidden?: boolean
  /** Lower sorts first within a category */
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
  /** Grid columns on the kid board */
  columns: 2 | 3 | 4
  /** Prefer which visual when several exist */
  displayMode: AacDisplayMode
  showLabels: boolean
  /** Speak immediately on each tap */
  speakOnTap: boolean
  /** Keep building a sentence strip */
  messageBar: boolean
  largeButtons: boolean
}

export type AacLibrary = {
  categories: AacCategory[]
  buttons: AacButton[]
  prefs: AacPrefs
}

export const DEFAULT_AAC_PREFS: AacPrefs = {
  columns: 3,
  displayMode: 'auto',
  showLabels: true,
  speakOnTap: true,
  messageBar: true,
  largeButtons: true,
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
  speak?: string,
): AacButton {
  return { id, label, emoji, categoryId, order, source: 'preset', speak }
}

/** Core + everyday vocabulary — always available offline. */
export const PRESET_BUTTONS: AacButton[] = [
  // Core
  b('yes', 'Yes', '👍', 'core', 0),
  b('no', 'No', '👎', 'core', 1),
  b('want', 'I want', '🤲', 'core', 2, 'I want'),
  b('help', 'Help', '🤝', 'core', 3),
  b('more', 'More', '➕', 'core', 4),
  b('stop', 'Stop', '🛑', 'core', 5),
  b('go', 'Go', '➡️', 'core', 6),
  b('wait', 'Wait', '⏳', 'core', 7),
  b('alldone', 'All done', '✅', 'core', 8),
  b('please', 'Please', '🙏', 'core', 9),
  b('thankyou', 'Thank you', '💛', 'core', 10),
  b('dontknow', "I don't know", '🤷', 'core', 11, "I don't know"),
  // Feelings
  b('happy', 'Happy', '😊', 'feelings', 0),
  b('sad', 'Sad', '😢', 'feelings', 1),
  b('mad', 'Mad', '😠', 'feelings', 2),
  b('scared', 'Scared', '😨', 'feelings', 3),
  b('tired', 'Tired', '😴', 'feelings', 4),
  b('okay', 'Okay', '🙂', 'feelings', 5),
  b('excited', 'Excited', '🤩', 'feelings', 6),
  b('calm', 'Calm', '😌', 'feelings', 7),
  // Needs
  b('bathroom', 'Bathroom', '🚽', 'needs', 0),
  b('break', 'Break', '⏸️', 'needs', 1),
  b('quiet', 'Quiet', '🤫', 'needs', 2),
  b('hurt', 'I hurt', '🤕', 'needs', 3, 'I hurt'),
  b('sick', 'Sick', '🤒', 'needs', 4),
  b('space', 'Space', '🫧', 'needs', 5, 'I need space'),
  b('hug', 'Hug', '🤗', 'needs', 6),
  b('home-need', 'Home', '🏠', 'needs', 7, 'I want to go home'),
  // People
  b('mom', 'Mom', '👩', 'people', 0),
  b('dad', 'Dad', '👨', 'people', 1),
  b('teacher', 'Teacher', '👩‍🏫', 'people', 2),
  b('friend', 'Friend', '🤝', 'people', 3),
  b('me', 'Me', '🧒', 'people', 4),
  b('you', 'You', '👉', 'people', 5),
  // Food
  b('eat', 'Eat', '🍽️', 'food', 0),
  b('drink', 'Drink', '🥛', 'food', 1),
  b('water', 'Water', '💧', 'food', 2),
  b('snack', 'Snack', '🍎', 'food', 3),
  b('hungry', 'Hungry', '😋', 'food', 4),
  b('thirsty', 'Thirsty', '🥤', 'food', 5),
  // Actions
  b('play', 'Play', '🧩', 'actions', 0),
  b('look', 'Look', '👀', 'actions', 1),
  b('listen', 'Listen', '👂', 'actions', 2),
  b('come', 'Come', '🤙', 'actions', 3),
  b('sit', 'Sit', '🪑', 'actions', 4),
  b('walk', 'Walk', '🚶', 'actions', 5),
  b('read', 'Read', '📖', 'actions', 6),
  b('music', 'Music', '🎵', 'actions', 7),
  // Places
  b('school', 'School', '🏫', 'places', 0),
  b('park', 'Park', '🌳', 'places', 1),
  b('outside', 'Outside', '☀️', 'places', 2),
  b('car', 'Car', '🚗', 'places', 3),
  b('bed', 'Bed', '🛏️', 'places', 4),
  b('class', 'Classroom', '📚', 'places', 5),
]

export function createDefaultAacLibrary(): AacLibrary {
  return {
    categories: PRESET_CATEGORIES.map((c) => ({ ...c })),
    buttons: PRESET_BUTTONS.map((btn) => ({ ...btn })),
    prefs: { ...DEFAULT_AAC_PREFS },
  }
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
    btnById.set(
      btn.id,
      prev
        ? {
            ...prev,
            ...btn,
            // Keep custom media from save
            photoDataUrl: btn.photoDataUrl ?? prev.photoDataUrl,
            signPhotoDataUrl: btn.signPhotoDataUrl ?? prev.signPhotoDataUrl,
          }
        : {
            ...btn,
            emoji: btn.emoji || '💬',
            categoryId: btn.categoryId || 'family',
            order: typeof btn.order === 'number' ? btn.order : 999,
            source: btn.source ?? 'custom',
          },
    )
  }

  return {
    categories: [...catById.values()].sort((a, b) => a.order - b.order),
    buttons: [...btnById.values()].sort(
      (a, b) => a.categoryId.localeCompare(b.categoryId) || a.order - b.order,
    ),
    prefs: { ...DEFAULT_AAC_PREFS, ...(saved.prefs || {}) },
  }
}

export function visibleCategories(library: AacLibrary) {
  return library.categories.filter((c) => !c.hidden).sort((a, b) => a.order - b.order)
}

export function buttonsForCategory(library: AacLibrary, categoryId: string) {
  return library.buttons
    .filter((b) => !b.hidden && b.categoryId === categoryId)
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
  // auto: photo → sign → emoji
  if (button.photoDataUrl) return { kind: 'photo', src: button.photoDataUrl, emoji: button.emoji }
  if (button.signPhotoDataUrl) return { kind: 'sign', src: button.signPhotoDataUrl, emoji: button.emoji }
  return { kind: 'emoji', emoji: button.emoji }
}
