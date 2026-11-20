import { useEffect, useState } from 'react'
import { previewVoice } from '../audio/calmAudio'
import {
  ensureVoicesLoaded,
  type VoiceOption,
  type VoiceStyle,
} from '../audio/voices'

type Props = {
  voiceURI: string
  voiceStyle: VoiceStyle
  onChange: (next: { voiceURI: string; voiceStyle: VoiceStyle }) => void
}

const STYLES: { id: VoiceStyle; label: string; blurb: string }[] = [
  { id: 'child', label: 'Kid-friendly', blurb: 'Brighter, playful' },
  { id: 'gentle', label: 'Gentle', blurb: 'Softer and slower' },
  { id: 'clear', label: 'Clear', blurb: 'Natural & easy to hear' },
]

export function VoicePicker({ voiceURI, voiceStyle, onChange }: Props) {
  const [voices, setVoices] = useState<VoiceOption[]>([])

  useEffect(() => {
    let cancelled = false
    void ensureVoicesLoaded().then((list) => {
      if (!cancelled) setVoices(list)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const high = voices.filter((v) => v.quality === 'high')
  const good = voices.filter((v) => v.quality === 'good')
  const basic = voices.filter((v) => v.quality === 'basic')
  const shown = [...high, ...good, ...basic].slice(0, 24)

  return (
    <div className="voice-picker">
      <p>
        Soft Steps uses your Mac’s best built-in voices (offline). Pick one and tap Preview.
      </p>

      <div className="toggle-row wrap">
        {STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`chip ${voiceStyle === s.id ? 'is-active' : ''}`}
            onClick={() => onChange({ voiceURI, voiceStyle: s.id })}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="fine-print">
        Style: {STYLES.find((s) => s.id === voiceStyle)?.blurb}
      </p>

      <label className="voice-select-label" htmlFor="soft-steps-voice">
        Voice
      </label>
      <select
        id="soft-steps-voice"
        className="voice-select"
        value={voiceURI}
        onChange={(e) => onChange({ voiceURI: e.target.value, voiceStyle })}
      >
        <option value="">Auto — best quality on this Mac</option>
        {shown.map((v) => (
          <option key={v.uri} value={v.uri}>
            {v.quality === 'high' ? '★ ' : ''}
            {v.name} ({v.lang})
          </option>
        ))}
      </select>

      <div className="confirm-row">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => previewVoice()}
        >
          Preview voice
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => onChange({ voiceURI: '', voiceStyle: 'child' })}
        >
          Reset to auto
        </button>
      </div>

      <p className="fine-print">
        For even better sound on a Mac: System Settings → Accessibility → Spoken Content →
        System Voice → Manage Voices… Download an <strong>Enhanced</strong> or{' '}
        <strong>Premium</strong> English voice (Samantha, Ava, Zoe), then reopen Soft Steps and
        Preview again.
      </p>
    </div>
  )
}
