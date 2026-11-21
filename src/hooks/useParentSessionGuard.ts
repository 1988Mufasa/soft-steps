import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  clearParentSession,
  isParentSessionValid,
  parentSessionRemainingMs,
  touchParentSession,
} from '../security/parentSession'
import { useApp } from '../store/AppContext'

/** Redirect to PIN gate if grown-up session missing/expired; keep idle clock fresh. */
export function useParentSessionGuard() {
  const navigate = useNavigate()
  const { settings } = useApp()
  const [remainingMs, setRemainingMs] = useState(() => parentSessionRemainingMs())

  useEffect(() => {
    // Starter PIN must be changed before any Grown-ups tools
    if (settings.pinIsDefault) {
      clearParentSession()
      navigate('/parent', { replace: true })
      return
    }

    if (!isParentSessionValid()) {
      clearParentSession()
      navigate('/parent', { replace: true })
      return
    }
    touchParentSession()
    setRemainingMs(parentSessionRemainingMs())

    const onActivity = () => {
      if (!touchParentSession()) {
        navigate('/parent', { replace: true })
        return
      }
      setRemainingMs(parentSessionRemainingMs())
    }

    const events: Array<keyof WindowEventMap> = [
      'pointerdown',
      'keydown',
      'touchstart',
      'mousemove',
    ]
    for (const ev of events) window.addEventListener(ev, onActivity, { passive: true })

    const tick = window.setInterval(() => {
      if (!isParentSessionValid()) {
        clearParentSession()
        navigate('/parent', { replace: true })
        return
      }
      setRemainingMs(parentSessionRemainingMs())
    }, 5_000)

    return () => {
      for (const ev of events) window.removeEventListener(ev, onActivity)
      window.clearInterval(tick)
    }
  }, [navigate, settings.pinIsDefault])

  return { remainingMs }
}
