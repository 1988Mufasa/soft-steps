/**
 * Pain & Body Check — one-tap meltdown vocabulary.
 * No folders: big body zones + sensory chips.
 */

export type BodyZoneId = 'head' | 'tummy' | 'ear' | 'eye' | 'hand' | 'leg' | 'whole'

export type BodyCheckItem = {
  id: string
  label: string
  speak: string
  emoji: string
  zone?: BodyZoneId
  kind: 'pain' | 'sensory' | 'need'
}

export const BODY_CHECK_ITEMS: BodyCheckItem[] = [
  { id: 'head-hurts', label: 'Head hurts', speak: 'My head hurts', emoji: '🤕', zone: 'head', kind: 'pain' },
  { id: 'tummy-hurts', label: 'Tummy hurts', speak: 'My tummy hurts', emoji: '😖', zone: 'tummy', kind: 'pain' },
  { id: 'ear-hurts', label: 'Ears hurt', speak: 'My ears hurt', emoji: '👂', zone: 'ear', kind: 'pain' },
  { id: 'hand-hurts', label: 'Hand hurts', speak: 'My hand hurts', emoji: '✋', zone: 'hand', kind: 'pain' },
  { id: 'leg-hurts', label: 'Leg hurts', speak: 'My leg hurts', emoji: '🦵', zone: 'leg', kind: 'pain' },
  { id: 'hurt-somewhere', label: 'I hurt', speak: 'I hurt somewhere', emoji: '💔', zone: 'whole', kind: 'pain' },
  { id: 'too-loud', label: 'Too loud', speak: 'It is too loud', emoji: '🔊', kind: 'sensory' },
  { id: 'too-bright', label: 'Too bright', speak: 'It is too bright', emoji: '💡', kind: 'sensory' },
  { id: 'too-much', label: 'Too much', speak: 'It is too much', emoji: '🌊', kind: 'sensory' },
  { id: 'need-break', label: 'Need a break', speak: 'I need a break', emoji: '⏸️', kind: 'need' },
  { id: 'need-quiet', label: 'Need quiet', speak: 'I need quiet', emoji: '🤫', kind: 'need' },
  { id: 'need-help', label: 'Need help', speak: 'I need help', emoji: '🆘', kind: 'need' },
]

export const BODY_ZONES: { id: BodyZoneId; label: string; top: string; left: string }[] = [
  { id: 'head', label: 'Head', top: '6%', left: '50%' },
  { id: 'ear', label: 'Ears', top: '14%', left: '72%' },
  { id: 'eye', label: 'Eyes', top: '12%', left: '42%' },
  { id: 'tummy', label: 'Tummy', top: '42%', left: '50%' },
  { id: 'hand', label: 'Hands', top: '48%', left: '18%' },
  { id: 'leg', label: 'Legs', top: '72%', left: '50%' },
  { id: 'whole', label: 'All over', top: '28%', left: '50%' },
]
