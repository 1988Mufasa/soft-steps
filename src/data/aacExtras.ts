/** Shared AAC extras: phrases, scripts, notes, templates, access prefs helpers. */

import {
  applyStageToLibrary,
  type AacLibrary,
} from './aacPresets'

export type AacSavedPhrase = {
  id: string
  label: string
  speak: string
  words: string[]
  emoji?: string
  savedAt: number
}

export type AacScriptLine = {
  id: string
  label: string
  speak: string
  emoji: string
}

export type AacScript = {
  id: string
  title: string
  emoji: string
  blurb: string
  lines: AacScriptLine[]
}

export type AacSessionNote = {
  id: string
  at: number
  text: string
  author: string
}

export type AacBoardTemplateId = 'first-20-core' | 'classroom' | 'mealtime' | 'full-expanded'

export type AacBoardTemplate = {
  id: AacBoardTemplateId
  title: string
  blurb: string
  emoji: string
  stage: 'starter' | 'developing' | 'expanded'
  layout: '2x3' | '3x4' | '4x6'
  /** Core button ids to unmask; others stay masked when applyMasks is true */
  unmaskIds: string[]
  applyMasks: boolean
  showFolders: boolean
}

export const DEFAULT_SCRIPTS: AacScript[] = [
  {
    id: 'greetings',
    title: 'Greetings',
    emoji: '👋',
    blurb: 'Hello and goodbye',
    lines: [
      { id: 'hi', label: 'Hi', speak: 'Hi', emoji: '👋' },
      { id: 'hello', label: 'Hello', speak: 'Hello', emoji: '😊' },
      { id: 'bye', label: 'Bye', speak: 'Bye', emoji: '👋' },
      { id: 'good-morning', label: 'Good morning', speak: 'Good morning', emoji: '🌅' },
    ],
  },
  {
    id: 'classroom',
    title: 'Classroom',
    emoji: '🏫',
    blurb: 'Ask for help at school',
    lines: [
      { id: 'help-please', label: 'Help please', speak: 'Help please', emoji: '🛟' },
      { id: 'bathroom', label: 'Bathroom', speak: 'I need the bathroom', emoji: '🚻' },
      { id: 'break', label: 'I need a break', speak: 'I need a break', emoji: '⏸️' },
      { id: 'dont-understand', label: "I don't understand", speak: "I don't understand", emoji: '❓' },
      { id: 'finished-work', label: "I'm finished", speak: "I'm finished", emoji: '✅' },
    ],
  },
  {
    id: 'medical',
    title: 'Medical',
    emoji: '🩹',
    blurb: 'Pain and body needs',
    lines: [
      { id: 'hurts', label: 'It hurts', speak: 'It hurts', emoji: '😣' },
      { id: 'head-hurts', label: 'My head hurts', speak: 'My head hurts', emoji: '🤕' },
      { id: 'tummy-hurts', label: 'My tummy hurts', speak: 'My tummy hurts', emoji: '🤢' },
      { id: 'feel-sick', label: 'I feel sick', speak: 'I feel sick', emoji: '🤒' },
      { id: 'need-quiet', label: 'I need quiet', speak: 'I need quiet', emoji: '🤫' },
    ],
  },
  {
    id: 'mealtime',
    title: 'Mealtime',
    emoji: '🍽️',
    blurb: 'Food and drink requests',
    lines: [
      { id: 'want-eat', label: 'I want to eat', speak: 'I want to eat', emoji: '🍽️' },
      { id: 'want-drink', label: 'I want a drink', speak: 'I want a drink', emoji: '🥛' },
      { id: 'more-please', label: 'More please', speak: 'More please', emoji: '➕' },
      { id: 'all-done-food', label: 'All done', speak: 'All done', emoji: '✅' },
      { id: 'dont-like', label: "I don't like it", speak: "I don't like it", emoji: '👎' },
    ],
  },
]

export const BOARD_TEMPLATES: AacBoardTemplate[] = [
  {
    id: 'first-20-core',
    title: 'First 20 core',
    emoji: '⭐',
    blurb: 'Starter board — Want, Help, More, Yes, No, and early core only.',
    stage: 'starter',
    layout: '2x3',
    unmaskIds: [
      'want',
      'help',
      'more',
      'yes',
      'no',
      'stop',
      'go',
      'eat',
      'drink',
      'play',
      'alldone',
      'bathroom',
    ],
    applyMasks: true,
    showFolders: false,
  },
  {
    id: 'classroom',
    title: 'Classroom',
    emoji: '🏫',
    blurb: 'Developing grid + folders for school fringe words.',
    stage: 'developing',
    layout: '3x4',
    unmaskIds: [],
    applyMasks: false,
    showFolders: true,
  },
  {
    id: 'mealtime',
    title: 'Mealtime',
    emoji: '🍎',
    blurb: 'Developing board focused on food & drink folders.',
    stage: 'developing',
    layout: '3x4',
    unmaskIds: [],
    applyMasks: false,
    showFolders: true,
  },
  {
    id: 'full-expanded',
    title: 'Full expanded',
    emoji: '📗',
    blurb: 'Ages 8–12 full core + all folders unmasked.',
    stage: 'expanded',
    layout: '4x6',
    unmaskIds: [],
    applyMasks: false,
    showFolders: true,
  },
]

export function phraseFromButtons(
  buttons: { id: string; label: string; speak?: string; emoji?: string }[],
): Omit<AacSavedPhrase, 'id' | 'savedAt'> | null {
  if (!buttons.length) return null
  const words = buttons.map((b) => b.label)
  const speak = buttons.map((b) => (b.speak || b.label).trim()).join(' ')
  return {
    label: words.join(' '),
    speak,
    words,
    emoji: buttons[0]?.emoji || '💬',
  }
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

/** Apply a board template — stage/layout + optional progressive masks. */
export function applyBoardTemplate(library: AacLibrary, templateId: AacBoardTemplateId): AacLibrary {
  const template = BOARD_TEMPLATES.find((t) => t.id === templateId)
  if (!template) return library
  let next = applyStageToLibrary(library, template.stage, template.layout)
  next = {
    ...next,
    prefs: {
      ...next.prefs,
      showFolders: template.showFolders,
      setupComplete: true,
    },
  }
  if (template.applyMasks && template.unmaskIds.length) {
    const allow = new Set(template.unmaskIds)
    next = {
      ...next,
      buttons: next.buttons.map((b) =>
        b.categoryId === 'core' ? { ...b, masked: !allow.has(b.id) } : b,
      ),
    }
  } else if (!template.applyMasks) {
    next = {
      ...next,
      buttons: next.buttons.map((b) => ({ ...b, masked: false })),
    }
  }
  return next
}
