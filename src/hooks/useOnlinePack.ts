import { useEffect, useState } from 'react'
import { fetchOnlinePack, type OnlinePack } from '../data/onlinePacks'
import { useApp } from '../store/AppContext'

type PackState =
  | { status: 'loading' }
  | { status: 'ready'; pack: OnlinePack }
  | { status: 'offline' }
  | { status: 'error'; message: string }

export function useOnlinePack() {
  const { online, settings } = useApp()
  const [state, setState] = useState<PackState>({ status: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!online) {
      setState({ status: 'offline' })
      return
    }

    const controller = new AbortController()
    setState({ status: 'loading' })

    fetchOnlinePack(settings.ageBand, controller.signal)
      .then((pack) => {
        if (!controller.signal.aborted) setState({ status: 'ready', pack })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const message = err instanceof Error ? err.message : 'error'
        if (message === 'OFFLINE' || !navigator.onLine) {
          setState({ status: 'offline' })
        } else {
          setState({ status: 'error', message: 'Could not load online activities. Try again.' })
        }
      })

    return () => controller.abort()
  }, [online, settings.ageBand, reloadKey])

  return {
    state,
    reload: () => setReloadKey((k) => k + 1),
  }
}
