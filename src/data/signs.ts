export type SignPose =
  | 'wave'
  | 'chin-out'
  | 'circle-chest'
  | 'tips-together'
  | 'thumbs-up'
  | 'thumbs-down'
  | 'fist-help'
  | 'hand-heart'
  | 'to-mouth'
  | 'cup-drink'
  | 'palms-down'
  | 'stop-flat'
  | 'link-friends'
  | 'm-tap'
  | 'd-tap'
  | 'play-y'

export type SignItem = {
  id: string
  word: string
  emoji: string
  pose: SignPose
  /** Short kid-friendly how-to (ASL-inspired practice, not a certified course) */
  how: string
  ages: Array<'3-6' | '7-12'>
}

/** Everyday ASL-inspired practice signs for Soft Steps (offline). */
export const SIGNS: SignItem[] = [
  {
    id: 'hello',
    word: 'Hello',
    emoji: '👋',
    pose: 'wave',
    how: 'Open hand near forehead, then wave out.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'thanks',
    word: 'Thank you',
    emoji: '💛',
    pose: 'chin-out',
    how: 'Fingers on chin, then move hand forward.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'please',
    word: 'Please',
    emoji: '🙏',
    pose: 'circle-chest',
    how: 'Flat hand circles on your chest.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'more',
    word: 'More',
    emoji: '➕',
    pose: 'tips-together',
    how: 'Fingertip bunches tap together.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'yes',
    word: 'Yes',
    emoji: '👍',
    pose: 'thumbs-up',
    how: 'Fist nods like a head nodding yes.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'no',
    word: 'No',
    emoji: '👎',
    pose: 'thumbs-down',
    how: 'First two fingers close onto thumb.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'help',
    word: 'Help',
    emoji: '🤝',
    pose: 'fist-help',
    how: 'Fist on open palm, lift both up.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'love',
    word: 'Love',
    emoji: '❤️',
    pose: 'hand-heart',
    how: 'Arms cross over heart.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'eat',
    word: 'Eat',
    emoji: '🍎',
    pose: 'to-mouth',
    how: 'Fingertips tap near your mouth.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'drink',
    word: 'Drink',
    emoji: '🥛',
    pose: 'cup-drink',
    how: 'C-hand tips to mouth like a cup.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'alldone',
    word: 'All done',
    emoji: '✅',
    pose: 'palms-down',
    how: 'Palms flip out and down — finished.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'stop',
    word: 'Stop',
    emoji: '🛑',
    pose: 'stop-flat',
    how: 'One flat hand chops onto the other.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'friend',
    word: 'Friend',
    emoji: '🤜🤛',
    pose: 'link-friends',
    how: 'Index fingers hook, then switch.',
    ages: ['7-12'],
  },
  {
    id: 'mom',
    word: 'Mom',
    emoji: '👩',
    pose: 'm-tap',
    how: 'Open hand thumb taps chin.',
    ages: ['7-12'],
  },
  {
    id: 'dad',
    word: 'Dad',
    emoji: '👨',
    pose: 'd-tap',
    how: 'Open hand thumb taps forehead.',
    ages: ['7-12'],
  },
  {
    id: 'play',
    word: 'Play',
    emoji: '🎲',
    pose: 'play-y',
    how: 'Y-hands shake side to side.',
    ages: ['7-12'],
  },
]

export function signPool(ageBand: '3-6' | '7-12') {
  return SIGNS.filter((s) => s.ages.includes(ageBand))
}
