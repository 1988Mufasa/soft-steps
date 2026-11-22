import { Link } from 'react-router-dom'
import { useApp } from '../../store/AppContext'

/** Screen B — First / Then Quick View */
export function FirstThenBoard() {
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

  return (
    <section
      className={`first-then-view ${settings.routinePrefs.mutedPalette ? 'is-muted-palette' : ''} ${
        settings.routinePrefs.reduceBrightness ? 'is-dim-bright' : ''
      }`}
    >
      <header className="activity-header">
        <Link to="/" className="back-link">
          ← Talk
        </Link>
        <div className="activity-meta">
          <p className="eyebrow offline-tag">Offline</p>
          <h1>First / Then</h1>
        </div>
        <Link to="/schedule" className="btn btn-secondary">
          Do routine
        </Link>
      </header>

      <div className="ft-split">
        <article className="ft-panel ft-first">
          <p className="ft-kicker">FIRST</p>
          {first?.photoDataUrl ? (
            <img src={first.photoDataUrl} alt="" className="ft-big-photo" />
          ) : (
            <div className="ft-big-emoji">{first?.emoji ?? '➕'}</div>
          )}
          <h2>{first?.label ?? 'Choose a step'}</h2>
        </article>

        <article className="ft-panel ft-then">
          <p className="ft-kicker">THEN</p>
          {then && 'photoDataUrl' in then && then.photoDataUrl ? (
            <img src={then.photoDataUrl} alt="" className="ft-big-photo" />
          ) : (
            <div className="ft-big-emoji">{then?.emoji ?? '⭐'}</div>
          )}
          <h2>{then?.label ?? 'Reward'}</h2>
        </article>
      </div>

      <p className="fine-print">
        Tokens earned: {settings.routinePrefs.tokensEarned}
        {settings.routinePrefs.stickers.length
          ? ` · ${settings.routinePrefs.stickers.slice(-4).join(' ')}`
          : ''}
      </p>
    </section>
  )
}
