import { useEffect, useState } from 'react'
import { fetchOnlinePack, type OnlinePack } from '../data/onlinePacks'
import { useApp } from '../store/AppContext'

type PackState =
  | { status: 'loading' }
  | { status: 'ready'; pack: OnlinePack }
  | { status: 'error'; message: string }

/** Extra-game packs load from on-device data — works fully offline. */
export function useOnlinePack() {
  const { settings } = useApp()
  const [state, setState] = useState<PackState>({ status: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })

    fetchOnlinePack(settings.ageBand, controller.signal)
      .then((pack) => {
        if (!controller.signal.aborted) setState({ status: 'ready', pack })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Could not load activities.',
        })
      })

    return () => controller.abort()
  }, [settings.ageBand, reloadKey])

  return {
    state,
    reload: () => setReloadKey((k) => k + 1),
  }
}
