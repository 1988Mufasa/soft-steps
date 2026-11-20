import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { softBubblePop, startSoothingDrone, stopSoothingDrone } from '../../audio/calmAudio'
import { useApp } from '../../store/AppContext'

type Tool = 'breathe' | 'liquid' | 'bubbles' | 'sand'

/** Zero-text emergency calm room. Icons only; aria-labels for assistive tech. */
export function MeltdownMode() {
  const { settings } = useApp()
  const navigate = useNavigate()
  const [tool, setTool] = useState<Tool>('breathe')
  const [phase, setPhase] = useState<'in' | 'out'>('in')
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number }[]>([])
  const motionOff =
    settings.sensory.reducedMotion || settings.sensory.disableSuddenAnimations

  useEffect(() => {
    startSoothingDrone(settings.sensory.soundOn)
    return () => stopSoothingDrone()
  }, [settings.sensory.soundOn])

  useEffect(() => {
    if (tool !== 'breathe' || motionOff) return
    const id = window.setInterval(() => {
      setPhase((p) => (p === 'in' ? 'out' : 'in'))
    }, 4000)
    return () => window.clearInterval(id)
  }, [tool, motionOff])

  useEffect(() => {
    if (tool !== 'bubbles') return
    setBubbles(
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: 10 + ((i * 11) % 80),
        y: 15 + ((i * 17) % 70),
      })),
    )
  }, [tool])

  return (
    <div className="meltdown" data-tool={tool}>
      <div className="meltdown-stage" aria-live="polite">
        {tool === 'breathe' ? (
          <div
            className={`breathe-orb ${phase} ${motionOff ? 'is-still' : ''}`}
            aria-label="Breathing circle"
          />
        ) : null}
        {tool === 'liquid' ? <div className="liquid-field" aria-label="Liquid motion" /> : null}
        {tool === 'sand' ? (
          <button
            type="button"
            className="sand-pad"
            aria-label="Kinetic sand"
            onPointerMove={(e) => {
              const t = e.currentTarget
              const r = t.getBoundingClientRect()
              t.style.setProperty('--sx', `${((e.clientX - r.left) / r.width) * 100}%`)
              t.style.setProperty('--sy', `${((e.clientY - r.top) / r.height) * 100}%`)
            }}
          />
        ) : null}
        {tool === 'bubbles' ? (
          <div className="bubble-field" aria-label="Bubbles">
            {bubbles.map((b) => (
              <button
                key={b.id}
                type="button"
                className="bubble"
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
                aria-label="Pop bubble"
                onClick={() => {
                  softBubblePop(settings.sensory.soundOn)
                  setBubbles((list) => list.filter((x) => x.id !== b.id))
                }}
              />
            ))}
          </div>
        ) : null}
      </div>

      <nav className="meltdown-dock" aria-label="Calm tools">
        <button
          type="button"
          className={tool === 'breathe' ? 'is-active' : ''}
          aria-label="Breathe"
          onClick={() => setTool('breathe')}
        >
          <span aria-hidden="true">◯</span>
        </button>
        <button
          type="button"
          className={tool === 'liquid' ? 'is-active' : ''}
          aria-label="Liquid"
          onClick={() => setTool('liquid')}
        >
          <span aria-hidden="true">〰</span>
        </button>
        <button
          type="button"
          className={tool === 'bubbles' ? 'is-active' : ''}
          aria-label="Bubbles"
          onClick={() => setTool('bubbles')}
        >
          <span aria-hidden="true">🫧</span>
        </button>
        <button
          type="button"
          className={tool === 'sand' ? 'is-active' : ''}
          aria-label="Sand"
          onClick={() => setTool('sand')}
        >
          <span aria-hidden="true">⬚</span>
        </button>
        <Link
          to="/"
          className="meltdown-exit"
          aria-label="Exit to home"
          onClick={() => stopSoothingDrone()}
        >
          <span aria-hidden="true">⌂</span>
        </Link>
      </nav>

      <button
        type="button"
        className="meltdown-toolkit-link"
        aria-label="Open full calm toolkit with labels"
        onClick={() => {
          stopSoothingDrone()
          navigate('/calm')
        }}
      >
        ···
      </button>
    </div>
  )
}
