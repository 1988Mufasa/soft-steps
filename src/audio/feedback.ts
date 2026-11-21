import { getAudioSensory } from './sensoryAudio'

let ctx: AudioContext | null = null

function getCtx() {
  if (!ctx) {
    ctx = new AudioContext()
  }
  return ctx
}

function tone(freq: number, duration: number, type: OscillatorType, gain = 0.08) {
  const audio = getCtx()
  if (audio.state === 'suspended') void audio.resume()
  const { softAudio, muteCelebrations } = getAudioSensory()
  if (muteCelebrations && gain > 0.05) return

  const osc = audio.createOscillator()
  const g = audio.createGain()
  const master = softAudio ? 0.45 : 1
  osc.type = type
  osc.frequency.value = softAudio ? freq * 0.92 : freq
  g.gain.value = gain * master
  g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration * (softAudio ? 1.15 : 1))
  osc.connect(g)
  g.connect(audio.destination)
  osc.start()
  osc.stop(audio.currentTime + duration * (softAudio ? 1.15 : 1))
}

export function playCorrect(soundOn: boolean) {
  if (!soundOn) return
  const { softAudio, muteCelebrations } = getAudioSensory()
  if (muteCelebrations) return
  try {
    const g1 = softAudio ? 0.035 : 0.07
    const g2 = softAudio ? 0.03 : 0.06
    tone(softAudio ? 392 : 523.25, softAudio ? 0.22 : 0.18, 'sine', g1)
    window.setTimeout(
      () => tone(softAudio ? 494 : 659.25, softAudio ? 0.26 : 0.22, 'sine', g2),
      softAudio ? 140 : 90,
    )
  } catch {
    /* ignore audio errors */
  }
}

export function playGentleNudge(soundOn: boolean) {
  if (!soundOn) return
  try {
    const { softAudio } = getAudioSensory()
    tone(softAudio ? 330 : 392, softAudio ? 0.2 : 0.16, 'triangle', softAudio ? 0.022 : 0.04)
  } catch {
    /* ignore */
  }
}

export function playTap(soundOn: boolean) {
  if (!soundOn) return
  try {
    const { softAudio } = getAudioSensory()
    if (softAudio) {
      // Near-silent click — VoiceOver / kids often find taps startling
      tone(380, 0.04, 'sine', 0.012)
      return
    }
    tone(440, 0.06, 'sine', 0.03)
  } catch {
    /* ignore */
  }
}
