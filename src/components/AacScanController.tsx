import { useEffect, useMemo, useRef, useState } from 'react'
import type { AacButton } from '../data/aacPresets'

type Props = {
  buttons: AacButton[]
  speedMs: number
  enabled: boolean
  onSelect: (btn: AacButton) => void
  highlightId: string | null
  setHighlightId: (id: string | null) => void
}

/**
 * Simple 1-switch scanning: auto-highlights tiles; Space / Enter / tap Scan Select activates.
 */
export function AacScanController({
  buttons,
  speedMs,
  enabled,
  onSelect,
  highlightId,
  setHighlightId,
}: Props) {
  const list = useMemo(() => buttons.filter((b) => !b.masked), [buttons])
  const idsKey = list.map((b) => b.id).join('|')
  const [idx, setIdx] = useState(0)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const setHighlightRef = useRef(setHighlightId)
  setHighlightRef.current = setHighlightId
  const listRef = useRef(list)
  listRef.current = list
  const idxRef = useRef(idx)
  idxRef.current = idx

  useEffect(() => {
    setIdx(0)
  }, [idsKey])

  useEffect(() => {
    if (!enabled || !list.length) {
      setHighlightRef.current(null)
      return
    }
    setHighlightRef.current(list[idx % list.length]?.id ?? null)
  }, [enabled, idsKey, idx, list])

  useEffect(() => {
    if (!enabled || !list.length) return
    const t = window.setInterval(() => {
      setIdx((i) => (i + 1) % Math.max(listRef.current.length, 1))
    }, speedMs)
    return () => window.clearInterval(t)
  }, [enabled, idsKey, speedMs, list.length])

  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return
      e.preventDefault()
      const current = listRef.current
      const btn = current[idxRef.current % current.length]
      if (btn) onSelectRef.current(btn)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled])

  if (!enabled) return null

  return (
    <div className="aac-scan-bar" role="group" aria-label="Switch scanning">
      <span className="fine-print">
        Scanning {highlightId ? `· ${list.find((b) => b.id === highlightId)?.label ?? ''}` : ''}
      </span>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          const btn = list[idx % list.length]
          if (btn) onSelect(btn)
        }}
      >
        Select
      </button>
    </div>
  )
}
