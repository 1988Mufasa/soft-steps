let ctx: AudioContext | null = null
let drone: { osc: OscillatorNode; gain: GainNode } | null = null

function getCtx() {
  if (!ctx) ctx = new AudioContext()
  return ctx
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

export function speakText(text: string, soundOn: boolean) {
  if (!soundOn || !('speechSynthesis' in window)) return
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.9
    u.pitch = 1
    window.speechSynthesis.speak(u)
  } catch {
    /* ignore */
  }
}
