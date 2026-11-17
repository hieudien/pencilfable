import { describe, expect, it } from 'vitest'
import { buildMonth, daysInMonth, firstWeekday, weekdayOrder } from './months'

describe('calendar', () => {
  it('knows month lengths, including leap years', () => {
    expect(daysInMonth(2024, 1)).toBe(29)
    expect(daysInMonth(2025, 1)).toBe(28)
    expect(daysInMonth(2026, 10)).toBe(30)
    expect(daysInMonth(2026, 11)).toBe(31)
    expect(daysInMonth(1900, 1)).toBe(28)
    expect(daysInMonth(2000, 1)).toBe(29)
  })

  it('finds the first weekday (0 = Sunday)', () => {
    expect(firstWeekday(2026, 10)).toBe(0) // 1 Nov 2026 is a Sunday
    expect(firstWeekday(2024, 1)).toBe(4) // 1 Feb 2024 is a Thursday
    expect(firstWeekday(2000, 0)).toBe(6) // 1 Jan 2000 is a Saturday
  })

  it('lays out weeks starting on Sunday', () => {
    const weeks = buildMonth(2026, 10, 0)
    expect(weeks[0]).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(weeks[weeks.length - 1]).toEqual([29, 30, null, null, null, null, null])
  })

  it('shifts the grid when the week starts on Monday', () => {
    const weeks = buildMonth(2026, 10, 1)
    expect(weeks[0]).toEqual([null, null, null, null, null, null, 1])
    expect(weeks[1]).toEqual([2, 3, 4, 5, 6, 7, 8])
  })

  it('always uses full weeks and contains every day exactly once', () => {
    for (let year = 2023; year <= 2028; year++) {
      for (let month = 0; month < 12; month++) {
        for (const start of [0, 1] as const) {
          const weeks = buildMonth(year, month, start)
          expect(weeks.every((w) => w.length === 7)).toBe(true)
          expect(weeks.length).toBeGreaterThanOrEqual(4)
          expect(weeks.length).toBeLessThanOrEqual(6)
          const days = weeks.flat().filter((d): d is number => d !== null)
          expect(days).toEqual(Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1))
        }
      }
    }
  })

  it('orders the weekday headers', () => {
    expect(weekdayOrder(0)).toEqual([0, 1, 2, 3, 4, 5, 6])
    expect(weekdayOrder(1)).toEqual([1, 2, 3, 4, 5, 6, 0])
  })
})
