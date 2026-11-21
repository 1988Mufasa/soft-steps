import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import type { AacTouchTrigger } from '../data/aacPresets'

type Options = {
  delayMs: number
  trigger: AacTouchTrigger
  animations: boolean
  onActivate: () => void
  /** Optional long-press (e.g. word forms). Cancels the normal activate. */
  onLongPress?: () => void
  longPressMs?: number
}

/**
 * Touch accommodations for AAC: optional hold-delay, speak-on-release,
 * and long-press for grammar popups.
 */
export function useAacTouch({
  delayMs,
  trigger,
  animations,
  onActivate,
  onLongPress,
  longPressMs = 650,
}: Options) {
  const timer = useRef<number | null>(null)
  const longTimer = useRef<number | null>(null)
  const armed = useRef(false)
  const longDone = useRef(false)
  const lastAt = useRef(0)

  const clearTimers = useCallback(() => {
    if (timer.current != null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    if (longTimer.current != null) {
      window.clearTimeout(longTimer.current)
      longTimer.current = null
    }
  }, [])

  const fire = useCallback(() => {
    if (longDone.current) return
    const now = Date.now()
    if (now - lastAt.current < 280) return
    lastAt.current = now
    onActivate()
  }, [onActivate])

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.currentTarget.setPointerCapture?.(e.pointerId)
      clearTimers()
      longDone.current = false
      armed.current = false

      if (onLongPress) {
        longTimer.current = window.setTimeout(() => {
          longDone.current = true
          clearTimers()
          onLongPress()
        }, longPressMs)
      }

      if (trigger === 'press') {
        if (onLongPress && delayMs <= 0) {
          // Wait for release (or long-press) so a hold can open forms
          armed.current = true
          return
        }
        const wait = Math.max(delayMs, 0)
        if (wait <= 0) {
          fire()
          return
        }
        armed.current = true
        timer.current = window.setTimeout(() => {
          if (!longDone.current) fire()
          armed.current = false
        }, wait)
      } else {
        // release trigger
        if (delayMs <= 0) {
          armed.current = true
        } else {
          timer.current = window.setTimeout(() => {
            armed.current = true
          }, delayMs)
        }
      }
    },
    [clearTimers, delayMs, fire, longPressMs, onLongPress, trigger],
  )

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      if (!longDone.current) {
        if (trigger === 'release' && armed.current) fire()
        if (trigger === 'press' && onLongPress && delayMs <= 0 && armed.current) fire()
      }
      clearTimers()
      armed.current = false
      try {
        e.currentTarget.releasePointerCapture?.(e.pointerId)
      } catch {
        /* ignore */
      }
    },
    [clearTimers, delayMs, fire, onLongPress, trigger],
  )

  const onPointerCancel = useCallback(() => {
    clearTimers()
    armed.current = false
  }, [clearTimers])

  const className = animations ? 'aac-touchable' : 'aac-touchable no-anim'

  return { onPointerDown, onPointerUp, onPointerCancel, onPointerLeave: onPointerCancel, className }
}
