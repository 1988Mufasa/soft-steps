export type FoodKind = 'fruit' | 'veg'

export type FoodItem = {
  id: string
  name: string
  emoji: string
  kind: FoodKind
  /** Soft color accent for cards */
  tint: string
  ages: Array<'3-6' | '7-12'>
}

/** Calm, everyday produce for offline recognition games. */
export const FOODS: FoodItem[] = [
  // Fruits
  { id: 'apple', name: 'Apple', emoji: '🍎', kind: 'fruit', tint: '#f5c4c4', ages: ['3-6', '7-12'] },
  { id: 'banana', name: 'Banana', emoji: '🍌', kind: 'fruit', tint: '#ffe9a8', ages: ['3-6', '7-12'] },
  { id: 'orange', name: 'Orange', emoji: '🍊', kind: 'fruit', tint: '#ffd4a8', ages: ['3-6', '7-12'] },
  { id: 'grape', name: 'Grape', emoji: '🍇', kind: 'fruit', tint: '#e0d0f0', ages: ['3-6', '7-12'] },
  { id: 'strawberry', name: 'Strawberry', emoji: '🍓', kind: 'fruit', tint: '#ffc9d4', ages: ['3-6', '7-12'] },
  { id: 'watermelon', name: 'Watermelon', emoji: '🍉', kind: 'fruit', tint: '#c8f0d4', ages: ['3-6', '7-12'] },
  { id: 'pear', name: 'Pear', emoji: '🍐', kind: 'fruit', tint: '#e4f0c4', ages: ['7-12'] },
  { id: 'peach', name: 'Peach', emoji: '🍑', kind: 'fruit', tint: '#ffdcc8', ages: ['7-12'] },
  { id: 'blueberry', name: 'Blueberry', emoji: '🫐', kind: 'fruit', tint: '#d0daf0', ages: ['7-12'] },
  { id: 'cherry', name: 'Cherry', emoji: '🍒', kind: 'fruit', tint: '#f0c0c8', ages: ['7-12'] },
  // Vegetables
  { id: 'carrot', name: 'Carrot', emoji: '🥕', kind: 'veg', tint: '#ffd8b0', ages: ['3-6', '7-12'] },
  { id: 'broccoli', name: 'Broccoli', emoji: '🥦', kind: 'veg', tint: '#c8e8c8', ages: ['3-6', '7-12'] },
  { id: 'corn', name: 'Corn', emoji: '🌽', kind: 'veg', tint: '#fff0b0', ages: ['3-6', '7-12'] },
  { id: 'tomato', name: 'Tomato', emoji: '🍅', kind: 'veg', tint: '#ffc8c0', ages: ['3-6', '7-12'] },
  { id: 'potato', name: 'Potato', emoji: '🥔', kind: 'veg', tint: '#e8dcc8', ages: ['3-6', '7-12'] },
  { id: 'cucumber', name: 'Cucumber', emoji: '🥒', kind: 'veg', tint: '#d0f0d8', ages: ['3-6', '7-12'] },
  { id: 'pepper', name: 'Pepper', emoji: '🫑', kind: 'veg', tint: '#d4f0c8', ages: ['7-12'] },
  { id: 'onion', name: 'Onion', emoji: '🧅', kind: 'veg', tint: '#f0e0d0', ages: ['7-12'] },
  { id: 'lettuce', name: 'Lettuce', emoji: '🥬', kind: 'veg', tint: '#d8f5d0', ages: ['7-12'] },
  { id: 'mushroom', name: 'Mushroom', emoji: '🍄', kind: 'veg', tint: '#e8d8d0', ages: ['7-12'] },
]

export function foodPool(ageBand: '3-6' | '7-12', kind?: FoodKind) {
  return FOODS.filter((f) => f.ages.includes(ageBand) && (!kind || f.kind === kind))
}
