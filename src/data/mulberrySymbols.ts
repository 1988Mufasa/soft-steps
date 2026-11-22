/**
 * Mulberry Symbols (CC BY-SA 4.0) — Steve Lee / mulberrysymbols.org
 * SVGs live in /symbols/mulberry/; lookup + search helpers for AAC tiles.
 */

export const MULBERRY_ATTRIBUTION =
  'Mulberry Symbols © Steve Lee — Creative Commons Attribution-ShareAlike 4.0 (mulberrysymbols.org)'

export const MULBERRY_BASE = '/symbols/mulberry'

/** Hand-tuned AAC → Mulberry filename map (common core / fringe words). */
export const MULBERRY_AAC_ALIASES: Record<string, string> = {
  i: 'I.svg',
  want: 'want_,_to.svg',
  help: 'help_,_to.svg',
  more: 'more.svg',
  drink: 'drink_2_,_to.svg',
  eat: 'eat_,_to.svg',
  go: 'go_,_to.svg',
  stop: 'finish.svg',
  play: 'play_,_to.svg',
  wait: 'wait_,_to.svg',
  listen: 'communication_aid_listen_to_me.svg',
  come: 'come_,_to.svg',
  sit: 'sit_,_to.svg',
  walk: 'walk_,_to.svg',
  read: 'read_book_,_to.svg',
  water: 'water.svg',
  apple: 'apple.svg',
  juice: 'apple_juice.svg',
  milk: 'milk.svg',
  lunch: 'lunch_1.svg',
  snack: 'biscuits.svg',
  hungry: 'hungry.svg',
  thirsty: 'thirsty.svg',
  good: 'good.svg',
  bad: 'bad.svg',
  happy: 'happy_man.svg',
  sad: 'sad_man.svg',
  mad: 'angry_man.svg',
  angry: 'angry_man.svg',
  scared: 'afraid_man.svg',
  tired: 'sleep_male_,_to.svg',
  calm: 'relax_,_to.svg',
  excited: 'excited_man.svg',
  sick: 'headache.svg',
  hurt: 'stomach_ache.svg',
  ouch: 'stomach_ache.svg',
  tummy: 'stomach.svg',
  head: 'head.svg',
  toilet: 'toilets.svg',
  break: 'break_,_to.svg',
  quiet: 'quiet.svg',
  space: 'outside.svg',
  hug: 'hug_,_to.svg',
  mom: 'mum_parent.svg',
  mum: 'mum_parent.svg',
  dad: 'dad_parent.svg',
  grandma: 'grandmother.svg',
  grandpa: 'grandfather.svg',
  teacher: 'teacher_1a.svg',
  pet: 'dog.svg',
  school: 'school.svg',
  park: 'outside.svg',
  outside: 'outside.svg',
  car: 'car.svg',
  bed: 'single_bed.svg',
  home: 'house.svg',
  bus: 'bus.svg',
  ball: 'ball.svg',
  book: 'communication_book.svg',
  music: 'music.svg',
  yes: 'correct.svg',
  no: 'mistake_no_wrong.svg',
  'all done': 'finish.svg',
  finished: 'finish.svg',
  blocks: 'lego.svg',
  tablet: 'computer_game.svg',
  'my toy': 'lego.svg',
}

export type MulberrySymbolMeta = {
  file: string
  label: string
  grammar: string
  category: string
  tags: string[]
  keys: string[]
}

export type MulberryIndex = {
  source: string
  version: string
  license: string
  attribution: string
  count: number
  symbols: MulberrySymbolMeta[]
}

let cachedIndex: MulberryIndex | null = null
let cachedLookup: Record<string, string> | null = null

export function mulberryUrl(file: string) {
  return `${MULBERRY_BASE}/${encodeURIComponent(file)}`
}

export function normalizeMulberryKey(raw: string) {
  return String(raw || '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function loadMulberryIndex(): Promise<MulberryIndex | null> {
  if (cachedIndex) return cachedIndex
  try {
    const res = await fetch('/symbols/mulberry-index.json')
    if (!res.ok) return null
    cachedIndex = (await res.json()) as MulberryIndex
    return cachedIndex
  } catch {
    return null
  }
}

async function loadLookup(): Promise<Record<string, string>> {
  if (cachedLookup) return cachedLookup
  try {
    const res = await fetch('/symbols/mulberry-lookup.json')
    if (res.ok) {
      const data = (await res.json()) as { byKey?: Record<string, string> }
      cachedLookup = data.byKey ?? {}
      return cachedLookup
    }
  } catch {
    /* fall through */
  }
  cachedLookup = {}
  return cachedLookup
}

/** Resolve a Mulberry SVG filename for a spoken/label word. */
export async function resolveMulberryFile(label: string): Promise<string | undefined> {
  const key = normalizeMulberryKey(label)
  if (!key) return undefined
  if (MULBERRY_AAC_ALIASES[key]) return MULBERRY_AAC_ALIASES[key]

  const lookup = await loadLookup()
  if (lookup[key]) return lookup[key]

  // Prefer exact stem match from index
  const idx = await loadMulberryIndex()
  if (!idx) return undefined
  const exact = idx.symbols.find((s) => s.keys.includes(key) || normalizeMulberryKey(s.label) === key)
  if (exact) return exact.file

  // Starts-with / includes for short AAC words
  if (key.length >= 3) {
    const soft = idx.symbols.find(
      (s) =>
        normalizeMulberryKey(s.label) === key ||
        s.keys.some((k) => k === key || k.startsWith(`${key} `) || k.endsWith(` ${key}`)),
    )
    if (soft) return soft.file
  }
  return undefined
}

/** Sync helper when lookup JSON already loaded (board paint). */
export function resolveMulberryFileSync(label: string, lookup?: Record<string, string> | null) {
  const key = normalizeMulberryKey(label)
  if (!key) return undefined
  if (MULBERRY_AAC_ALIASES[key]) return MULBERRY_AAC_ALIASES[key]
  if (lookup?.[key]) return lookup[key]
  return undefined
}

export function searchMulberrySymbols(
  index: MulberryIndex,
  query: string,
  limit = 48,
): MulberrySymbolMeta[] {
  const q = normalizeMulberryKey(query)
  if (!q) return index.symbols.slice(0, limit)
  const scored = index.symbols
    .map((s) => {
      const label = normalizeMulberryKey(s.label)
      let score = 0
      if (label === q) score = 100
      else if (label.startsWith(q)) score = 80
      else if (s.keys.includes(q)) score = 70
      else if (label.includes(q)) score = 40
      else if (s.keys.some((k) => k.includes(q))) score = 25
      else if (s.tags.some((t) => normalizeMulberryKey(t).includes(q))) score = 15
      return { s, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.s.label.localeCompare(b.s.label))
  return scored.slice(0, limit).map((x) => x.s)
}
