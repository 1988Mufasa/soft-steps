import { useEffect, useMemo, useState } from 'react'
import {
  loadMulberryIndex,
  mulberryUrl,
  searchMulberrySymbols,
  type MulberrySymbolMeta,
} from '../data/mulberrySymbols'

type Props = {
  currentFile?: string
  onPick: (file: string) => void
  onClear?: () => void
  onClose: () => void
}

export function AacMulberryPicker({ currentFile, onPick, onClear, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [symbols, setSymbols] = useState<MulberrySymbolMeta[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void loadMulberryIndex().then((idx) => {
      if (!idx) return
      setSymbols(idx.symbols)
      setReady(true)
    })
  }, [])

  const results = useMemo(() => {
    if (!ready) return []
    const fakeIndex = {
      source: '',
      version: '',
      license: '',
      attribution: '',
      count: symbols.length,
      symbols,
    }
    return searchMulberrySymbols(fakeIndex, query, 60)
  }, [query, ready, symbols])

  return (
    <div className="aac-mulberry-picker" role="dialog" aria-label="Pick Mulberry symbol">
      <header className="aac-mulberry-picker-head">
        <h3>Mulberry Symbols</h3>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Close
        </button>
      </header>
      <p className="fine-print">Search {symbols.length || '…'} symbols (CC BY-SA © Steve Lee).</p>
      <input
        className="field"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search: water, apple, help…"
        aria-label="Search Mulberry symbols"
        autoFocus
      />
      {currentFile || onClear ? (
        <div className="toggle-row wrap" style={{ marginTop: '0.5rem' }}>
          {currentFile ? (
            <span className="chip is-active">
              Current: {currentFile.replace(/\.svg$/i, '')}
            </span>
          ) : null}
          {onClear ? (
            <button type="button" className="btn btn-ghost" onClick={onClear}>
              Clear Mulberry
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="aac-mulberry-grid" role="list">
        {results.map((s) => (
          <button
            key={s.file}
            type="button"
            className={`aac-mulberry-item ${currentFile === s.file ? 'is-active' : ''}`}
            role="listitem"
            onClick={() => onPick(s.file)}
            title={s.label}
          >
            <img src={mulberryUrl(s.file)} alt="" loading="lazy" />
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
