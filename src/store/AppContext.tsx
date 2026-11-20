import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ModuleId, OnlineActivityId, ParentSettings, ProgressState } from '../types'
import {
  clearSessionStarted,
  loadProgress,
  loadSettings,
  markSessionStarted,
  resetProgress as resetStoredProgress,
  saveProgress,
  saveSettings,
  getSessionStarted,
} from './storage'

type AppContextValue = {
  settings: ParentSettings
  progress: ProgressState
  online: boolean
  updateSettings: (patch: Partial<ParentSettings>) => void
  setEnabledModule: (id: ModuleId, enabled: boolean) => void
  setEnabledOnlineActivity: (id: OnlineActivityId, enabled: boolean) => void
  recordAnswer: (id: ModuleId, correct: boolean, streak: number) => void
  resetProgress: () => void
  changePin: (pin: string) => void
  sessionExpired: boolean
  minutesLeft: number | null
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ParentSettings>(() => loadSettings())
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress())
  const [online, setOnline] = useState(() => navigator.onLine)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    markSessionStarted()
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    const tick = window.setInterval(() => setNow(Date.now()), 15_000)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.clearInterval(tick)
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = settings.sensory.reducedMotion
      ? 'true'
      : 'false'
  }, [settings.sensory.reducedMotion])

  const updateSettings = useCallback((patch: Partial<ParentSettings>) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        ...patch,
        enabledModules: patch.enabledModules
          ? { ...prev.enabledModules, ...patch.enabledModules }
          : prev.enabledModules,
        enabledOnlineActivities: patch.enabledOnlineActivities
          ? { ...prev.enabledOnlineActivities, ...patch.enabledOnlineActivities }
          : prev.enabledOnlineActivities,
        sensory: patch.sensory ? { ...prev.sensory, ...patch.sensory } : prev.sensory,
      }
      saveSettings(next)
      return next
    })
  }, [])

  const setEnabledModule = useCallback((id: ModuleId, enabled: boolean) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        enabledModules: { ...prev.enabledModules, [id]: enabled },
      }
      saveSettings(next)
      return next
    })
  }, [])

  const setEnabledOnlineActivity = useCallback((id: OnlineActivityId, enabled: boolean) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        enabledOnlineActivities: { ...prev.enabledOnlineActivities, [id]: enabled },
      }
      saveSettings(next)
      return next
    })
  }, [])

  const recordAnswer = useCallback((id: ModuleId, correct: boolean, streak: number) => {
    setProgress((prev) => {
      const current = prev[id]
      const nextModule = {
        attempts: current.attempts + 1,
        correct: current.correct + (correct ? 1 : 0),
        bestStreak: Math.max(current.bestStreak, streak),
        lastPlayedAt: new Date().toISOString(),
      }
      const next = { ...prev, [id]: nextModule }
      saveProgress(next)
      return next
    })
  }, [])

  const resetProgress = useCallback(() => {
    setProgress(resetStoredProgress())
  }, [])

  const changePin = useCallback((pin: string) => {
    updateSettings({ pin })
  }, [updateSettings])

  const sessionStarted = getSessionStarted()
  const limitMs =
    settings.sessionLimitMinutes && settings.sessionLimitMinutes > 0
      ? settings.sessionLimitMinutes * 60_000
      : null
  const elapsed = sessionStarted ? now - sessionStarted : 0
  const sessionExpired = limitMs !== null && elapsed >= limitMs
  const minutesLeft =
    limitMs === null ? null : Math.max(0, Math.ceil((limitMs - elapsed) / 60_000))

  useEffect(() => {
    if (sessionExpired) {
      // keep session marker so limit stays until browser session ends / parent clears
    }
  }, [sessionExpired])

  const value = useMemo(
    () => ({
      settings,
      progress,
      online,
      updateSettings,
      setEnabledModule,
      setEnabledOnlineActivity,
      recordAnswer,
      resetProgress,
      changePin,
      sessionExpired,
      minutesLeft,
    }),
    [
      settings,
      progress,
      online,
      updateSettings,
      setEnabledModule,
      setEnabledOnlineActivity,
      recordAnswer,
      resetProgress,
      changePin,
      sessionExpired,
      minutesLeft,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function unlockNewSession() {
  clearSessionStarted()
  markSessionStarted()
}
