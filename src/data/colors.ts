export type ColorItem = {
  id: string
  name: string
  hex: string
}

export const COLORS: ColorItem[] = [
  { id: 'red', name: 'Red', hex: '#E57373' },
  { id: 'blue', name: 'Blue', hex: '#64B5F6' },
  { id: 'yellow', name: 'Yellow', hex: '#F6D55C' },
  { id: 'green', name: 'Green', hex: '#81C784' },
  { id: 'orange', name: 'Orange', hex: '#FFB74D' },
  { id: 'purple', name: 'Purple', hex: '#BA68C8' },
  { id: 'pink', name: 'Pink', hex: '#F48FB1' },
  { id: 'brown', name: 'Brown', hex: '#A1887F' },
  { id: 'black', name: 'Black', hex: '#455A64' },
  { id: 'white', name: 'White', hex: '#FAFAFA' },
]

export function colorPool(ageBand: '3-6' | '7-12') {
  return ageBand === '3-6' ? COLORS.slice(0, 5) : COLORS
}
