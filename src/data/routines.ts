import type { Routine, RoutineStep, RoutineTemplateId } from '../types'

export const STEP_ICONS = [
  { id: 'shoes', label: 'Shoes', emoji: '👟' },
  { id: 'brush', label: 'Brush teeth', emoji: '🪥' },
  { id: 'wash', label: 'Wash hands', emoji: '🧼' },
  { id: 'clothes', label: 'Clothes', emoji: '👕' },
  { id: 'backpack', label: 'Backpack', emoji: '🎒' },
  { id: 'breakfast', label: 'Breakfast', emoji: '🥣' },
  { id: 'car', label: 'Car / bus', emoji: '🚗' },
  { id: 'door', label: 'Coat / door', emoji: '🚪' },
  { id: 'bath', label: 'Bath', emoji: '🛁' },
  { id: 'pajamas', label: 'Pajamas', emoji: '🩳' },
  { id: 'story', label: 'Story', emoji: '📖' },
  { id: 'bed', label: 'Bed', emoji: '🛏️' },
  { id: 'toilet', label: 'Bathroom', emoji: '🚽' },
  { id: 'water', label: 'Water', emoji: '💧' },
  { id: 'tablet', label: 'Quiet tablet', emoji: '📱' },
  { id: 'park', label: 'Park', emoji: '🌳' },
  { id: 'train', label: 'Train time', emoji: '🚂' },
  { id: 'space', label: 'Space time', emoji: '🚀' },
  { id: 'animal', label: 'Animals', emoji: '🐾' },
]

function step(
  id: string,
  label: string,
  emoji: string,
  timerSeconds = 60,
): RoutineStep {
  return {
    id,
    label,
    emoji,
    timerSeconds,
    voiceText: label,
  }
}

export const ROUTINE_TEMPLATES: {
  id: RoutineTemplateId
  title: string
  blurb: string
  steps: RoutineStep[]
  thenReward: Routine['thenReward']
}[] = [
  {
    id: 'morning',
    title: 'Morning',
    blurb: 'Wake-up to ready',
    steps: [
      step('m1', 'Bathroom', '🚽', 45),
      step('m2', 'Wash hands', '🧼', 40),
      step('m3', 'Clothes on', '👕', 90),
      step('m4', 'Breakfast', '🥣', 120),
      step('m5', 'Brush teeth', '🪥', 60),
    ],
    thenReward: { label: 'Quiet interest time', emoji: '⭐' },
  },
  {
    id: 'bedtime',
    title: 'Bedtime',
    blurb: 'Wind down gently',
    steps: [
      step('b1', 'Bath or wash', '🛁', 120),
      step('b2', 'Pajamas', '🩳', 60),
      step('b3', 'Brush teeth', '🪥', 60),
      step('b4', 'Story', '📖', 180),
      step('b5', 'In bed', '🛏️', 60),
    ],
    thenReward: { label: 'Soft night light', emoji: '🌙' },
  },
  {
    id: 'leaving',
    title: 'Leaving the House',
    blurb: 'Get out the door calmly',
    steps: [
      step('l1', 'Shoes on', '👟', 60),
      step('l2', 'Coat / bag', '🎒', 45),
      step('l3', 'Bathroom check', '🚽', 40),
      step('l4', 'To the door', '🚪', 30),
    ],
    thenReward: { label: 'Favorite sticker', emoji: '🌟' },
  },
]

export function routineFromTemplate(templateId: RoutineTemplateId): Routine {
  const t = ROUTINE_TEMPLATES.find((x) => x.id === templateId) ?? ROUTINE_TEMPLATES[0]
  return {
    id: `routine-${templateId}-${Date.now()}`,
    templateId: t.id,
    title: t.title,
    steps: t.steps.map((s) => ({ ...s, id: `${s.id}-${Math.random().toString(36).slice(2, 7)}` })),
    thenReward: { ...t.thenReward },
  }
}

export const REWARD_STICKERS: Record<'trains' | 'space' | 'animals', string[]> = {
  trains: ['🚂', '🚃', '🚉', '🚦'],
  space: ['🚀', '🌙', '⭐', '🛸'],
  animals: ['🦕', '🐾', '🦊', '🐢'],
}
