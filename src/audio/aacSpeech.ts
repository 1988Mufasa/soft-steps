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
