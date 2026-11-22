import type { CareModuleId, ModuleId } from '../types'

export type LearnDestination = {
  id: string
  title: string
  blurb: string
  emoji: string
  path: string
  kind: 'practice' | 'care' | 'extra'
  moduleId?: ModuleId
  careId?: CareModuleId
  /** Requires onlineExtrasEnabled */
  extras?: boolean
}

/** Learning games + care tools kids open from the AAC board. */
export const AAC_LEARN_DESTINATIONS: LearnDestination[] = [
  {
    id: 'abc',
    title: 'ABCs',
    blurb: 'Letter adventure',
    emoji: '🔤',
    path: '/abc',
    kind: 'practice',
    moduleId: 'abc',
  },
  {
    id: 'shapes',
    title: 'Shapes',
    blurb: 'Shape hunt',
    emoji: '🔷',
    path: '/shapes',
    kind: 'practice',
    moduleId: 'shapes',
  },
  {
    id: 'colors',
    title: 'Colors',
    blurb: 'Color quest',
    emoji: '🎨',
    path: '/colors',
    kind: 'practice',
    moduleId: 'colors',
  },
  {
    id: 'numbers',
    title: 'Numbers',
    blurb: 'Counting stars',
    emoji: '🔢',
    path: '/numbers',
    kind: 'practice',
    moduleId: 'numbers',
  },
  {
    id: 'signs',
    title: 'Signs',
    blurb: 'Sign language games',
    emoji: '🤟',
    path: '/signs',
    kind: 'practice',
    moduleId: 'signs',
  },
  {
    id: 'foods',
    title: 'Pictures',
    blurb: 'Foods, animals & more',
    emoji: '🍎',
    path: '/foods',
    kind: 'practice',
    moduleId: 'foods',
  },
  {
    id: 'schedule',
    title: 'First / Then',
    blurb: 'Routine & rewards',
    emoji: '1️⃣',
    path: '/schedule',
    kind: 'care',
    careId: 'schedule',
  },
  {
    id: 'calm',
    title: 'Calm',
    blurb: 'Quiet tools',
    emoji: '🫧',
    path: '/calm',
    kind: 'care',
    careId: 'calm',
  },
  {
    id: 'checkin',
    title: 'Feelings board',
    blurb: 'Check-in words',
    emoji: '💛',
    path: '/check-in',
    kind: 'care',
    careId: 'checkin',
  },
  {
    id: 'stories',
    title: 'Stories',
    blurb: 'What to expect',
    emoji: '📖',
    path: '/stories',
    kind: 'care',
    careId: 'stories',
  },
  {
    id: 'videos',
    title: 'Videos',
    blurb: 'Offline lessons',
    emoji: '🎬',
    path: '/videos',
    kind: 'care',
    careId: 'videos',
  },
  {
    id: 'extra',
    title: 'Extra games',
    blurb: 'Mix quiz & match',
    emoji: '⭐',
    path: '/online',
    kind: 'extra',
    extras: true,
  },
]
