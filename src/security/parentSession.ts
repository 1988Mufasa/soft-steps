/**
 * Grown-up unlock session — short-lived, idle-expiring, sessionStorage only.
 * Not a server credential; stops casual reuse of /parent/* after unlock.
 */

const KEY = 'soft-steps-parent-session'
/** Absolute max lifetime after unlock */
export const PARENT_SESSION_MAX_MS = 15 * 60_000
/** Idle timeout — no touch → lock again */
export const PARENT_SESSION_IDLE_MS = 5 * 60_000

export type ParentSession = {
  /** Random opaque token (presence + timestamps matter) */
  token: string
  createdAt: number
  lastActiveAt: number
}

function randomToken() {
  const buf = new Uint8Array(24)
  crypto.getRandomValues(buf)
  return [...buf].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function read(): ParentSession | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ParentSession
    if (!parsed?.token || !parsed.createdAt || !parsed.lastActiveAt) return null
    return parsed
  } catch {
    return null
  }
}

function write(session: ParentSession) {
  sessionStorage.setItem(KEY, JSON.stringify(session))
}

export function clearParentSession() {
  try {
    sessionStorage.removeItem(KEY)
    // Legacy flag used before timed sessions
    sessionStorage.removeItem('soft-steps-parent-ok')
  } catch {
    /* ignore */
  }
}

export function openParentSession(): ParentSession {
  const now = Date.now()
  const session: ParentSession = {
    token: randomToken(),
    createdAt: now,
    lastActiveAt: now,
  }
  write(session)
  return session
}

export function isParentSessionValid(): boolean {
  const session = read()
  if (!session) return false
  const now = Date.now()
  if (now - session.createdAt > PARENT_SESSION_MAX_MS) {
    clearParentSession()
    return false
  }
  if (now - session.lastActiveAt > PARENT_SESSION_IDLE_MS) {
    clearParentSession()
    return false
  }
  return true
}

/** Refresh idle clock while grown-up pages are in use. */
export function touchParentSession(): boolean {
  if (!isParentSessionValid()) return false
  const session = read()
  if (!session) return false
  write({ ...session, lastActiveAt: Date.now() })
  return true
}

export function parentSessionRemainingMs(): number {
  const session = read()
  if (!session) return 0
  const now = Date.now()
  const absLeft = PARENT_SESSION_MAX_MS - (now - session.createdAt)
  const idleLeft = PARENT_SESSION_IDLE_MS - (now - session.lastActiveAt)
  return Math.max(0, Math.min(absLeft, idleLeft))
}
