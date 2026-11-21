import { useState } from 'react'
import {
  AAC_STAGES,
  applyStageToLibrary,
  type AacGridLayout,
  type AacStage,
} from '../../data/aacPresets'
import { useApp } from '../../store/AppContext'

type Props = {
  onDone?: () => void
  /** Compact card inside the editor vs full-page gate */
  embedded?: boolean
}

/**
 * Parent / SLP / educator AAC setup — age-recommended grids.
 * Choosing a later stage unlocks more cells without moving earlier words.
 */
export function AacSetup({ onDone, embedded }: Props) {
  const { settings, updateSettings } = useApp()
  const prefs = settings.aacLibrary.prefs
  const [stage, setStage] = useState<AacStage>(prefs.stage || 'starter')
  const meta = AAC_STAGES.find((s) => s.id === stage) ?? AAC_STAGES[0]
  const [layout, setLayout] = useState<AacGridLayout>(
    meta.recommendedLayouts.includes(prefs.gridLayout)
      ? prefs.gridLayout
      : meta.defaultLayout,
  )

  const pickStage = (next: AacStage) => {
    setStage(next)
    const m = AAC_STAGES.find((s) => s.id === next) ?? AAC_STAGES[0]
    setLayout(m.defaultLayout)
  }

  const apply = () => {
    const next = applyStageToLibrary(settings.aacLibrary, stage, layout)
    updateSettings({ aacLibrary: next })
    onDone?.()
  }

  return (
    <article className={`dash-card aac-setup ${embedded ? 'is-embedded' : 'is-gate'}`}>
      <h2>{embedded ? 'Change age / grid setup' : 'Set up Talk AAC'}</h2>
      <p className="prompt">
        Parents, speech therapists, and educators: pick the age range that fits your learner.
        Soft Steps recommends a grid — you can still choose another option. Words keep their fixed
        spots as you grow the board later.
      </p>

      <p className="fine-print">Age range</p>
      <div className="toggle-row wrap">
        {AAC_STAGES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`chip ${stage === s.id ? 'is-active' : ''}`}
            onClick={() => pickStage(s.id)}
          >
            {s.agesLabel}
          </button>
        ))}
      </div>

      <div className="aac-setup-rec">
        <h3>
          {meta.title} · recommended {meta.defaultLayout.replace('x', '×')}
        </h3>
        <p>{meta.blurb}</p>
        <p className="fine-print">Focus words: {meta.focusWords.join(' · ')}</p>
      </div>

      <p className="fine-print">Grid option</p>
      <div className="toggle-row wrap">
        {meta.recommendedLayouts.map((id) => (
          <button
            key={id}
            type="button"
            className={`chip ${layout === id ? 'is-active' : ''}`}
            onClick={() => setLayout(id)}
          >
            {id.replace('x', '×')}
            {id === meta.defaultLayout ? ' · recommended' : ''}
          </button>
        ))}
      </div>

      <p className="fine-print aac-grow-note">
        Growing up later (for example 3–4 → 5–7 → 8–12) only adds words and folders around the
        edges. Want, Help, More, Yes, No, and All Done stay in the same top-left cells forever.
      </p>

      <div className="confirm-row">
        <button type="button" className="btn btn-primary" onClick={apply}>
          {embedded ? 'Apply setup' : 'Start with this board'}
        </button>
      </div>
    </article>
  )
}
