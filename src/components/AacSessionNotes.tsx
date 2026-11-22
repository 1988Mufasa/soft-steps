import { useState } from 'react'
import { uid, type AacSessionNote } from '../data/aacExtras'

type Props = {
  notes: AacSessionNote[]
  onChange: (notes: AacSessionNote[]) => void
  onClose: () => void
}

export function AacSessionNotes({ notes, onChange, onClose }: Props) {
  const [text, setText] = useState('')
  const [author, setAuthor] = useState('SLP')

  const add = () => {
    const t = text.trim()
    if (!t) return
    onChange([
      { id: uid('note'), at: Date.now(), text: t.slice(0, 500), author: author.trim() || 'SLP' },
      ...notes,
    ].slice(0, 40))
    setText('')
  }

  return (
    <div className="aac-session-notes" role="dialog" aria-label="Therapist session notes">
      <header className="aac-mulberry-picker-head">
        <h3>Session notes</h3>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Close
        </button>
      </header>
      <p className="fine-print">On-device only — never uploaded. Useful for IEP / therapy notes.</p>
      <input
        className="field"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Author (SLP / parent)"
        aria-label="Note author"
      />
      <textarea
        className="field"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. Modeled I + want + water; used Food folder"
        aria-label="Session note"
      />
      <button type="button" className="btn btn-primary" onClick={add} disabled={!text.trim()}>
        Add note
      </button>
      <ul className="aac-notes-list">
        {notes.map((n) => (
          <li key={n.id}>
            <strong>{n.author}</strong>{' '}
            <span className="fine-print">{new Date(n.at).toLocaleString()}</span>
            <p>{n.text}</p>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => onChange(notes.filter((x) => x.id !== n.id))}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
