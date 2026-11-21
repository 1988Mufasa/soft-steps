import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  CareModuleId,
  ModuleId,
  OnlineActivityId,
  ParentSettings,
  ProgressState,
} from '../types'
import { setSpeechPrefs } from '../audio/voices'
import { hashPin, verifyPin } from '../security/pinCrypto'
import {
  clearSessionStarted,
  ensurePinHashed,
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
  pinReady: boolean
  updateSettings: (patch: Partial<ParentSettings>) => void
  setEnabledModule: (id: ModuleId, enabled: boolean) => void
  setEnabledCareModule: (id: CareModuleId, enabled: boolean) => void
  setEnabledOnlineActivity: (id: OnlineActivityId, enabled: boolean) => void
  recordAnswer: (id: ModuleId, correct: boolean, streak: number) => void
  resetProgress: () => void
  changePin: (pin: string) => Promise<void>
  checkPin: (pin: string) => Promise<boolean>
  sessionExpired: boolean
  minutesLeft: number | null
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ParentSettings>(() => loadSettings())
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress())
  const [online, setOnline] = useState(() => navigator.onLine)
  const [now, setNow] = useState(Date.now())
  const [pinReady, setPinReady] = useState(false)

  useEffect(() => {
    markSessionStarted()
    let cancelled = false
    void ensurePinHashed(loadSettings()).then((next) => {
      if (!cancelled) {
        setSettings(next)
        setPinReady(true)
      }
    })
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    const tick = window.setInterval(() => setNow(Date.now()), 15_000)
    return () => {
      cancelled = true
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.clearInterval(tick)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.reducedMotion =
      settings.sensory.reducedMotion || settings.sensory.disableSuddenAnimations
        ? 'true'
        : 'false'
    root.dataset.dimColors = settings.sensory.dimColors ? 'true' : 'false'
    root.dataset.noSudden = settings.sensory.disableSuddenAnimations ? 'true' : 'false'
    root.dataset.mutedPalette = settings.sensory.mutedPalette ? 'true' : 'false'
    root.dataset.muteCelebrations = settings.sensory.muteCelebrations ? 'true' : 'false'
    root.dataset.largeText = settings.sensory.largeText ? 'true' : 'false'
    root.dataset.highContrast = settings.sensory.highContrast ? 'true' : 'false'
    root.dataset.largeTap = settings.sensory.largeTapTargets ? 'true' : 'false'
    root.dataset.focusOutlines = settings.sensory.showFocusOutlines ? 'true' : 'false'
    setSpeechPrefs({
      voiceURI: settings.sensory.voiceURI || '',
      style: settings.sensory.voiceStyle || 'child',
    })
  }, [settings.sensory])

  const updateSettings = useCallback((patch: Partial<ParentSettings>) => {
    setSettings((prev) => {
      const next: ParentSettings = {
        ...prev,
        ...patch,
        enabledModules: patch.enabledModules
          ? { ...prev.enabledModules, ...patch.enabledModules }
          : prev.enabledModules,
        enabledCareModules: patch.enabledCareModules
          ? { ...prev.enabledCareModules, ...patch.enabledCareModules }
          : prev.enabledCareModules,
        enabledOnlineActivities: patch.enabledOnlineActivities
          ? { ...prev.enabledOnlineActivities, ...patch.enabledOnlineActivities }
          : prev.enabledOnlineActivities,
        sensory: patch.sensory ? { ...prev.sensory, ...patch.sensory } : prev.sensory,
        routines: patch.routines ?? prev.routines,
        routinePrefs: patch.routinePrefs
          ? { ...prev.routinePrefs, ...patch.routinePrefs }
          : prev.routinePrefs,
        stories: patch.stories ?? prev.stories,
        interestChecklist: patch.interestChecklist ?? prev.interestChecklist,
        customAacCards: patch.customAacCards ?? prev.customAacCards,
        customVideos: patch.customVideos ?? prev.customVideos,
        careStats: patch.careStats ? { ...prev.careStats, ...patch.careStats } : prev.careStats,
        home: patch.home
          ? { ...prev.home, ...patch.home, favorites: patch.home.favorites ?? prev.home.favorites }
          : prev.home,
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

  const setEnabledCareModule = useCallback((id: CareModuleId, enabled: boolean) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        enabledCareModules: { ...prev.enabledCareModules, [id]: enabled },
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

  const changePin = useCallback(async (pin: string) => {
    const secrets = await hashPin(pin, false)
    setSettings((prev) => {
      const next: ParentSettings = {
        ...prev,
        pin: '',
        pinHash: secrets.pinHash,
        pinSalt: secrets.pinSalt,
        pinIsDefault: false,
      }
      saveSettings(next)
      return next
    })
  }, [])

  const checkPin = useCallback(
    async (pin: string) => {
      if (!settings.pinHash || !settings.pinSalt) return false
      return verifyPin(pin, {
        pinHash: settings.pinHash,
        pinSalt: settings.pinSalt,
      })
    },
    [settings.pinHash, settings.pinSalt],
  )

  const sessionStarted = getSessionStarted()
  const limitMs =
    settings.sessionLimitMinutes && settings.sessionLimitMinutes > 0
      ? settings.sessionLimitMinutes * 60_000
      : null
  const elapsed = sessionStarted ? now - sessionStarted : 0
  const sessionExpired = limitMs !== null && elapsed >= limitMs
  const minutesLeft =
    limitMs === null ? null : Math.max(0, Math.ceil((limitMs - elapsed) / 60_000))

  const value = useMemo(
    () => ({
      settings,
      progress,
      online,
      pinReady,
      updateSettings,
      setEnabledModule,
      setEnabledCareModule,
      setEnabledOnlineActivity,
      recordAnswer,
      resetProgress,
      changePin,
      checkPin,
      sessionExpired,
      minutesLeft,
    }),
    [
      settings,
      progress,
      online,
      pinReady,
      updateSettings,
      setEnabledModule,
      setEnabledCareModule,
      setEnabledOnlineActivity,
      recordAnswer,
      resetProgress,
      changePin,
      checkPin,
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
