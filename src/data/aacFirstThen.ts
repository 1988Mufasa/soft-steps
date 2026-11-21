import type { AacFirstThenSlot } from './aacPresets'

/** Preset transition / reward icons for adult First–Then setup. */
export const FIRST_THEN_PRESETS: AacFirstThenSlot[] = [
  { label: 'Brush Teeth', emoji: '🪥' },
  { label: 'Math', emoji: '🔢' },
  { label: 'Clean Up', emoji: '🧹' },
  { label: 'Reading', emoji: '📖' },
  { label: 'Circle Time', emoji: '⭕' },
  { label: 'Homework', emoji: '📝' },
  { label: 'iPad', emoji: '📱' },
  { label: 'Snack', emoji: '🍎' },
  { label: 'Swing', emoji: '🛝' },
  { label: 'Break', emoji: '⏸️' },
  { label: 'Play', emoji: '🧩' },
  { label: 'Outside', emoji: '☀️' },
  { label: 'Music', emoji: '🎵' },
  { label: 'Sticker', emoji: '⭐' },
  { label: 'Hug', emoji: '🤗' },
  { label: 'All Done', emoji: '✅' },
]

export function firstThenPhrase(
  first: AacFirstThenSlot | null | undefined,
  then: AacFirstThenSlot | null | undefined,
): string {
  const a = first?.label?.trim()
  const b = then?.label?.trim()
  if (a && b) return `First ${a}, then ${b}`
  if (a) return `First ${a}`
  if (b) return `Then ${b}`
  return ''
}
