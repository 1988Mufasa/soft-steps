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
  | 'wait'
  | 'want'
  | 'bathroom'
  | 'home'

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
  {
    id: 'wait',
    word: 'Wait',
    emoji: '⏳',
    pose: 'wait',
    how: 'Palms up, fingers wiggle gently.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'want',
    word: 'Want',
    emoji: '🤲',
    pose: 'want',
    how: 'Hands pull toward your chest.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'bathroom',
    word: 'Bathroom',
    emoji: '🚽',
    pose: 'bathroom',
    how: 'Fist with T shakes at the side.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'home',
    word: 'Home',
    emoji: '🏠',
    pose: 'home',
    how: 'Fingertips touch cheek, then chin.',
    ages: ['3-6', '7-12'],
  },
  // Animals
  {
    id: 'cat',
    word: 'Cat',
    emoji: '🐱',
    pose: 'm-tap',
    how: 'Stroke whiskers from cheek outward.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'dog',
    word: 'Dog',
    emoji: '🐶',
    pose: 'thumbs-up',
    how: 'Pat your leg like calling a dog, then snap.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'bird',
    word: 'Bird',
    emoji: '🐦',
    pose: 'to-mouth',
    how: 'Pinch at mouth like a beak opening.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'fish',
    word: 'Fish',
    emoji: '🐟',
    pose: 'wave',
    how: 'Flat hand swims forward like a fish.',
    ages: ['3-6', '7-12'],
  },
  // Body parts
  {
    id: 'hand-sign',
    word: 'Hand',
    emoji: '✋',
    pose: 'stop-flat',
    how: 'Show an open hand and tap it gently.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'eye-sign',
    word: 'Eye',
    emoji: '👁️',
    pose: 'd-tap',
    how: 'Point to your eye softly.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'ear-sign',
    word: 'Ear',
    emoji: '👂',
    pose: 'm-tap',
    how: 'Point to or pinch your ear gently.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'nose-sign',
    word: 'Nose',
    emoji: '👃',
    pose: 'to-mouth',
    how: 'Touch your nose with a fingertip.',
    ages: ['3-6', '7-12'],
  },
  // Daily objects
  {
    id: 'book-sign',
    word: 'Book',
    emoji: '📖',
    pose: 'palms-down',
    how: 'Palms together, then open like a book.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'shoes-sign',
    word: 'Shoes',
    emoji: '👟',
    pose: 'tips-together',
    how: 'Tap fists together like putting shoes on.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'ball-sign',
    word: 'Ball',
    emoji: '⚽',
    pose: 'circle-chest',
    how: 'Curve hands into a ball shape.',
    ages: ['3-6', '7-12'],
  },
  {
    id: 'cup-sign',
    word: 'Cup',
    emoji: 'マグカップ',
    pose: 'cup-drink',
    how: 'C-hand like holding a cup.',
    ages: ['7-12'],
  },
]

export function signPool(ageBand: '3-6' | '7-12') {
  return SIGNS.filter((s) => s.ages.includes(ageBand))
}
