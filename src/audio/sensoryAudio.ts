/** Shared sensory audio flags for Web Audio + speech (kept outside React). */

export type AudioSensory = {
  softAudio: boolean
  muteCelebrations: boolean
  reducedMotion: boolean
}

let state: AudioSensory = {
  softAudio: false,
  muteCelebrations: false,
  reducedMotion: false,
}

export function setAudioSensory(next: Partial<AudioSensory>) {
  state = { ...state, ...next }
}

export function getAudioSensory() {
  return state
}
