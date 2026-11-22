import type { AacCategory } from '../data/aacPresets'

type Props = {
  category: AacCategory
  active?: boolean
  onOpen: () => void
  /** Dense yellow category cell (Weave-style rail) vs tabbed folder card */
  variant?: 'folder' | 'rail'
}

/**
 * Category folder control — tabbed folder card, or compact rail cell for dense boards.
 */
export function AacFolderTile({ category, active, onOpen, variant = 'folder' }: Props) {
  if (variant === 'rail') {
    return (
      <button
        type="button"
        className={`aac-cat-rail-tile ${active ? 'is-open' : ''}`}
        onClick={onOpen}
        aria-label={`Open folder ${category.title}`}
        aria-pressed={active}
        role="listitem"
      >
        <span className="aac-cat-rail-emoji" aria-hidden="true">
          {category.emoji}
        </span>
        <span className="aac-cat-rail-label">{category.title}</span>
      </button>
    )
  }

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
