export type VideoCategory = 'letters' | 'numbers' | 'colors' | 'feelings' | 'foods' | 'calm'

export type VideoFrame = {
  emoji: string
  caption: string
  speak: string
}

export type BuiltInVideo = {
  id: string
  title: string
  category: VideoCategory
  emoji: string
  blurb: string
  ages: Array<'3-6' | '7-12'>
  /** Offline narrated frames — works without Wi‑Fi */
  frames: VideoFrame[]
}

export const VIDEO_CATEGORIES: { id: VideoCategory; title: string; emoji: string }[] = [
  { id: 'letters', title: 'Letters', emoji: '🔤' },
  { id: 'numbers', title: 'Numbers', emoji: '🔢' },
  { id: 'colors', title: 'Colors', emoji: '🎨' },
  { id: 'feelings', title: 'Feelings', emoji: '💛' },
  { id: 'foods', title: 'Foods', emoji: '🍎' },
  { id: 'calm', title: 'Calm', emoji: '🌊' },
]

/** Short offline watch-lessons (no external copyrighted video files). */
export const BUILTIN_VIDEOS: BuiltInVideo[] = [
  {
    id: 'abc-song-soft',
    title: 'Soft ABC walk',
    category: 'letters',
    emoji: '🔤',
    blurb: 'See and hear A B C gently.',
    ages: ['3-6', '7-12'],
    frames: [
      { emoji: '🅰️', caption: 'A is for apple', speak: 'A is for apple.' },
      { emoji: '🅱️', caption: 'B is for ball', speak: 'B is for ball.' },
      { emoji: '©️', caption: 'C is for cat', speak: 'C is for cat.' },
      { emoji: '⭐', caption: 'You know your letters', speak: 'You know your letters. You are awesome.' },
    ],
  },
  {
    id: 'count-to-five',
    title: 'Count to five',
    category: 'numbers',
    emoji: '5️⃣',
    blurb: 'Count stars one by one.',
    ages: ['3-6', '7-12'],
    frames: [
      { emoji: '⭐', caption: 'One', speak: 'One.' },
      { emoji: '⭐⭐', caption: 'Two', speak: 'Two.' },
      { emoji: '⭐⭐⭐', caption: 'Three', speak: 'Three.' },
      { emoji: '⭐⭐⭐⭐', caption: 'Four', speak: 'Four.' },
      { emoji: '⭐⭐⭐⭐⭐', caption: 'Five', speak: 'Five. You counted to five.' },
    ],
  },
  {
    id: 'rainbow-colors',
    title: 'Rainbow colors',
    category: 'colors',
    emoji: '🌈',
    blurb: 'Name calm colors together.',
    ages: ['3-6', '7-12'],
    frames: [
      { emoji: '🔴', caption: 'Red', speak: 'Red.' },
      { emoji: '🟡', caption: 'Yellow', speak: 'Yellow.' },
      { emoji: '🟢', caption: 'Green', speak: 'Green.' },
      { emoji: '🔵', caption: 'Blue', speak: 'Blue.' },
      { emoji: '🌈', caption: 'A soft rainbow', speak: 'A soft rainbow. Beautiful colors.' },
    ],
  },
  {
    id: 'feelings-soft',
    title: 'Naming feelings',
    category: 'feelings',
    emoji: '🙂',
    blurb: 'Happy, calm, worried — names help.',
    ages: ['3-6', '7-12'],
    frames: [
      { emoji: '😊', caption: 'Happy', speak: 'I can feel happy.' },
      { emoji: '😌', caption: 'Calm', speak: 'I can feel calm.' },
      { emoji: '😟', caption: 'Worried', speak: 'I can feel worried.' },
      { emoji: '🤗', caption: 'Feelings are okay', speak: 'Feelings are okay. I can tell someone.' },
    ],
  },
  {
    id: 'fruit-friends',
    title: 'Fruit friends',
    category: 'foods',
    emoji: '🍎',
    blurb: 'Meet a few friendly fruits.',
    ages: ['3-6', '7-12'],
    frames: [
      { emoji: '🍎', caption: 'Apple', speak: 'Apple.' },
      { emoji: '🍌', caption: 'Banana', speak: 'Banana.' },
      { emoji: '🍇', caption: 'Grapes', speak: 'Grapes.' },
      { emoji: '🍓', caption: 'Strawberry', speak: 'Strawberry. Yummy fruit.' },
    ],
  },
  {
    id: 'veggie-friends',
    title: 'Veggie friends',
    category: 'foods',
    emoji: '🥕',
    blurb: 'Meet a few friendly vegetables.',
    ages: ['3-6', '7-12'],
    frames: [
      { emoji: '🥕', caption: 'Carrot', speak: 'Carrot.' },
      { emoji: '🥦', caption: 'Broccoli', speak: 'Broccoli.' },
      { emoji: '🌽', caption: 'Corn', speak: 'Corn.' },
      { emoji: '🥒', caption: 'Cucumber', speak: 'Cucumber. Crunchy veggies.' },
    ],
  },
  {
    id: 'breathe-waves',
    title: 'Breathe like waves',
    category: 'calm',
    emoji: '🌊',
    blurb: 'Slow in… slow out.',
    ages: ['3-6', '7-12'],
    frames: [
      { emoji: '🌬️', caption: 'Breathe in slowly', speak: 'Breathe in slowly.' },
      { emoji: '🌊', caption: 'Hold soft', speak: 'Hold soft.' },
      { emoji: '😮‍💨', caption: 'Breathe out slowly', speak: 'Breathe out slowly.' },
      { emoji: '😌', caption: 'You are calm', speak: 'You are calm. You are awesome.' },
    ],
  },
  {
    id: 'count-to-ten',
    title: 'Count to ten',
    category: 'numbers',
    emoji: '🔟',
    blurb: 'A longer calm count for bigger kids.',
    ages: ['7-12'],
    frames: [
      { emoji: '1️⃣', caption: 'One', speak: 'One.' },
      { emoji: '2️⃣', caption: 'Two', speak: 'Two.' },
      { emoji: '3️⃣', caption: 'Three', speak: 'Three.' },
      { emoji: '5️⃣', caption: 'Five', speak: 'Five.' },
      { emoji: '🔟', caption: 'Ten', speak: 'Ten. Great counting.' },
    ],
  },
]

export function videosForAge(ageBand: '3-6' | '7-12', category?: VideoCategory) {
  return BUILTIN_VIDEOS.filter(
    (v) => v.ages.includes(ageBand) && (!category || v.category === category),
  )
}

/** Pull a YouTube id from a pasted URL or raw id. */
export function parseYoutubeId(input: string): string | null {
  const raw = input.trim()
  if (/^[\w-]{11}$/.test(raw)) return raw
  try {
    const url = new URL(raw)
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.replace(/^\//, '').slice(0, 11)
      return /^[\w-]{11}$/.test(id) ? id : null
    }
    const v = url.searchParams.get('v')
    if (v && /^[\w-]{11}$/.test(v)) return v
    const embed = url.pathname.match(/\/embed\/([\w-]{11})/)
    if (embed) return embed[1]
  } catch {
    /* not a URL */
  }
  return null
}
