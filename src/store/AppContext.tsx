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
  KidProfile,
  ModuleId,
  OnlineActivityId,
  ParentSettings,
  ProgressState,
} from '../types'
import { DEFAULT_PROFILE_ID } from '../types'
import { setAudioSensory } from '../audio/sensoryAudio'
import { setSpeechPrefs } from '../audio/voices'
import { hashPin, verifyPin } from '../security/pinCrypto'
import { pickRoutineForHour } from '../utils/routines'
import {
  clearSessionStarted,
  ensurePinHashed,
  loadAllProgress,
  loadProgress,
  loadSettings,
  markSessionStarted,
  resetProgress as resetStoredProgress,
  saveAllProgress,
  saveProgress,
  saveSettings,
  getSessionStarted,
} from './storage'

type AppContextValue = {
  settings: ParentSettings
  progress: ProgressState
  online: boolean
  pinReady: boolean
  activeProfile: KidProfile | null
  updateSettings: (patch: Partial<ParentSettings>) => void
  setEnabledModule: (id: ModuleId, enabled: boolean) => void
  setEnabledCareModule: (id: CareModuleId, enabled: boolean) => void
  setEnabledOnlineActivity: (id: OnlineActivityId, enabled: boolean) => void
  recordAnswer: (id: ModuleId, correct: boolean, streak: number) => void
  resetProgress: () => void
  changePin: (pin: string) => Promise<void>
  checkPin: (pin: string) => Promise<boolean>
  switchProfile: (profileId: string) => void
  upsertProfile: (profile: KidProfile) => void
  removeProfile: (profileId: string) => void
  applyQuietMode: () => void
  sessionExpired: boolean
  minutesLeft: number | null
}

const AppContext = createContext<AppContextValue | null>(null)

