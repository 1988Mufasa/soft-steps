import { loadCheckInHistory } from '../data/checkIn'
import type { ParentSettings, ProgressState } from '../types'

export type SoftStepsBackup = {
  version: 1
  exportedAt: string
  settings: ParentSettings
  progressByProfile: Record<string, ProgressState>
  checkIns: ReturnType<typeof loadCheckInHistory>
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

export function buildBackup(
  settings: ParentSettings,
  progressByProfile: Record<string, ProgressState>,
): SoftStepsBackup {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    progressByProfile,
    checkIns: loadCheckInHistory(),
  }
}

export function parseBackup(raw: string): SoftStepsBackup | null {
  try {
    const data = JSON.parse(raw) as SoftStepsBackup
    if (!data || data.version !== 1 || !data.settings) return null
    return data
  } catch {
    return null
  }
}
