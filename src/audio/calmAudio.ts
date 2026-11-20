let ctx: AudioContext | null = null
let drone: { osc: OscillatorNode; gain: GainNode } | null = null
let voicesReady = false

function getCtx() {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

function warmVoices() {
  if (!('speechSynthesis' in window)) return
  const load = () => {
    voicesReady = window.speechSynthesis.getVoices().length > 0
  }
  load()
  window.speechSynthesis.addEventListener('voiceschanged', load, { once: true })
}

warmVoices()

/** Prefer a soft / child-like system voice when the OS provides one. */
function pickChildLikeVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  const scored = voices.map((v) => {
    const name = `${v.name} ${v.lang}`.toLowerCase()
    let score = 0
    if (/child|kid|kids|junior|girl|boy/.test(name)) score += 100
    if (/samantha|karen|moira|tessa|fiona|victoria|zoe|allison|susan|jenny/.test(name))
      score += 40
    if (/en-us|en_us|en-gb|en_gb|en-au|en_au/.test(name) || v.lang.toLowerCase().startsWith('en'))
      score += 20
    if (v.localService) score += 5
    if (/male|man|guy|daniel|alex|fred/.test(name) && !/female/.test(name)) score -= 30
    return { v, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.score > 0 ? scored[0].v : voices.find((v) => v.lang.startsWith('en')) || voices[0]
}

export function startSoothingDrone(soundOn: boolean) {
  if (!soundOn) return
  try {
    const audio = getCtx()
    if (audio.state === 'suspended') void audio.resume()
    stopSoothingDrone()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = 'sine'
    osc.frequency.value = 174.61
    gain.gain.value = 0.025
    osc.connect(gain)
    gain.connect(audio.destination)
    osc.start()
    drone = { osc, gain }
  } catch {
    /* ignore */
  }
}

export function stopSoothingDrone() {
  try {
    drone?.osc.stop()
  } catch {
    /* ignore */
  }
  drone = null
}

export function softBubblePop(soundOn: boolean) {
  if (!soundOn) return
  try {
    const audio = getCtx()
    if (audio.state === 'suspended') void audio.resume()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = 'sine'
    osc.frequency.value = 520
    gain.gain.value = 0.04
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.18)
    osc.connect(gain)
    gain.connect(audio.destination)
    osc.start()
    osc.stop(audio.currentTime + 0.2)
  } catch {
    /* ignore */
  }
}

/**
 * Soft child-like TTS for Soft Steps (higher pitch + gentle rate).
 * Uses the best child/soft English voice the device offers.
 */
export function speakText(text: string, soundOn: boolean) {
  if (!soundOn || !('speechSynthesis' in window)) return
  try {
    if (!voicesReady) warmVoices()
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    const voice = pickChildLikeVoice()
    if (voice) u.voice = voice
    // Child-like profile: brighter pitch, clear but not rushed
    u.pitch = 1.55
    u.rate = 0.95
    u.volume = 1
    window.speechSynthesis.speak(u)
  } catch {
    /* ignore */
  }
}
