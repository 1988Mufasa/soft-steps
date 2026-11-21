import { useCallback, useRef, useState, type ReactNode } from 'react'
import { ParentalGateModal } from '../components/ParentalGateModal'

type Options = {
  title?: string
  blurb?: string
}

/**
 * Queue an action behind ParentalGateModal. Renders the modal while pending.
 */
export function useParentalGate(options?: Options) {
  const pendingRef = useRef<(() => void) | null>(null)
  const [open, setOpen] = useState(false)

  const requestGate = useCallback((action: () => void) => {
    pendingRef.current = action
    setOpen(true)
  }, [])

  const gateModal: ReactNode = open ? (
    <ParentalGateModal
      title={options?.title}
      blurb={options?.blurb}
      onCancel={() => {
        pendingRef.current = null
        setOpen(false)
      }}
      onVerified={() => {
        const run = pendingRef.current
        pendingRef.current = null
        setOpen(false)
        run?.()
      }}
    />
  ) : null

  return { requestGate, gateModal, gateOpen: open }
}
