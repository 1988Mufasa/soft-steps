import { loadCheckInHistory, type SavedCheckIn } from '../data/checkIn'
import {
  base64ToBuffer,
  bufferToBase64,
  deriveBackupKey,
  PIN_ITERATIONS_CURRENT,
  randomSaltHex,
} from '../security/pinCrypto'
import type { ParentSettings, ProgressState } from '../types'
import { DEFAULT_SETTINGS, emptyProgress } from '../types'

export type SoftStepsBackupPayload = {
  version: 2
  exportedAt: string
  settings: ParentSettings
  progressByProfile: Record<string, ProgressState>
  checkIns: SavedCheckIn[]
}

/** Encrypted on-disk format — never stores plaintext PIN; payload omits pin secrets. */
export type SoftStepsEncryptedBackup = {
  version: 2
  encrypted: true
  exportedAt: string
  kdf: 'PBKDF2-SHA256'
  iterations: number
  salt: string
  iv: string
  ciphertext: string
}

export type SoftStepsLegacyBackup = {
  version: 1
  exportedAt: string
  settings: ParentSettings
  progressByProfile: Record<string, ProgressState>
  checkIns: SavedCheckIn[]
}

export function downloadText(filename: string, text: string, mime = 'text/plain') {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Strip secrets that must not leave the device in the clear. */
export function sanitizeSettingsForBackup(settings: ParentSettings): ParentSettings {
  return {
    ...settings,
    pin: '',
    pinHash: '',
    pinSalt: '',
    pinIsDefault: settings.pinIsDefault,
    pinIterations: undefined,
  }
}

export function buildBackupPayload(
  settings: ParentSettings,
  progressByProfile: Record<string, ProgressState>,
): SoftStepsBackupPayload {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    settings: sanitizeSettingsForBackup(settings),
    progressByProfile,
    checkIns: loadCheckInHistory(),
  }
}

export async function encryptBackup(
  payload: SoftStepsBackupPayload,
  pin: string,
): Promise<SoftStepsEncryptedBackup> {
  const salt = randomSaltHex(16)
  const iterations = PIN_ITERATIONS_CURRENT
  const key = await deriveBackupKey(pin, salt, iterations)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(JSON.stringify(payload))
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  return {
    version: 2,
    encrypted: true,
    exportedAt: payload.exportedAt,
    kdf: 'PBKDF2-SHA256',
    iterations,
    salt,
    iv: bufferToBase64(iv.buffer),
    ciphertext: bufferToBase64(cipherBuf),
  }
}

export async function decryptBackup(
  file: SoftStepsEncryptedBackup,
  pin: string,
): Promise<SoftStepsBackupPayload | null> {
  try {
    if (!file?.encrypted || !file.salt || !file.iv || !file.ciphertext) return null
    const key = await deriveBackupKey(pin, file.salt, file.iterations || PIN_ITERATIONS_CURRENT)
    const iv = new Uint8Array(base64ToBuffer(file.iv))
    const cipher = base64ToBuffer(file.ciphertext)
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher)
    const parsed = JSON.parse(new TextDecoder().decode(plainBuf)) as SoftStepsBackupPayload
    if (!parsed?.settings || typeof parsed.settings !== 'object') return null
    return {
      ...parsed,
      version: 2,
      settings: sanitizeSettingsForBackup(parsed.settings),
      progressByProfile: parsed.progressByProfile || {},
      checkIns: Array.isArray(parsed.checkIns) ? parsed.checkIns : [],
    }
  } catch {
    return null
  }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v)
}

/** Validate / coerce a restored settings blob before writing localStorage. */
export function validateRestoredSettings(
  incoming: ParentSettings,
  current: ParentSettings,
): ParentSettings {
  if (!isPlainObject(incoming)) return current
  // Keep this device's PIN secrets — backups never carry usable PIN material.
  return {
    ...DEFAULT_SETTINGS,
    ...incoming,
    pin: '',
    pinHash: current.pinHash,
    pinSalt: current.pinSalt,
    pinIterations: current.pinIterations,
    pinIsDefault: current.pinIsDefault,
    enabledModules: {
      ...DEFAULT_SETTINGS.enabledModules,
      ...(incoming.enabledModules || {}),
    },
    enabledCareModules: {
      ...DEFAULT_SETTINGS.enabledCareModules,
      ...(incoming.enabledCareModules || {}),
    },
    enabledOnlineActivities: {
      ...DEFAULT_SETTINGS.enabledOnlineActivities,
      ...(incoming.enabledOnlineActivities || {}),
    },
    sensory: { ...DEFAULT_SETTINGS.sensory, ...(incoming.sensory || {}) },
    routines: Array.isArray(incoming.routines) ? incoming.routines : current.routines,
    stories: Array.isArray(incoming.stories) ? incoming.stories : current.stories,
    customAacCards: Array.isArray(incoming.customAacCards) ? incoming.customAacCards : [],
    customVideos: Array.isArray(incoming.customVideos) ? incoming.customVideos : [],
    profiles: Array.isArray(incoming.profiles) && incoming.profiles.length
      ? incoming.profiles
      : current.profiles,
    interestChecklist: Array.isArray(incoming.interestChecklist)
      ? incoming.interestChecklist
      : current.interestChecklist,
    careStats: { ...DEFAULT_SETTINGS.careStats, ...(incoming.careStats || {}) },
    home: {
      ...DEFAULT_SETTINGS.home,
      ...(incoming.home || {}),
      favorites: incoming.home?.favorites ?? [...DEFAULT_SETTINGS.home.favorites],
    },
    routinePrefs: {
      ...DEFAULT_SETTINGS.routinePrefs,
      ...(incoming.routinePrefs || {}),
      stickers: incoming.routinePrefs?.stickers ?? [],
    },
  }
}

export function validateProgressMap(
  map: Record<string, ProgressState> | undefined,
): Record<string, ProgressState> {
  if (!map || typeof map !== 'object') return {}
  const out: Record<string, ProgressState> = {}
  for (const [id, prog] of Object.entries(map)) {
    if (typeof id !== 'string' || id.length > 64) continue
    out[id] = { ...emptyProgress(), ...(prog || {}) }
  }
  return out
}

export function parseBackupFile(raw: string): SoftStepsEncryptedBackup | SoftStepsLegacyBackup | null {
  try {
    const data = JSON.parse(raw) as SoftStepsEncryptedBackup | SoftStepsLegacyBackup
    if (!data || (data.version !== 1 && data.version !== 2)) return null
    return data
  } catch {
    return null
  }
}
