import type { Routine } from '../types'

/** True if hour is inside [start, end), wrapping past midnight when needed. */
export function hourInWindow(hour: number, startHour: number, endHour: number) {
  if (startHour === endHour) return true
  if (startHour < endHour) return hour >= startHour && hour < endHour
  return hour >= startHour || hour < endHour
}

export function pickRoutineForHour(routines: Routine[], hour = new Date().getHours()) {
  const withHours = routines.filter((r) => r.hours)
  const match = withHours.find((r) =>
    r.hours ? hourInWindow(hour, r.hours.startHour, r.hours.endHour) : false,
  )
  return match ?? routines[0] ?? null
}
