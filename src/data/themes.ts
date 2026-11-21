import type { ModuleId } from '../types'
import type { FoodKind } from './foods'
import type { VideoCategory } from './videos'

export type WeekThemeId = 'fruit' | 'veg' | 'animals' | 'feelings' | 'letters' | 'calm' | 'objects'

export type WeekTheme = {
  id: WeekThemeId
  title: string
  emoji: string
  blurb: string
  practice: ModuleId
  foodKind?: FoodKind
  storyId?: string
  videoCategory?: VideoCategory
}

export const WEEK_THEMES: WeekTheme[] = [
  {
    id: 'fruit',
    title: 'Fruit week',
    emoji: '🍎',
    blurb: 'Taste the rainbow — fruit games & stories.',
    practice: 'foods',
    foodKind: 'fruit',
    storyId: 'school',
    videoCategory: 'foods',
  },
  {
    id: 'veg',
    title: 'Veggie week',
    emoji: '🥕',
    blurb: 'Crunchy greens and calm kitchen practice.',
    practice: 'foods',
    foodKind: 'veg',
    videoCategory: 'foods',
  },
  {
    id: 'animals',
    title: 'Animal week',
    emoji: '🐶',
    blurb: 'Meet friendly animals in games & signs.',
    practice: 'foods',
    foodKind: 'animal',
    videoCategory: 'feelings',
  },
  {
    id: 'feelings',
    title: 'Feelings week',
    emoji: '💛',
    blurb: 'Name feelings and practice calm tools.',
    practice: 'signs',
    storyId: 'doctor',
    videoCategory: 'feelings',
  },
  {
    id: 'letters',
    title: 'Letter week',
    emoji: '🔤',
    blurb: 'Soft ABCs and letter adventures.',
    practice: 'abc',
    videoCategory: 'letters',
  },
  {
    id: 'objects',
    title: 'Everyday week',
    emoji: '👟',
    blurb: 'Shoes, cups, books — daily object games.',
    practice: 'foods',
    foodKind: 'object',
    storyId: 'school',
  },
  {
    id: 'calm',
    title: 'Calm week',
    emoji: '🌊',
    blurb: 'Breathe, quiet tools, and soft stories.',
    practice: 'colors',
    storyId: 'airplane',
    videoCategory: 'calm',
  },
]

function isoWeek(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export function themeForDate(d = new Date()): WeekTheme {
  const week = isoWeek(d)
  return WEEK_THEMES[week % WEEK_THEMES.length]
}
