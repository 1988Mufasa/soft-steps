import { mergeAacLibrary, type AacLibrary } from '../data/aacPresets'
import { downloadText } from './backup'

export const AAC_BOARD_KIND = 'soft-steps-aac-board' as const

export type SoftStepsAacBoardFile = {
  kind: typeof AAC_BOARD_KIND
  version: 1
  exportedAt: string
  /** Exact AAC library (layout, masks, media, prefs) for clinic → home transfer */
  library: AacLibrary
}

export function buildAacBoardExport(library: AacLibrary): SoftStepsAacBoardFile {
  return {
    kind: AAC_BOARD_KIND,
    version: 1,
    exportedAt: new Date().toISOString(),
    library: structuredClone(library),
  }
}

export function downloadAacBoard(library: AacLibrary) {
  const payload = buildAacBoardExport(library)
  const stamp = new Date().toISOString().slice(0, 10)
  downloadText(
    `soft-steps-aac-board-${stamp}.json`,
    JSON.stringify(payload, null, 2),
    'application/json',
  )
}

export function parseAacBoardFile(raw: unknown): SoftStepsAacBoardFile | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Partial<SoftStepsAacBoardFile>
  if (obj.kind !== AAC_BOARD_KIND || obj.version !== 1 || !obj.library) return null
  return {
    kind: AAC_BOARD_KIND,
    version: 1,
    exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : new Date().toISOString(),
    library: mergeAacLibrary(obj.library),
  }
}

/** Replace the local AAC library with an imported clinic/home board. */
export function libraryFromAacBoardFile(file: SoftStepsAacBoardFile): AacLibrary {
  return mergeAacLibrary(file.library)
}
