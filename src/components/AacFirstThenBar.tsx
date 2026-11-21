import { speakText } from '../audio/calmAudio'
import { useApp } from '../store/AppContext'
import type { AacPrefs } from '../data/aacPresets'

type Props = {
  prefs: AacPrefs
}

/**
 * Compact First → Then strip for Talk AAC — mirrors the classroom laminated board.
 */
export function AacFirstThenBar({ prefs }: Props) {
  const { settings } = useApp()
  const routine =
    settings.routines.find((r) => r.id === settings.activeRoutineId) ?? settings.routines[0]
  const idx = settings.routinePrefs.stepIndex
  const first = routine?.steps[idx]
  const then =
    routine && idx + 1 < routine.steps.length
      ? routine.steps[idx + 1]
      : routine?.thenReward
        ? {
            label: routine.thenReward.label,
            emoji: routine.thenReward.emoji,
            photoDataUrl: routine.thenReward.photoDataUrl,
          }
        : null

  const speak = (label: string) => {
    speakText(label, settings.sensory.soundOn, {
      pitch: prefs.speechPitch,
      rate: prefs.speechRate,
      forceFullVolume: prefs.classroomVolumeBoost,
      volume: prefs.classroomVolumeBoost ? 1 : undefined,
    })
  }

  if (!first && !then) return null

  return (
    <div className="aac-ft-bar" aria-label="First then schedule">
      <button
        type="button"
        className="aac-ft-cell aac-ft-first"
        onClick={() => first && speak(first.label)}
        aria-label={first ? `First: ${first.label}` : 'First step empty'}
        disabled={!first}
      >
        <span className="aac-ft-kicker">First</span>
        {first?.photoDataUrl ? (
          <img src={first.photoDataUrl} alt="" className="aac-ft-thumb" />
        ) : (
          <span className="aac-ft-emoji" aria-hidden="true">
            {first?.emoji ?? '➕'}
          </span>
        )}
        <span className="aac-ft-label">{first?.label ?? '—'}</span>
      </button>
      <span className="aac-ft-arrow" aria-hidden="true">
        →
      </span>
      <button
        type="button"
        className="aac-ft-cell aac-ft-then"
        onClick={() => then && speak(then.label)}
        aria-label={then ? `Then: ${then.label}` : 'Then empty'}
        disabled={!then}
      >
        <span className="aac-ft-kicker">Then</span>
        {then && 'photoDataUrl' in then && then.photoDataUrl ? (
          <img src={then.photoDataUrl} alt="" className="aac-ft-thumb" />
        ) : (
          <span className="aac-ft-emoji" aria-hidden="true">
            {then?.emoji ?? '⭐'}
          </span>
        )}
        <span className="aac-ft-label">{then?.label ?? '—'}</span>
      </button>
    </div>
  )
}
