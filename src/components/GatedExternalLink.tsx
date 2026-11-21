import type { ReactNode } from 'react'
import { useParentalGate } from '../hooks/useParentalGate'

type Props = {
  href: string
  children: ReactNode
  className?: string
  /** Open in new tab (default true for http/mailto) */
  newTab?: boolean
}

/**
 * External / leaving-app link protected by ParentalGateModal (Kids Category).
 */
export function GatedExternalLink({ href, children, className, newTab = true }: Props) {
  const { requestGate, gateModal } = useParentalGate({
    title: 'Open link',
    blurb: 'Grown-ups confirm before Soft Steps opens a link outside the child’s play screen.',
  })

  return (
    <>
      <button
        type="button"
        className={className ?? 'btn btn-ghost'}
        onClick={() =>
          requestGate(() => {
            if (newTab) {
              window.open(href, '_blank', 'noopener,noreferrer')
            } else {
              window.location.assign(href)
            }
          })
        }
      >
        {children}
      </button>
      {gateModal}
    </>
  )
}
