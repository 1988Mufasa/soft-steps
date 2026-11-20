export type AacCard = {
  id: string
  label: string
  emoji: string
}

export type AacBoard = {
  id: string
  title: string
  cards: AacCard[]
}

const MORNING: AacBoard = {
  id: 'morning',
  title: 'Morning',
  cards: [
    { id: 'hello', label: 'Hello', emoji: '👋' },
    { id: 'eat', label: 'Eat', emoji: '🥣' },
    { id: 'drink', label: 'Drink', emoji: '🥛' },
    { id: 'bathroom', label: 'Bathroom', emoji: '🚽' },
    { id: 'clothes', label: 'Clothes', emoji: '👕' },
    { id: 'help', label: 'Help', emoji: '🤝' },
    { id: 'more', label: 'More', emoji: '➕' },
    { id: 'break', label: 'Break', emoji: '⏸️' },
  ],
}

const MIDDAY: AacBoard = {
  id: 'midday',
  title: 'Meal time',
  cards: [
    { id: 'hungry', label: 'Hungry', emoji: '😋' },
    { id: 'food', label: 'Food', emoji: '🍽️' },
    { id: 'water', label: 'Water', emoji: '💧' },
    { id: 'fruit', label: 'Fruit', emoji: '🍎' },
    { id: 'alldone', label: 'All done', emoji: '✅' },
    { id: 'please', label: 'Please', emoji: '🙏' },
    { id: 'thankyou', label: 'Thank you', emoji: '💛' },
    { id: 'break', label: 'Break', emoji: '⏸️' },
  ],
}

const AFTERNOON: AacBoard = {
  id: 'afternoon',
  title: 'Afternoon',
  cards: [
    { id: 'play', label: 'Play', emoji: '🧩' },
    { id: 'outside', label: 'Outside', emoji: '🌳' },
    { id: 'quiet', label: 'Quiet', emoji: '🤫' },
    { id: 'music', label: 'Music', emoji: '🎵' },
    { id: 'help', label: 'Help', emoji: '🤝' },
    { id: 'stop', label: 'Stop', emoji: '🛑' },
    { id: 'yes', label: 'Yes', emoji: '👍' },
    { id: 'no', label: 'No', emoji: '👎' },
  ],
}

const EVENING: AacBoard = {
  id: 'evening',
  title: 'Bedtime',
  cards: [
    { id: 'tired', label: 'Tired', emoji: '😴' },
    { id: 'bath', label: 'Bath', emoji: '🛁' },
    { id: 'pajamas', label: 'Pajamas', emoji: '🩱' },
    { id: 'story', label: 'Story', emoji: '📖' },
    { id: 'hug', label: 'Hug', emoji: '🤗' },
    { id: 'lightsoff', label: 'Lights soft', emoji: '🌙' },
    { id: 'water', label: 'Water', emoji: '💧' },
    { id: 'goodnight', label: 'Good night', emoji: '🌃' },
  ],
}

export function boardForHour(hour = new Date().getHours()): AacBoard {
  if (hour >= 5 && hour < 11) return MORNING
  if (hour >= 11 && hour < 14) return MIDDAY
  if (hour >= 14 && hour < 18) return AFTERNOON
  return EVENING
}

export const AAC_BOARDS = [MORNING, MIDDAY, AFTERNOON, EVENING]

export const SCHEDULE_LIBRARY = [
  { id: 'shoes', label: 'Shoes', emoji: '👟' },
  { id: 'brush', label: 'Brush teeth', emoji: '🪥' },
  { id: 'backpack', label: 'Backpack', emoji: '🎒' },
  { id: 'car', label: 'Car', emoji: '🚗' },
  { id: 'school', label: 'School', emoji: '🏫' },
  { id: 'park', label: 'Park', emoji: '🌳' },
  { id: 'snack', label: 'Snack', emoji: '🍎' },
  { id: 'homework', label: 'Homework', emoji: '📘' },
  { id: 'bath', label: 'Bath', emoji: '🛁' },
  { id: 'bed', label: 'Bed', emoji: '🛏️' },
  { id: 'tablet', label: 'Tablet time', emoji: '📱' },
  { id: 'calm', label: 'Calm space', emoji: '🫧' },
]
