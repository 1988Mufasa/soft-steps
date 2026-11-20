import type { AgeBand } from '../types'

export type MixItem = {
  id: string
  kind: 'letter' | 'number' | 'word'
  prompt: string
  answer: string
  choices: string[]
}

export type MatchStep = {
  id: string
  prompt: string
  answer: string
  choices: string[]
}

export type MatchSequence = {
  id: string
  title: string
  steps: MatchStep[]
}

export type OnlinePack = {
  mixQuiz: MixItem[]
  gentleRounds: MixItem[]
  matchSequences: MatchSequence[]
  fetchedAt: string
  source: 'network-demo'
}

const MIX_YOUNG: MixItem[] = [
  {
    id: 'm1',
    kind: 'letter',
    prompt: 'Which letter makes the “buh” sound?',
    answer: 'B',
    choices: ['B', 'S', 'M', 'T'],
  },
  {
    id: 'm2',
    kind: 'number',
    prompt: 'How many toes on one foot?',
    answer: '5',
    choices: ['5', '2', '3', '10'],
  },
  {
    id: 'm3',
    kind: 'letter',
    prompt: 'Find the letter A',
    answer: 'A',
    choices: ['A', 'Z', 'Q', 'X'],
  },
  {
    id: 'm4',
    kind: 'number',
    prompt: 'What comes after 2?',
    answer: '3',
    choices: ['3', '1', '4', '5'],
  },
  {
    id: 'm5',
    kind: 'word',
    prompt: 'Which word starts with S?',
    answer: 'Sun',
    choices: ['Sun', 'Moon', 'Apple', 'Tree'],
  },
  {
    id: 'm6',
    kind: 'number',
    prompt: 'Count: 1 + 1 =',
    answer: '2',
    choices: ['2', '3', '0', '4'],
  },
]

const MIX_OLDER: MixItem[] = [
  ...MIX_YOUNG,
  {
    id: 'm7',
    kind: 'letter',
    prompt: 'Which letter ends the word “cat”?',
    answer: 'T',
    choices: ['T', 'C', 'A', 'K'],
  },
  {
    id: 'm8',
    kind: 'number',
    prompt: 'What is 4 + 3?',
    answer: '7',
    choices: ['7', '6', '8', '5'],
  },
  {
    id: 'm9',
    kind: 'word',
    prompt: 'Which word rhymes with “light”?',
    answer: 'Night',
    choices: ['Night', 'Nest', 'Lamp', 'Book'],
  },
  {
    id: 'm10',
    kind: 'number',
    prompt: 'Which number is even?',
    answer: '8',
    choices: ['8', '7', '9', '5'],
  },
]

const MATCH_YOUNG: MatchSequence[] = [
  {
    id: 'seq1',
    title: 'Letter → number → color',
    steps: [
      {
        id: 's1',
        prompt: 'Step 1 — Find the letter C',
        answer: 'C',
        choices: ['C', 'G', 'O', 'Q'],
      },
      {
        id: 's2',
        prompt: 'Step 2 — Find the number 3',
        answer: '3',
        choices: ['3', '5', '1', '8'],
      },
      {
        id: 's3',
        prompt: 'Step 3 — Find blue',
        answer: 'Blue',
        choices: ['Blue', 'Red', 'Yellow', 'Green'],
      },
    ],
  },
  {
    id: 'seq2',
    title: 'Shape story',
    steps: [
      {
        id: 's1',
        prompt: 'Step 1 — Find the circle',
        answer: 'Circle',
        choices: ['Circle', 'Square', 'Star', 'Heart'],
      },
      {
        id: 's2',
        prompt: 'Step 2 — Find the letter O (looks round)',
        answer: 'O',
        choices: ['O', 'I', 'L', 'T'],
      },
      {
        id: 's3',
        prompt: 'Step 3 — How many sides does a triangle have?',
        answer: '3',
        choices: ['3', '4', '2', '5'],
      },
    ],
  },
]

const MATCH_OLDER: MatchSequence[] = [
  ...MATCH_YOUNG,
  {
    id: 'seq3',
    title: 'Word path',
    steps: [
      {
        id: 's1',
        prompt: 'Step 1 — Which starts with M?',
        answer: 'Moon',
        choices: ['Moon', 'Sun', 'Tree', 'Ball'],
      },
      {
        id: 's2',
        prompt: 'Step 2 — 5 + 5 =',
        answer: '10',
        choices: ['10', '9', '11', '15'],
      },
      {
        id: 's3',
        prompt: 'Step 3 — Which is a shape with 4 equal sides?',
        answer: 'Square',
        choices: ['Square', 'Circle', 'Triangle', 'Oval'],
      },
      {
        id: 's4',
        prompt: 'Step 4 — Pick the color of grass',
        answer: 'Green',
        choices: ['Green', 'Blue', 'Red', 'Purple'],
      },
    ],
  },
]

/** Simulates a short network fetch for online activity packs. Rejects when offline. */
export async function fetchOnlinePack(ageBand: AgeBand, signal?: AbortSignal): Promise<OnlinePack> {
  if (!navigator.onLine) {
    throw new Error('OFFLINE')
  }

  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => resolve(), 450)
    const onAbort = () => {
      window.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    if (signal?.aborted) {
      onAbort()
      return
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })

  if (!navigator.onLine) {
    throw new Error('OFFLINE')
  }

  const mix = ageBand === '3-6' ? MIX_YOUNG : MIX_OLDER
  return {
    mixQuiz: mix,
    gentleRounds: mix.filter((_, i) => i % 2 === 0).concat(mix.filter((_, i) => i % 2 === 1)),
    matchSequences: ageBand === '3-6' ? MATCH_YOUNG : MATCH_OLDER,
    fetchedAt: new Date().toISOString(),
    source: 'network-demo',
  }
}
