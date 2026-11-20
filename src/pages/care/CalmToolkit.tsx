import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { softBubblePop, startSoothingDrone, stopSoothingDrone } from '../../audio/calmAudio'
import { useApp } from '../../store/AppContext'

type Tool = 'breathe' | 'liquid' | 'bubbles' | 'sand'

export function CalmToolkit() {
  const { settings } = useApp()
  const [tool, setTool] = useState<Tool>('breathe')
  const [phase, setPhase] = useState<'in' | 'out'>('in')
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number }[]>([])
  const motionOff =
    settings.sensory.reducedMotion || settings.sensory.disableSuddenAnimations

  useEffect(() => {
    if (settings.sensory.soundOn) startSoothingDrone(true)
    return () => stopSoothingDrone()
  }, [settings.sensory.soundOn])

  useEffect(() => {
    if (tool !== 'breathe' || motionOff) return
    const id = window.setInterval(() => setPhase((p) => (p === 'in' ? 'out' : 'in')), 4000)
    return () => window.clearInterval(id)
  }, [tool, motionOff])

  useEffect(() => {
    if (tool !== 'bubbles') return
    setBubbles(
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        x: 8 + ((i * 9) % 84),
        y: 12 + ((i * 13) % 70),
      })),
    )
  }, [tool])

  return (
    <section className="care-page">
      <header className="activity-header">
        <Link to="/" className="back-link">
          ← Home
        </Link>
        <div className="activity-meta">
          <p className="eyebrow offline-tag">Offline</p>
          <h1>Calm toolkit</h1>
        </div>
        <Link to="/meltdown" className="btn btn-secondary" aria-label="Meltdown Mode">
          Quiet mode
        </Link>
      </header>

      <p className="prompt">Pick a sensory tool. Sounds stay soft. Nothing jumps suddenly.</p>

      <div className="tool-picker">
        {(
          [
            ['breathe', 'Breathe'],
            ['liquid', 'Liquid'],
            ['bubbles', 'Bubbles'],
            ['sand', 'Sand'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`chip ${tool === id ? 'is-active' : ''}`}
            onClick={() => setTool(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="calm-stage">
        {tool === 'breathe' ? (
          <div className="breathe-panel">
            <div className={`breathe-orb ${phase} ${motionOff ? 'is-still' : ''}`} />
            <p className="prompt">{motionOff ? 'Hold a steady breath.' : phase === 'in' ? 'Breathe in…' : 'Breathe out…'}</p>
          </div>
        ) : null}
        {tool === 'liquid' ? <div className="liquid-field tall" /> : null}
        {tool === 'sand' ? (
          <button
            type="button"
            className="sand-pad tall"
            aria-label="Move sand"
            onPointerMove={(e) => {
              const t = e.currentTarget
              const r = t.getBoundingClientRect()
              t.style.setProperty('--sx', `${((e.clientX - r.left) / r.width) * 100}%`)
              t.style.setProperty('--sy', `${((e.clientY - r.top) / r.height) * 100}%`)
            }}
          />
        ) : null}
        {tool === 'bubbles' ? (
          <div className="bubble-field tall">
            {bubbles.map((b) => (
              <button
                key={b.id}
                type="button"
                className="bubble"
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
                aria-label="Pop"
                onClick={() => {
                  softBubblePop(settings.sensory.soundOn)
                  setBubbles((list) =>
                    list.length <= 1
                      ? Array.from({ length: 10 }, (_, i) => ({
                          id: Date.now() + i,
                          x: 8 + ((i * 9) % 84),
                          y: 12 + ((i * 13) % 70),
                        }))
                      : list.filter((x) => x.id !== b.id),
                  )
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
