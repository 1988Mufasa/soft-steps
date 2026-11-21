/** Local PIN brute-force protection — persisted so refresh cannot reset the throttle. */

const KEY = 'soft-steps-pin-guard'
const MAX_ATTEMPTS = 5
/** Escalating lock: 1 min → 5 min → 15 min after repeated lockouts in a day */
const LOCK_STEPS_MS = [60_000, 5 * 60_000, 15 * 60_000]

type GuardState = {
  fails: number
  lockedUntil: number
  /** How many times we hit a lockout today */
  lockoutsToday: number
  dayKey: string
}

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function read(): GuardState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { fails: 0, lockedUntil: 0, lockoutsToday: 0, dayKey: todayKey() }
    const parsed = JSON.parse(raw) as GuardState
    const dayKey = todayKey()
    if (parsed.dayKey !== dayKey) {
      return { fails: 0, lockedUntil: parsed.lockedUntil > Date.now() ? parsed.lockedUntil : 0, lockoutsToday: 0, dayKey }
    }
    return {
      fails: Number(parsed.fails) || 0,
      lockedUntil: Number(parsed.lockedUntil) || 0,
      lockoutsToday: Number(parsed.lockoutsToday) || 0,
      dayKey,
    }
  } catch {
    return { fails: 0, lockedUntil: 0, lockoutsToday: 0, dayKey: todayKey() }
  }
}

function write(state: GuardState) {
  localStorage.setItem(KEY, JSON.stringify(state))
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
    const step = Math.min(state.lockoutsToday, LOCK_STEPS_MS.length - 1)
    const lockMs = LOCK_STEPS_MS[step]
    const lockedUntil = Date.now() + lockMs
    write({
      fails: 0,
      lockedUntil,
      lockoutsToday: state.lockoutsToday + 1,
      dayKey: todayKey(),
    })
    return { locked: true, remainingMs: lockMs }
  }
  write({ ...state, fails, dayKey: todayKey() })
  return { locked: false, remainingMs: 0 }
}

export function clearPinFailures() {
  const state = read()
  write({
    fails: 0,
    lockedUntil: 0,
    lockoutsToday: state.lockoutsToday,
    dayKey: todayKey(),
  })
}

export const PIN_GUARD = {
  MAX_ATTEMPTS,
  LOCK_MS: LOCK_STEPS_MS[0],
  LOCK_STEPS_MS,
}
