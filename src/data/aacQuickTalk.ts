/**
 * Classroom Quick-Talk — temporary fringe strips for the day's lesson.
 * Loaded into a separate strip; never merges into permanent home vocabulary.
 */

export type QuickTalkWord = {
  id: string
  label: string
  emoji: string
  speak?: string
}

export type QuickTalkStrip = {
  title: string
  words: QuickTalkWord[]
}

export type QuickTalkPack = {
  id: string
  title: string
  emoji: string
  blurb: string
  words: Omit<QuickTalkWord, 'id'>[]
}

export const QUICK_TALK_PACKS: QuickTalkPack[] = [
  {
    id: 'fall',
    title: 'Fall / October',
    emoji: '🍂',
    blurb: 'Pumpkin, leaf, fall unit words',
    words: [
      { label: 'Pumpkin', emoji: '🎃' },
      { label: 'Leaf', emoji: '🍃' },
      { label: 'Fall', emoji: '🍂' },
      { label: 'Apple', emoji: '🍎' },
      { label: 'Costume', emoji: '🦸' },
      { label: 'Candy', emoji: '🍬' },
    ],
  },
  {
    id: 'field-trip',
    title: 'Field trip',
    emoji: '🚌',
    blurb: 'Bus, zoo, lunch, line up',
    words: [
      { label: 'Bus', emoji: '🚌' },
      { label: 'Zoo', emoji: '🦁' },
      { label: 'Lunch', emoji: '🍱' },
      { label: 'Line up', emoji: '🧍', speak: 'line up' },
      { label: 'Ticket', emoji: '🎫' },
      { label: 'Museum', emoji: '🏛️' },
    ],
  },
  {
    id: 'calendar',
    title: 'Calendar talk',
    emoji: '📅',
    blurb: 'Today, weather, days',
    words: [
      { label: 'Today', emoji: '📅' },
      { label: 'Tomorrow', emoji: '➡️' },
      { label: 'Yesterday', emoji: '⬅️' },
      { label: 'Sunny', emoji: '☀️' },
      { label: 'Rainy', emoji: '🌧️' },
      { label: 'Weekend', emoji: '🎉' },
    ],
  },
  {
    id: 'stem',
    title: 'STEM / build',
    emoji: '🤖',
    blurb: 'Robot, code, build, test',
    words: [
      { label: 'Robot', emoji: '🤖' },
      { label: 'Build', emoji: '🧱' },
      { label: 'Code', emoji: '💻' },
      { label: 'Test', emoji: '🔬' },
      { label: 'Fix', emoji: '🔧' },
      { label: 'Share', emoji: '🗣️' },
    ],
  },
  {
    id: 'circle',
    title: 'Morning circle',
    emoji: '⭕',
    blurb: 'Hello, share, listen, turn',
    words: [
      { label: 'Hello', emoji: '👋' },
      { label: 'My turn', emoji: '🙋', speak: 'my turn' },
      { label: 'Listen', emoji: '👂' },
      { label: 'Share', emoji: '🤝' },
      { label: 'Sit', emoji: '🪑' },
      { label: 'Good morning', emoji: '🌅', speak: 'good morning' },
    ],
  },
]

export function packToStrip(pack: QuickTalkPack): QuickTalkStrip {
  return {
    title: pack.title,
    words: pack.words.map((w, i) => ({
      id: `qt-${pack.id}-${i}-${w.label.toLowerCase().replace(/\s+/g, '-')}`,
      label: w.label,
      emoji: w.emoji,
      speak: w.speak,
    })),
  }
}

/** Parse "pumpkin, leaf, fall" into a custom strip (max 12 words). */
export function parseQuickTalkList(title: string, raw: string): QuickTalkStrip | null {
  const parts = raw
    .split(/[,|\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12)
  if (!parts.length) return null
  return {
    title: title.trim() || 'Today’s words',
    words: parts.map((label, i) => ({
      id: `qt-custom-${Date.now().toString(36)}-${i}`,
      label: label.slice(0, 32),
      emoji: '💬',
    })),
  }
}
