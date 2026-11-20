export type ShapeItem = {
  id: string
  name: string
  path: string
  viewBox?: string
}

export const SHAPES: ShapeItem[] = [
  {
    id: 'circle',
    name: 'Circle',
    path: 'M50 10a40 40 0 1 0 0.1 0z',
  },
  {
    id: 'square',
    name: 'Square',
    path: 'M18 18h64v64H18z',
  },
  {
    id: 'triangle',
    name: 'Triangle',
    path: 'M50 14 L90 86 H10 Z',
  },
  {
    id: 'star',
    name: 'Star',
    path: 'M50 12 L61 42 L92 42 L67 62 L76 92 L50 74 L24 92 L33 62 L8 42 L39 42 Z',
  },
  {
    id: 'heart',
    name: 'Heart',
    path: 'M50 86 C20 62 12 40 28 26 C40 16 50 24 50 24 C50 24 60 16 72 26 C88 40 80 62 50 86 Z',
  },
  {
    id: 'oval',
    name: 'Oval',
    path: 'M50 18a28 36 0 1 0 0.1 0z',
  },
  {
    id: 'diamond',
    name: 'Diamond',
    path: 'M50 10 L90 50 L50 90 L10 50 Z',
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    path: 'M30 18 H70 L90 50 L70 82 H30 L10 50 Z',
  },
]

export function shapePool(ageBand: '3-6' | '7-12') {
  return ageBand === '3-6' ? SHAPES.slice(0, 4) : SHAPES
}
