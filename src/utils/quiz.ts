export function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function pickChoices<T>(pool: T[], correct: T, count: number, keyFn: (item: T) => string): T[] {
  const others = shuffle(pool.filter((item) => keyFn(item) !== keyFn(correct)))
  return shuffle([correct, ...others.slice(0, Math.max(0, count - 1))])
}

export function choiceCount(ageBand: '3-6' | '7-12') {
  return ageBand === '3-6' ? 2 : 4
}
