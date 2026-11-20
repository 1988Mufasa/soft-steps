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
  const osc = audio.createOscillator()
  const g = audio.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.value = gain
  g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration)
  osc.connect(g)
  g.connect(audio.destination)
  osc.start()
  osc.stop(audio.currentTime + duration)
}

export function playCorrect(soundOn: boolean) {
  if (!soundOn) return
  try {
    tone(523.25, 0.18, 'sine', 0.07)
    window.setTimeout(() => tone(659.25, 0.22, 'sine', 0.06), 90)
  } catch {
    /* ignore audio errors */
  }
}

export function playGentleNudge(soundOn: boolean) {
  if (!soundOn) return
  try {
    tone(392, 0.16, 'triangle', 0.04)
  } catch {
    /* ignore */
  }
}

export function playTap(soundOn: boolean) {
  if (!soundOn) return
  try {
    tone(440, 0.06, 'sine', 0.03)
  } catch {
    /* ignore */
  }
}
