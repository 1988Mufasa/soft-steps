export type CheckInFeeling = {
  id: string
  label: string
  emoji: string
  color: string
  speak: string
  ages: Array<'3-6' | '7-12'>
}

export type CheckInBody = {
  id: string
  label: string
  emoji: string
  speak: string
}

export type CheckInNeed = {
  id: string
  label: string
  emoji: string
  speak: string
  suggest?: 'meltdown' | 'calm' | 'talk' | 'schedule'
}

export const CHECKIN_BODY: CheckInBody[] = [
  { id: 'heart', label: 'Heart', emoji: '💗', speak: 'My heart feels busy.' },
  { id: 'tummy', label: 'Tummy', emoji: '🫧', speak: 'My tummy feels funny.' },
  { id: 'hands', label: 'Hands', emoji: '✋', speak: 'My hands feel wiggly.' },
  { id: 'head', label: 'Head', emoji: '🧠', speak: 'My head feels full.' },
  { id: 'chest', label: 'Chest', emoji: '🌬️', speak: 'My chest feels tight.' },
  { id: 'whole', label: 'Whole body', emoji: '🧍', speak: 'My whole body feels big feelings.' },
]

export const CHECKIN_FEELINGS: CheckInFeeling[] = [
  {
    id: 'calm',
    label: 'Calm',
    emoji: '😌',
    color: '#6BA84E',
    speak: 'I feel calm.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'happy',
    label: 'Happy',
    emoji: '😊',
    color: '#E0B84A',
    speak: 'I feel happy.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'okay',
    label: 'Okay',
    emoji: '🙂',
    color: '#74B8D2',
    speak: 'I feel okay.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'worried',
    label: 'Worried',
    emoji: '😟',
    color: '#C9B27A',
    speak: 'I feel worried.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'mad',
    label: 'Mad',
    emoji: '😠',
    color: '#C7303A',
    speak: 'I feel mad.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'sad',
    label: 'Sad',
    emoji: '😢',
    color: '#3661B0',
    speak: 'I feel sad.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'tired',
    label: 'Tired',
    emoji: '😴',
    color: '#8B3A6B',
    speak: 'I feel tired.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'excited',
    label: 'Excited',
    emoji: '🤩',
    color: '#C45137',
    speak: 'I feel excited.',
    ages: ['7-12'],
  },
  {
    id: 'frustrated',
    label: 'Frustrated',
    emoji: '😤',
    color: '#C45137',
    speak: 'I feel frustrated.',
    ages: ['7-12'],
  },
  {
    id: 'overwhelmed',
    label: 'Overwhelmed',
    emoji: '😵',
    color: '#8B3A6B',
    speak: 'I feel overwhelmed.',
    ages: ['7-12'],
  },
  {
    id: 'proud',
    label: 'Proud',
    emoji: '🌟',
    color: '#E0B84A',
    speak: 'I feel proud.',
    ages: ['7-12'],
  },
  {
    id: 'scared',
    label: 'Scared',
    emoji: '😨',
    color: '#5A6270',
    speak: 'I feel scared.',
    ages: ['3-6', '7-12'],
  },
]

export const CHECKIN_NEEDS: CheckInNeed[] = [
  {
    id: 'break',
    label: 'Break',
    emoji: '⏸️',
    speak: 'I need a break.',
    suggest: 'calm',
  },
  {
    id: 'help',
    label: 'Help',
    emoji: '🤝',
    speak: 'I need help.',
    suggest: 'talk',
  },
  {
    id: 'quiet',
    label: 'Quiet',
    emoji: '🤫',
    speak: 'I need quiet.',
    suggest: 'meltdown',
  },
  {
    id: 'hug',
    label: 'Hug',
    emoji: '🤗',
    speak: 'I need a hug.',
  },
  {
    id: 'space',
    label: 'Space',
    emoji: '🚪',
    speak: 'I need space.',
    suggest: 'meltdown',
  },
  {
    id: 'water',
    label: 'Water',
    emoji: '💧',
    speak: 'I need water.',
  },
  {
    id: 'words',
    label: 'More words',
    emoji: '💬',
    speak: 'I want to say more.',
    suggest: 'talk',
  },
  {
    id: 'next',
    label: 'What next?',
    emoji: '➡️',
    speak: 'What comes next?',
    suggest: 'schedule',
  },
  {
    id: 'alone',
    label: 'Sit with me',
    emoji: '🪑',
    speak: 'Please sit with me.',
  },
  {
    id: 'stop',
    label: 'Stop',
    emoji: '🛑',
    speak: 'Please stop.',
    suggest: 'meltdown',
  },
]

export const BODY_STRENGTH_LABELS = ['', 'soft', 'a little', 'medium', 'strong', 'very strong'] as const

export type SavedCheckIn = {
  at: string
  feelingId: string
  feelingLabel: string
  bodyId: string
  bodyLabel: string
  bodyLevel: number
  needId: string
  needLabel: string
  sentence: string
}

const HISTORY_KEY = 'soft-steps-checkin-history'

export function loadCheckInHistory(): SavedCheckIn[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedCheckIn[]
    return Array.isArray(parsed) ? parsed.slice(0, 12) : []
  } catch {
    return []
  }
}

export function saveCheckIn(entry: SavedCheckIn) {
  const prev = loadCheckInHistory()
  const next = [entry, ...prev].slice(0, 12)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  return next
}

export function buildCheckInSentence(parts: {
  feelingSpeak: string
  bodySpeak: string
  strength: string
  needSpeak: string
}) {
  return `${parts.feelingSpeak} ${parts.bodySpeak.replace(/\.$/, '')} (${parts.strength}). ${parts.needSpeak}`
}
