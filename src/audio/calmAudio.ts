import { resolveVoice, styleToProsody, getSpeechPrefs, ensureVoicesLoaded } from './voices'
import { getAudioSensory } from './sensoryAudio'

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
    const { softAudio } = getAudioSensory()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = 'sine'
    osc.frequency.value = 174.61
    gain.gain.value = softAudio ? 0.012 : 0.025
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
    const { softAudio } = getAudioSensory()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = 'sine'
    osc.frequency.value = softAudio ? 420 : 520
    gain.gain.value = softAudio ? 0.018 : 0.04
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + (softAudio ? 0.24 : 0.18))
    osc.connect(gain)
    gain.connect(audio.destination)
    osc.start()
    osc.stop(audio.currentTime + (softAudio ? 0.28 : 0.2))
  } catch {
    /* ignore */
  }
}

export type SpeakOverrides = {
  pitch?: number
  rate?: number
}

/**
 * Soft Steps speech — prefers high-quality / premium system voices,
 * with parent-chosen voice + style when set. Soft-audio mode lowers volume
 * and slows rate for sensory-friendly listening / VoiceOver coexistence.
 * Uses on-device Web Speech (iOS AVSpeech / Android TTS under the hood in WebView).
 */
export function speakText(text: string, soundOn: boolean, overrides?: SpeakOverrides) {
  if (!soundOn || !('speechSynthesis' in window)) return
  try {
    window.speechSynthesis.cancel()
    const prefs = getSpeechPrefs()
    const prosody = styleToProsody(prefs.style)
    const { softAudio } = getAudioSensory()
    const u = new SpeechSynthesisUtterance(text)
    const voice = resolveVoice()
    if (voice) u.voice = voice
    const pitch = overrides?.pitch ?? prosody.pitch
    const rate = overrides?.rate ?? prosody.rate
    u.pitch = softAudio ? Math.min(pitch, 1.12) : pitch
    u.rate = softAudio ? Math.min(rate, 0.86) : rate
    u.volume = softAudio ? 0.7 : 1
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
