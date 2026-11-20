/** Local PIN brute-force protection (client-side throttle). */

const KEY = 'soft-steps-pin-guard'
const MAX_ATTEMPTS = 5
const LOCK_MS = 60_000

type GuardState = {
  fails: number
  lockedUntil: number
}

function read(): GuardState {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return { fails: 0, lockedUntil: 0 }
    return JSON.parse(raw) as GuardState
  } catch {
    return { fails: 0, lockedUntil: 0 }
  }
}

function write(state: GuardState) {
  sessionStorage.setItem(KEY, JSON.stringify(state))
}

export function getPinLockRemainingMs(): number {
  const { lockedUntil } = read()
  return Math.max(0, lockedUntil - Date.now())
}

export function isPinLocked(): boolean {
  return getPinLockRemainingMs() > 0
}

export function recordPinFailure(): { locked: boolean; remainingMs: number } {
  const state = read()
  if (state.lockedUntil > Date.now()) {
    return { locked: true, remainingMs: state.lockedUntil - Date.now() }
  }
  const fails = state.fails + 1
  if (fails >= MAX_ATTEMPTS) {
    const lockedUntil = Date.now() + LOCK_MS
    write({ fails: 0, lockedUntil })
    return { locked: true, remainingMs: LOCK_MS }
  }
  write({ fails, lockedUntil: 0 })
  return { locked: false, remainingMs: 0 }
}

export function clearPinFailures() {
  write({ fails: 0, lockedUntil: 0 })
}

export const PIN_GUARD = { MAX_ATTEMPTS, LOCK_MS }
