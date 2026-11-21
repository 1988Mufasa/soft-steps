import { softBubblePop, speakText } from './calmAudio'
import type { AacButton, AacPrefs } from '../data/aacPresets'

let activeClip: HTMLAudioElement | null = null

function stopClip() {
  if (!activeClip) return
  try {
    activeClip.pause()
    activeClip.currentTime = 0
  } catch {
    /* ignore */
  }
  activeClip = null
}

/** Prefer custom recorded voice; else on-device TTS with AAC pitch/rate. */
export function speakAacButton(btn: AacButton, soundOn: boolean, prefs: AacPrefs) {
  if (!soundOn) return
  if (prefs.tapSounds) softBubblePop(true)

  if (btn.audioDataUrl) {
    stopClip()
    try {
      window.speechSynthesis?.cancel()
    } catch {
      /* ignore */
    }
    const audio = new Audio(btn.audioDataUrl)
    activeClip = audio
    void audio.play().catch(() => {
      // Fall back to TTS if clip fails
      speakText((btn.speak || btn.label).trim(), true, {
        pitch: prefs.speechPitch,
        rate: prefs.speechRate,
      })
    })
    return
  }

  speakText((btn.speak || btn.label).trim(), true, {
    pitch: prefs.speechPitch,
    rate: prefs.speechRate,
  })
}

export function speakAacSentence(buttons: AacButton[], soundOn: boolean, prefs: AacPrefs) {
  if (!soundOn || !buttons.length) return
  // Sentence playback uses TTS so multi-word messages stay smooth
  const text = buttons.map((b) => b.speak || b.label).join(' ')
  speakText(text, true, {
    pitch: prefs.speechPitch,
    rate: prefs.speechRate,
  })
}

export function speakAboutMe(text: string, soundOn: boolean, prefs: AacPrefs) {
  speakText(text.trim(), soundOn, {
    pitch: prefs.speechPitch,
    rate: Math.min(prefs.speechRate, 0.95),
  })
}

/** Quick attention / “Excuse me — look!” across the room. */
export function speakAttention(phrase: string, soundOn: boolean, prefs: AacPrefs) {
  if (!soundOn) return
  stopClip()
  try {
    // Soft attention chime before the phrase
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.value = 0.12
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    osc.stop(ctx.currentTime + 0.38)
    window.setTimeout(() => void ctx.close().catch(() => undefined), 500)
  } catch {
    /* chime optional */
  }
  speakText((phrase || 'Excuse me! Look!').trim(), true, {
    pitch: Math.min(prefs.speechPitch + 0.1, 1.5),
    rate: Math.max(prefs.speechRate, 0.95),
  })
  try {
    navigator.vibrate?.([80, 40, 80])
  } catch {
    /* ignore */
  }
}
