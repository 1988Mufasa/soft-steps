import type { AacCategory } from '../data/aacPresets'

type Props = {
  category: AacCategory
  active?: boolean
  onOpen: () => void
}

/**
 * Tabbed folder tile — visually distinct from single-word AAC buttons.
 */
export function AacFolderTile({ category, active, onOpen }: Props) {
  return (
    <button
      type="button"
      className={`aac-folder-tile ${active ? 'is-open' : ''}`}
      onClick={onOpen}
      aria-label={`Open folder ${category.title}`}
      aria-pressed={active}
    >
      <span className="aac-folder-tab" aria-hidden="true" />
      <span className="aac-folder-body">
        <span className="aac-folder-badge" aria-hidden="true">
          📁
        </span>
        <span className="aac-folder-emoji" aria-hidden="true">
          {category.emoji}
        </span>
        <span className="aac-folder-label">{category.title}</span>
      </span>
    </button>
  )
}
