import { resolveVoice, styleToProsody, getSpeechPrefs, ensureVoicesLoaded } from './voices'

let ctx: AudioContext | null = null
let drone: { osc: OscillatorNode; gain: GainNode } | null = null

function getCtx() {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

// Warm voice list early (macOS / Chrome load async)
void ensureVoicesLoaded()

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
 * Soft Steps speech — prefers high-quality / premium system voices,
 * with parent-chosen voice + style when set.
 */
export function speakText(text: string, soundOn: boolean) {
  if (!soundOn || !('speechSynthesis' in window)) return
  try {
    window.speechSynthesis.cancel()
    const prefs = getSpeechPrefs()
    const prosody = styleToProsody(prefs.style)
    const u = new SpeechSynthesisUtterance(text)
    const voice = resolveVoice()
    if (voice) u.voice = voice
    u.pitch = prosody.pitch
    u.rate = prosody.rate
    u.volume = 1
    // Some engines need a tiny delay after cancel to apply the new voice
    window.setTimeout(() => {
      try {
        window.speechSynthesis.speak(u)
      } catch {
        /* ignore */
      }
    }, 40)
  } catch {
    /* ignore */
  }
}

/** Preview helper for Parent tools — always speaks a short sample. */
export function previewVoice(sample = 'Hi! Soft Steps is ready to learn with you.') {
  speakText(sample, true)
}
