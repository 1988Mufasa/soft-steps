import { useEffect, useState } from 'react'

type Batt = { level: number; charging: boolean } | null

export function AacDeviceStatus() {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )
  const [batt, setBatt] = useState<Batt>(null)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  useEffect(() => {
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<{
        level: number
        charging: boolean
        addEventListener: (type: string, fn: () => void) => void
        removeEventListener: (type: string, fn: () => void) => void
      }>
    }
    if (!nav.getBattery) return
    let bat: Awaited<ReturnType<NonNullable<typeof nav.getBattery>>> | null = null
    const sync = () => {
      if (!bat) return
      setBatt({ level: bat.level, charging: bat.charging })
    }
    void nav.getBattery().then((b) => {
      bat = b
      sync()
      b.addEventListener('levelchange', sync)
      b.addEventListener('chargingchange', sync)
    })
    return () => {
      if (!bat) return
      bat.removeEventListener('levelchange', sync)
      bat.removeEventListener('chargingchange', sync)
    }
  }, [])

  const pct = batt ? Math.round(batt.level * 100) : null

  return (
    <div className="aac-device-status" role="status" aria-live="polite">
      <span className={`aac-status-pill ${online ? 'is-online' : 'is-offline'}`}>
        {online ? 'Online' : 'Offline ready'}
      </span>
      {pct != null ? (
        <span className={`aac-status-pill ${pct <= 20 ? 'is-low' : ''}`}>
          {batt?.charging ? '⚡' : '🔋'} {pct}%
        </span>
      ) : null}
    </div>
  )
}
