/**
 * Randomized adult challenges for Kids Category / Families parental gates.
 * Fresh challenge each open; wrong answers request a new one.
 */

export type ParentalChallenge = {
  /** Spoken / displayed prompt */
  prompt: string
  /** Digits the adult must enter (no separators) */
  answer: string
  kind: 'words' | 'math'
}

const ONES = [
  'Zero',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
]
const TEENS = [
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
]
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** Spell 0–99 for adult number challenges. */
export function spellNumber(n: number): string {
  const v = Math.max(0, Math.min(99, Math.floor(n)))
  if (v < 10) return ONES[v]
  if (v < 20) return TEENS[v - 10]
  const ten = Math.floor(v / 10)
  const one = v % 10
  return one === 0 ? TENS[ten] : `${TENS[ten]}-${ONES[one]}`
}

function makeWordsChallenge(): ParentalChallenge {
  // Mix of two-digit + single-digit so kids can’t mash one digit
  const a = randInt(10, 29)
  const b = randInt(10, 39)
  const c = randInt(2, 9)
  const nums = [a, b, c]
  return {
    kind: 'words',
    prompt: `Enter the numbers: ${nums.map(spellNumber).join(', ')}`,
    answer: nums.map(String).join(''),
  }
}

function makeMathChallenge(): ParentalChallenge {
  if (Math.random() < 0.55) {
    const a = randInt(11, 24)
    const b = randInt(4, 15)
    return {
      kind: 'math',
      prompt: `${a} + ${b} = ?`,
      answer: String(a + b),
    }
  }
  const a = randInt(3, 9)
  const b = randInt(3, 9)
  return {
    kind: 'math',
    prompt: `${a} × ${b} = ?`,
    answer: String(a * b),
  }
}

/** New randomized challenge — call on every open and every failed attempt. */
export function createParentalChallenge(): ParentalChallenge {
  return Math.random() < 0.5 ? makeWordsChallenge() : makeMathChallenge()
}
