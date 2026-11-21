import { softBubblePop, speakText } from './calmAudio'
import type { AacButton, AacPrefs } from '../data/aacPresets'

let activeClip: HTMLAudioElement | null = null
let boostCtx: AudioContext | null = null

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

function aacSpeakOpts(prefs: AacPrefs) {
  return {
    pitch: prefs.speechPitch,
    rate: prefs.speechRate,
    forceFullVolume: prefs.classroomVolumeBoost,
    volume: prefs.classroomVolumeBoost ? 1 : undefined,
  }
}

/** Play a custom clip; classroom boost routes through a GainNode > 1. */
function playClip(dataUrl: string, prefs: AacPrefs, fallbackText: string) {
  stopClip()
  try {
    window.speechSynthesis?.cancel()
  } catch {
    /* ignore */
  }

  const audio = new Audio(dataUrl)
  activeClip = audio

  if (prefs.classroomVolumeBoost) {
    try {
      if (!boostCtx) boostCtx = new AudioContext()
      if (boostCtx.state === 'suspended') void boostCtx.resume()
      const src = boostCtx.createMediaElementSource(audio)
      const gain = boostCtx.createGain()
      // Mild boost for noisy rooms (clips stay under clipping threshold)
      gain.gain.value = 1.55
      src.connect(gain)
      gain.connect(boostCtx.destination)
      void audio.play().catch(() => {
        speakText(fallbackText, true, aacSpeakOpts(prefs))
      })
      return
    } catch {
      // Fall through to element volume
    }
  }

  audio.volume = prefs.classroomVolumeBoost ? 1 : 1
  void audio.play().catch(() => {
    speakText(fallbackText, true, aacSpeakOpts(prefs))
  })
}

/** Prefer custom recorded voice; else on-device TTS with AAC pitch/rate. */
export function speakAacButton(btn: AacButton, soundOn: boolean, prefs: AacPrefs) {
  if (!soundOn) return
  if (prefs.tapSounds) softBubblePop(true)

  const text = (btn.speak || btn.label).trim()
  if (btn.audioDataUrl) {
    playClip(btn.audioDataUrl, prefs, text)
    return
  }

  speakText(text, true, aacSpeakOpts(prefs))
}

export function speakAacSentence(buttons: AacButton[], soundOn: boolean, prefs: AacPrefs) {
  if (!soundOn || !buttons.length) return
  const text = buttons.map((b) => b.speak || b.label).join(' ')
  speakText(text, true, aacSpeakOpts(prefs))
}

export function speakAboutMe(text: string, soundOn: boolean, prefs: AacPrefs) {
  speakText(text.trim(), soundOn, {
    ...aacSpeakOpts(prefs),
    rate: Math.min(prefs.speechRate, 0.95),
  })
}

/** Quick attention / “Excuse me — look!” across the room. */
export function speakAttention(phrase: string, soundOn: boolean, prefs: AacPrefs) {
  if (!soundOn) return
  stopClip()
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.value = prefs.classroomVolumeBoost ? 0.22 : 0.12
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
    forceFullVolume: true,
    volume: 1,
  })
  try {
    navigator.vibrate?.([80, 40, 80])
  } catch {
    /* ignore */
  }
}
