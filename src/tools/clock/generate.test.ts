import { describe, expect, it } from 'vitest'
import { formatTime, generateTimes, handAngles, type Precision } from './generate'

describe('clock worksheets', () => {
  it('points the hands correctly', () => {
    expect(handAngles({ h: 3, m: 0 })).toEqual({ hour: 90, minute: 0 })
    expect(handAngles({ h: 12, m: 0 })).toEqual({ hour: 0, minute: 0 })
    expect(handAngles({ h: 6, m: 30 })).toEqual({ hour: 195, minute: 180 })
    expect(handAngles({ h: 9, m: 45 })).toEqual({ hour: 292.5, minute: 270 })
    expect(handAngles({ h: 1, m: 5 })).toEqual({ hour: 32.5, minute: 30 })
  })

  it('writes times like a digital clock', () => {
    expect(formatTime({ h: 3, m: 5 })).toBe('3:05')
    expect(formatTime({ h: 12, m: 30 })).toBe('12:30')
  })

  const allowed: Record<Precision, (m: number) => boolean> = {
    hour: (m) => m === 0,
    half: (m) => m === 0 || m === 30,
    quarter: (m) => m % 15 === 0,
    five: (m) => m % 5 === 0,
  }
  for (const precision of ['hour', 'half', 'quarter', 'five'] as Precision[]) {
    it(`only uses ${precision} times and never repeats while there is room`, () => {
      for (let seed = 1; seed <= 20; seed++) {
        const times = generateTimes(12, precision, seed)
        expect(times).toHaveLength(12)
        for (const t of times) {
          expect(t.h).toBeGreaterThanOrEqual(1)
          expect(t.h).toBeLessThanOrEqual(12)
          expect(allowed[precision](t.m)).toBe(true)
        }
        expect(new Set(times.map(formatTime)).size).toBe(12)
      }
    })
  }

  it('still returns enough clocks when there are fewer possible times', () => {
    expect(generateTimes(20, 'hour', 1)).toHaveLength(20)
  })

  it('is deterministic for the same seed', () => {
    expect(generateTimes(9, 'five', 5)).toEqual(generateTimes(9, 'five', 5))
  })
})
