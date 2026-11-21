export type FoodKind = 'fruit' | 'veg' | 'animal' | 'body' | 'object'

export type FoodItem = {
  id: string
  name: string
  emoji: string
  kind: FoodKind
  /** Soft color accent for cards */
  tint: string
  ages: Array<'3-6' | '7-12'>
}

export const FOOD_KIND_META: { id: FoodKind; title: string; emoji: string; blurb: string }[] = [
  { id: 'fruit', title: 'Fruits', emoji: '🍎', blurb: 'Apples, berries, and more' },
  { id: 'veg', title: 'Vegetables', emoji: '🥕', blurb: 'Carrots, greens, and more' },
  { id: 'animal', title: 'Animals', emoji: '🐶', blurb: 'Friendly animal friends' },
  { id: 'body', title: 'Body parts', emoji: '👂', blurb: 'Hands, feet, face, and more' },
  { id: 'object', title: 'Daily objects', emoji: '👟', blurb: 'Things we use every day' },
]

/** Calm recognition set: foods + animals + body + objects. */
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
  // Animals
  { id: 'dog', name: 'Dog', emoji: '🐶', kind: 'animal', tint: '#f0e0c8', ages: ['3-6', '7-12'] },
  { id: 'cat', name: 'Cat', emoji: '🐱', kind: 'animal', tint: '#ffe8c8', ages: ['3-6', '7-12'] },
  { id: 'bird', name: 'Bird', emoji: '🐦', kind: 'animal', tint: '#d0e8f8', ages: ['3-6', '7-12'] },
  { id: 'fish', name: 'Fish', emoji: '🐟', kind: 'animal', tint: '#c8e8f0', ages: ['3-6', '7-12'] },
  { id: 'bunny', name: 'Bunny', emoji: '🐰', kind: 'animal', tint: '#f8e8f0', ages: ['3-6', '7-12'] },
  { id: 'horse', name: 'Horse', emoji: '🐴', kind: 'animal', tint: '#e8dcc8', ages: ['3-6', '7-12'] },
  { id: 'cow', name: 'Cow', emoji: '🐮', kind: 'animal', tint: '#f0f0e8', ages: ['7-12'] },
  { id: 'duck', name: 'Duck', emoji: '🦆', kind: 'animal', tint: '#fff0c8', ages: ['7-12'] },
  { id: 'frog', name: 'Frog', emoji: '🐸', kind: 'animal', tint: '#d8f0c8', ages: ['7-12'] },
  { id: 'bear', name: 'Bear', emoji: '🐻', kind: 'animal', tint: '#e8d0b8', ages: ['7-12'] },
  // Body parts
  { id: 'hand', name: 'Hand', emoji: '✋', kind: 'body', tint: '#f5e0d0', ages: ['3-6', '7-12'] },
  { id: 'foot', name: 'Foot', emoji: '🦶', kind: 'body', tint: '#f0d8c8', ages: ['3-6', '7-12'] },
  { id: 'eye', name: 'Eye', emoji: '👁️', kind: 'body', tint: '#d8e8f8', ages: ['3-6', '7-12'] },
  { id: 'ear', name: 'Ear', emoji: '👂', kind: 'body', tint: '#f8e0d0', ages: ['3-6', '7-12'] },
  { id: 'nose', name: 'Nose', emoji: '👃', kind: 'body', tint: '#f8d8d0', ages: ['3-6', '7-12'] },
  { id: 'mouth', name: 'Mouth', emoji: '👄', kind: 'body', tint: '#f8c8d0', ages: ['3-6', '7-12'] },
  { id: 'hair', name: 'Hair', emoji: '💇', kind: 'body', tint: '#e8dcc8', ages: ['7-12'] },
  { id: 'tummy', name: 'Tummy', emoji: '🤰', kind: 'body', tint: '#f0e8d8', ages: ['7-12'] },
  // Daily objects
  { id: 'shoes', name: 'Shoes', emoji: '👟', kind: 'object', tint: '#d0e8f0', ages: ['3-6', '7-12'] },
  { id: 'cup', name: 'Cup', emoji: 'マグカップ', kind: 'object', tint: '#e0f0f8', ages: ['3-6', '7-12'] },
  { id: 'book', name: 'Book', emoji: '📖', kind: 'object', tint: '#f0e0c8', ages: ['3-6', '7-12'] },
  { id: 'ball', name: 'Ball', emoji: '⚽', kind: 'object', tint: '#d8f0d8', ages: ['3-6', '7-12'] },
  { id: 'toothbrush', name: 'Toothbrush', emoji: '🪥', kind: 'object', tint: '#e0f0f0', ages: ['3-6', '7-12'] },
  { id: 'backpack', name: 'Backpack', emoji: '🎒', kind: 'object', tint: '#f0d8d0', ages: ['3-6', '7-12'] },
  { id: 'keys', name: 'Keys', emoji: '🔑', kind: 'object', tint: '#fff0c0', ages: ['7-12'] },
  { id: 'phone', name: 'Phone', emoji: '📱', kind: 'object', tint: '#d8e0f0', ages: ['7-12'] },
  { id: 'hat', name: 'Hat', emoji: '🧢', kind: 'object', tint: '#c8e0f8', ages: ['7-12'] },
  { id: 'towel', name: 'Towel', emoji: '🧺', kind: 'object', tint: '#e8f0f8', ages: ['7-12'] },
]

export function foodPool(ageBand: '3-6' | '7-12', kind?: FoodKind) {
  return FOODS.filter((f) => f.ages.includes(ageBand) && (!kind || f.kind === kind))
}