function withActiveProfileSynced(settings: ParentSettings): ParentSettings {
  const profiles = settings.profiles?.length
    ? settings.profiles
    : [
        {
          id: DEFAULT_PROFILE_ID,
          name: 'My kid',
          emoji: '🧒',
          ageBand: settings.ageBand,
          home: settings.home,
          interestTheme: settings.interestTheme,
        },
      ]
  const active =
    profiles.find((p) => p.id === settings.activeProfileId) ?? profiles[0] ?? null
  if (!active) return { ...settings, profiles }
  return {
    ...settings,
    profiles,
    activeProfileId: active.id,
    ageBand: active.ageBand,
    home: active.home,
    interestTheme: active.interestTheme,
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ParentSettings>(() => withActiveProfileSynced(loadSettings()))
  const [progress, setProgress] = useState<ProgressState>(() =>
    loadProgress(loadSettings().activeProfileId || DEFAULT_PROFILE_ID),
  )
  const [online, setOnline] = useState(() => navigator.onLine)
  const [now, setNow] = useState(Date.now())
  const [pinReady, setPinReady] = useState(false)

  useEffect(() => {
    markSessionStarted()
    let cancelled = false
    void ensurePinHashed(loadSettings()).then((next) => {
      if (!cancelled) {
        setSettings(withActiveProfileSynced(next))
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

  // Auto-switch routines by time of day
  useEffect(() => {
    if (!settings.autoSwitchRoutines) return
    const pick = pickRoutineForHour(settings.routines, new Date(now).getHours())
    if (pick && pick.id !== settings.activeRoutineId) {
      setSettings((prev) => {
        const next = { ...prev, activeRoutineId: pick.id }
        saveSettings(next)
        return next
      })
    }
  }, [now, settings.autoSwitchRoutines, settings.routines, settings.activeRoutineId])

  // Follow OS “Reduce Motion” when enabled in settings
  useEffect(() => {
    if (!settings.sensory.followSystemMotion) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      const wants = mq.matches
      setSettings((prev) => {
        if (prev.sensory.reducedMotion === wants) return prev
        const next = {
          ...prev,
          sensory: {
            ...prev.sensory,
            reducedMotion: wants,
            disableSuddenAnimations: wants ? true : prev.sensory.disableSuddenAnimations,
          },
        }
        saveSettings(next)
        return next
      })
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [settings.sensory.followSystemMotion])

  useEffect(() => {
    const root = document.documentElement
    const reduced =
      settings.sensory.reducedMotion || settings.sensory.disableSuddenAnimations
    root.dataset.reducedMotion = reduced ? 'true' : 'false'
    root.dataset.dimColors = settings.sensory.dimColors ? 'true' : 'false'
    root.dataset.noSudden = settings.sensory.disableSuddenAnimations ? 'true' : 'false'
    root.dataset.mutedPalette = settings.sensory.mutedPalette ? 'true' : 'false'
    root.dataset.muteCelebrations = settings.sensory.muteCelebrations ? 'true' : 'false'
    root.dataset.softAudio = settings.sensory.softAudio ? 'true' : 'false'
    root.dataset.largeText = settings.sensory.largeText ? 'true' : 'false'
    root.dataset.highContrast = settings.sensory.highContrast ? 'true' : 'false'
    root.dataset.largeTap = settings.sensory.largeTapTargets ? 'true' : 'false'
    root.dataset.focusOutlines = settings.sensory.showFocusOutlines ? 'true' : 'false'
    setAudioSensory({
      softAudio: settings.sensory.softAudio,
      muteCelebrations: settings.sensory.muteCelebrations,
      reducedMotion: reduced,
    })
    setSpeechPrefs({
      voiceURI: settings.sensory.voiceURI || '',
      style: settings.sensory.voiceStyle || 'child',
    })
  }, [settings.sensory])

  const updateSettings = useCallback((patch: Partial<ParentSettings>) => {
    setSettings((prev) => {
      let next: ParentSettings = {
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
        aacLibrary: patch.aacLibrary ?? prev.aacLibrary,
        customVideos: patch.customVideos ?? prev.customVideos,
        careStats: patch.careStats ? { ...prev.careStats, ...patch.careStats } : prev.careStats,
        home: patch.home
          ? { ...prev.home, ...patch.home, favorites: patch.home.favorites ?? prev.home.favorites }
          : prev.home,
        profiles: patch.profiles ?? prev.profiles,
      }

      // Keep active profile in sync when age/home/interest change
      if (patch.ageBand || patch.home || patch.interestTheme) {
        next = {
          ...next,
          profiles: next.profiles.map((p) =>
            p.id === next.activeProfileId
              ? {
                  ...p,
                  ageBand: patch.ageBand ?? p.ageBand,
                  home: patch.home
                    ? { ...p.home, ...patch.home, favorites: patch.home.favorites ?? p.home.favorites }
                    : p.home,
                  interestTheme: patch.interestTheme ?? p.interestTheme,
                }
              : p,
          ),
        }
      }

      next = withActiveProfileSynced(next)
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

  const recordAnswer = useCallback(
    (id: ModuleId, correct: boolean, streak: number) => {
      setProgress((prev) => {
        const current = prev[id]
        const nextModule = {
          attempts: current.attempts + 1,
          correct: current.correct + (correct ? 1 : 0),
          bestStreak: Math.max(current.bestStreak, streak),
          lastPlayedAt: new Date().toISOString(),
        }
        const next = { ...prev, [id]: nextModule }
        saveProgress(next, settings.activeProfileId)
        return next
      })
    },
    [settings.activeProfileId],
  )

  const resetProgress = useCallback(() => {
    setProgress(resetStoredProgress(settings.activeProfileId))
  }, [settings.activeProfileId])

  const changePin = useCallback(async (pin: string) => {
    const secrets = await hashPin(pin, false)
    setSettings((prev) => {
      const next: ParentSettings = {
        ...prev,
        pin: '',
        pinHash: secrets.pinHash,
        pinSalt: secrets.pinSalt,
        pinIterations: secrets.pinIterations,
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
        pinIterations: settings.pinIterations,
      })
    },
    [settings.pinHash, settings.pinSalt, settings.pinIterations],
  )

  const switchProfile = useCallback((profileId: string) => {
    setSettings((prev) => {
      saveProgress(progress, prev.activeProfileId)
      const next = withActiveProfileSynced({ ...prev, activeProfileId: profileId })
      saveSettings(next)
      setProgress(loadProgress(profileId))
      return next
    })
  }, [progress])

  const upsertProfile = useCallback((profile: KidProfile) => {
    setSettings((prev) => {
      const exists = prev.profiles.some((p) => p.id === profile.id)
      const profiles = exists
        ? prev.profiles.map((p) => (p.id === profile.id ? profile : p))
        : [...prev.profiles, profile]
      const next = withActiveProfileSynced({ ...prev, profiles })
      saveSettings(next)
      return next
    })
  }, [])

  const removeProfile = useCallback((profileId: string) => {
    setSettings((prev) => {
      if (prev.profiles.length <= 1) return prev
      const profiles = prev.profiles.filter((p) => p.id !== profileId)
      const activeProfileId =
        prev.activeProfileId === profileId ? profiles[0].id : prev.activeProfileId
      const map = loadAllProgress()
      delete map[profileId]
      saveAllProgress(map)
      const next = withActiveProfileSynced({ ...prev, profiles, activeProfileId })
      saveSettings(next)
      setProgress(loadProgress(activeProfileId))
      return next
    })
  }, [])

  const applyQuietMode = useCallback(() => {
    updateSettings({
      sensory: {
        ...settings.sensory,
        muteCelebrations: true,
        reducedMotion: true,
        mutedPalette: true,
        disableSuddenAnimations: true,
        dimColors: true,
        softAudio: true,
        showFocusOutlines: true,
      },
      routinePrefs: {
        ...settings.routinePrefs,
        celebrateSounds: false,
        mutedPalette: true,
      },
    })
  }, [settings.sensory, settings.routinePrefs, updateSettings])

  const activeProfile =
    settings.profiles.find((p) => p.id === settings.activeProfileId) ?? settings.profiles[0] ?? null

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
      activeProfile,
      updateSettings,
      setEnabledModule,
      setEnabledCareModule,
      setEnabledOnlineActivity,
      recordAnswer,
      resetProgress,
      changePin,
      checkPin,
      switchProfile,
      upsertProfile,
      removeProfile,
      applyQuietMode,
      sessionExpired,
      minutesLeft,
    }),
    [
      settings,
      progress,
      online,
      pinReady,
      activeProfile,
      updateSettings,
      setEnabledModule,
      setEnabledCareModule,
      setEnabledOnlineActivity,
      recordAnswer,
      resetProgress,
      changePin,
      checkPin,
      switchProfile,
      upsertProfile,
      removeProfile,
      applyQuietMode,
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
