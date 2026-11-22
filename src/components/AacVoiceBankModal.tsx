import { useRef, useState } from 'react'
import type { AacButton } from '../data/aacPresets'

type Props = {
  buttons: AacButton[]
  voiceBank: Record<string, string>
  onSave: (buttonId: string, dataUrl: string) => void
  onClear: (buttonId: string) => void
  onClose: () => void
}

/** Guided voice banking — record a caregiver/sibling voice per key word. */
export function AacVoiceBankModal({ buttons, voiceBank, onSave, onClear, onClose }: Props) {
  const [activeId, setActiveId] = useState(buttons[0]?.id ?? '')
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState('')
  const media = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

  const start = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      chunks.current = []
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data)
      }
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string' && activeId) onSave(activeId, reader.result)
        }
        reader.readAsDataURL(blob)
        setRecording(false)
      }
      media.current = rec
      rec.start()
      setRecording(true)
    } catch {
      setError('Microphone blocked — allow mic in browser or device settings.')
      setRecording(false)
    }
  }

  const stop = () => {
    media.current?.stop()
    media.current = null
  }

  const core = buttons.filter((b) => b.categoryId === 'core' && !b.masked).slice(0, 24)

  return (
    <div className="aac-voice-bank" role="dialog" aria-label="Voice banking">
      <header className="aac-mulberry-picker-head">
        <h3>Voice banking</h3>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Close
        </button>
      </header>
      <p className="fine-print">
        Record a parent or sibling saying each word. Soft Steps prefers this clip over TTS.
      </p>
      {error ? <p className="empty-note">{error}</p> : null}
      <div className="toggle-row wrap">
        {core.map((b) => (
          <button
            key={b.id}
            type="button"
            className={`chip ${activeId === b.id ? 'is-active' : ''}`}
            onClick={() => setActiveId(b.id)}
          >
            {b.emoji} {b.label}
            {voiceBank[b.id] ? ' ✓' : ''}
          </button>
        ))}
      </div>
      <div className="aac-voice-bank-actions">
        {!recording ? (
          <button type="button" className="btn btn-primary" disabled={!activeId} onClick={() => void start()}>
            Record “{core.find((b) => b.id === activeId)?.label ?? 'word'}”
          </button>
        ) : (
          <button type="button" className="btn btn-secondary" onClick={stop}>
            Stop &amp; save
          </button>
        )}
        {activeId && voiceBank[activeId] ? (
          <>
            <audio src={voiceBank[activeId]} controls />
            <button type="button" className="btn btn-ghost" onClick={() => onClear(activeId)}>
              Clear clip
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
