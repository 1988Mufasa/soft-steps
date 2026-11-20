export function numberPool(ageBand: '3-6' | '7-12') {
  const max = ageBand === '3-6' ? 5 : 20
  return Array.from({ length: max }, (_, i) => i + 1)
}
