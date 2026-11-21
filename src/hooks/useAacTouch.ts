import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import type { AacTouchTrigger } from '../data/aacPresets'

type Options = {
  delayMs: number
  trigger: AacTouchTrigger
  animations: boolean
  onActivate: () => void
}

/**
 * Touch accommodations for AAC: optional hold-delay and speak-on-release.
 * Prevents accidental double-taps without rearranging button positions.
 */
export function useAacTouch({ delayMs, trigger, animations, onActivate }: Options) {
  const timer = useRef<number | null>(null)
  const armed = useRef(false)
  const lastAt = useRef(0)

  const clear = useCallback(() => {
    if (timer.current != null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    armed.current = false
  }, [])

  const fire = useCallback(() => {
    const now = Date.now()
    if (now - lastAt.current < 280) return
    lastAt.current = now
    onActivate()
  }, [onActivate])

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.currentTarget.setPointerCapture?.(e.pointerId)
      clear()
      if (trigger === 'press') {
        if (delayMs <= 0) {
          fire()
          return
        }
        armed.current = true
        timer.current = window.setTimeout(() => {
          if (armed.current) fire()
          armed.current = false
        }, delayMs)
      } else if (delayMs <= 0) {
        armed.current = true
      } else {
        timer.current = window.setTimeout(() => {
          armed.current = true
        }, delayMs)
      }
    },
    [clear, delayMs, fire, trigger],
  )

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      if (trigger === 'release' && armed.current) {
        fire()
      }
      clear()
      try {
        e.currentTarget.releasePointerCapture?.(e.pointerId)
      } catch {
        /* ignore */
      }
    },
    [clear, fire, trigger],
  )

  const onPointerCancel = useCallback(() => {
    clear()
  }, [clear])

  const className = animations ? 'aac-touchable' : 'aac-touchable no-anim'

  return { onPointerDown, onPointerUp, onPointerCancel, onPointerLeave: clear, className }
}
