export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export type WeekStart = 0 | 1 // 0 = Sunday, 1 = Monday

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
}

/** Weekday of the 1st, 0 = Sunday. Uses UTC so the user's time zone can never shift the date. */
export function firstWeekday(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 1)).getUTCDay()
}

/** Rows of 7 cells: a day number, or null for the empty cells before/after the month. */
export function buildMonth(year: number, month: number, weekStart: WeekStart): (number | null)[][] {
  const offset = (firstWeekday(year, month) - weekStart + 7) % 7
  const total = daysInMonth(year, month)
  const cells: (number | null)[] = [...Array<null>(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

/** Weekday header names in display order. */
export function weekdayOrder(weekStart: WeekStart): number[] {
  return Array.from({ length: 7 }, (_, i) => (i + weekStart) % 7)
}
