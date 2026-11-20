export type VoiceStyle = 'child' | 'gentle' | 'clear'

export type VoiceOption = {
  uri: string
  name: string
  lang: string
  quality: 'high' | 'good' | 'basic'
  score: number
}

type SpeechPrefs = {
  voiceURI: string
  style: VoiceStyle
}

let prefs: SpeechPrefs = {
  voiceURI: '',
  style: 'child',
}

let cached: VoiceOption[] | null = null

export function setSpeechPrefs(next: Partial<SpeechPrefs>) {
  prefs = { ...prefs, ...next }
}

export function getSpeechPrefs() {
  return prefs
}

function scoreVoice(v: SpeechSynthesisVoice): { score: number; quality: VoiceOption['quality'] } {
  const name = `${v.name} ${v.lang}`.toLowerCase()
  let score = 0

  // High-quality / neural / premium packs (macOS, Edge, Chrome)
  if (/premium|enhanced|neural|natural|superstar|wavenet|studio|online \(natural\)/.test(name)) {
    score += 120
  }
  if (/siri|ava|zoe|allison|susan|kathy|karen|moira|tessa|fiona|veena|samantha/.test(name)) {
    score += 70
  }
  if (/google us english|google uk english female|microsoft (aria|jenny|emma|sonia)/.test(name)) {
    score += 65
  }
  if (/child|kid|kids|junior/.test(name)) score += 55
  if (/female|woman|girl/.test(name)) score += 15
  if (v.localService) score += 10
  if (/^en(-|_)|en$/.test(v.lang.toLowerCase()) || name.includes('english')) score += 25

  // Deprioritize low-quality / robotic
  if (/compact|eloquence|trinoids|zarvox|whisper|bad news|good news|bubbles|boing/.test(name)) {
    score -= 80
  }
  if (/male|man|guy|daniel|alex|fred|tom|david|mark|george/.test(name) && !/female/.test(name)) {
    score -= 25
  }

  const quality: VoiceOption['quality'] =
    score >= 100 ? 'high' : score >= 40 ? 'good' : 'basic'
  return { score, quality }
}

export function listSpeechVoices(): VoiceOption[] {
  if (!('speechSynthesis' in window)) return []
  const raw = window.speechSynthesis.getVoices()
  const options = raw.map((v) => {
    const { score, quality } = scoreVoice(v)
    return {
      uri: v.voiceURI,
      name: v.name,
      lang: v.lang,
      quality,
      score,
    }
  })
  options.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
  cached = options
  return options
}

export function ensureVoicesLoaded(): Promise<VoiceOption[]> {
  if (!('speechSynthesis' in window)) return Promise.resolve([])
  const existing = window.speechSynthesis.getVoices()
  if (existing.length) return Promise.resolve(listSpeechVoices())

  return new Promise((resolve) => {
    const done = () => resolve(listSpeechVoices())
    window.speechSynthesis.addEventListener('voiceschanged', done, { once: true })
    // Fallback if event never fires
    window.setTimeout(done, 700)
  })
}

export function resolveVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  if (prefs.voiceURI) {
    const chosen = voices.find((v) => v.voiceURI === prefs.voiceURI)
    if (chosen) return chosen
  }

  const ranked = listSpeechVoices()
  const best = ranked[0]
  if (!best) return voices[0]
  return voices.find((v) => v.voiceURI === best.uri) || voices[0]
}

export function styleToProsody(style: VoiceStyle): { pitch: number; rate: number } {
  switch (style) {
    case 'gentle':
      return { pitch: 1.15, rate: 0.88 }
    case 'clear':
      return { pitch: 1.05, rate: 0.92 }
    case 'child':
    default:
      // Softer than cartoonish — works better with premium voices
      return { pitch: 1.28, rate: 0.94 }
  }
}

export function getCachedVoiceOptions() {
  return cached ?? listSpeechVoices()
}
