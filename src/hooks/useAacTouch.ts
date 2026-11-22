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
  /** Dwell activation while pointer stays on the tile (0 = off). */
  dwellMs?: number
}

/**
 * Touch accommodations for AAC: optional hold-delay, speak-on-release,
 * dwell/hover, and long-press for grammar popups.
 */
export function useAacTouch({
  delayMs,
  trigger,
  animations,
  onActivate,
  onLongPress,
  longPressMs = 650,
  dwellMs = 0,
}: Options) {
  const timer = useRef<number | null>(null)
  const longTimer = useRef<number | null>(null)
  const dwellTimer = useRef<number | null>(null)
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
    if (dwellTimer.current != null) {
      window.clearTimeout(dwellTimer.current)
      dwellTimer.current = null
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

  const onPointerEnter = useCallback(() => {
    if (!dwellMs || dwellMs <= 0) return
    clearTimers()
    dwellTimer.current = window.setTimeout(() => {
      fire()
    }, dwellMs)
  }, [clearTimers, dwellMs, fire])

  const onPointerLeave = useCallback(() => {
    if (dwellMs && dwellMs > 0) {
      clearTimers()
      armed.current = false
      return
    }
    onPointerCancel()
  }, [clearTimers, dwellMs, onPointerCancel])

  const className = animations ? 'aac-touchable' : 'aac-touchable no-anim'

  return {
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onPointerLeave,
    onPointerEnter,
    className,
  }
}
