export type LetterItem = {
  letter: string
  word: string
}

export const LETTERS: LetterItem[] = [
  { letter: 'A', word: 'Apple' },
  { letter: 'B', word: 'Ball' },
  { letter: 'C', word: 'Cat' },
  { letter: 'D', word: 'Dog' },
  { letter: 'E', word: 'Egg' },
  { letter: 'F', word: 'Fish' },
  { letter: 'G', word: 'Goat' },
  { letter: 'H', word: 'Hat' },
  { letter: 'I', word: 'Ice' },
  { letter: 'J', word: 'Jam' },
  { letter: 'K', word: 'Kite' },
  { letter: 'L', word: 'Leaf' },
  { letter: 'M', word: 'Moon' },
  { letter: 'N', word: 'Nest' },
  { letter: 'O', word: 'Owl' },
  { letter: 'P', word: 'Pig' },
  { letter: 'Q', word: 'Queen' },
  { letter: 'R', word: 'Rain' },
  { letter: 'S', word: 'Sun' },
  { letter: 'T', word: 'Tree' },
  { letter: 'U', word: 'Umbrella' },
  { letter: 'V', word: 'Van' },
  { letter: 'W', word: 'Wave' },
  { letter: 'X', word: 'Box' },
  { letter: 'Y', word: 'Yarn' },
  { letter: 'Z', word: 'Zoo' },
]

export function letterPool(ageBand: '3-6' | '7-12') {
  return ageBand === '3-6' ? LETTERS.slice(0, 10) : LETTERS
}
