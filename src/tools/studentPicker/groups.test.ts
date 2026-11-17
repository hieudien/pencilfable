import { describe, expect, it } from 'vitest'
import { groupCount, landingRotation, makeGroups, sliceUnderPointer } from './groups'

const names = Array.from({ length: 23 }, (_, i) => `S${i + 1}`)

describe('group maker', () => {
  it('splits into the number of groups asked for, as evenly as possible', () => {
    const groups = makeGroups(names, 'count', 5, 1)
    expect(groups).toHaveLength(5)
    const sizes = groups.map((g) => g.length)
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1)
    expect(groups.flat().sort()).toEqual([...names].sort())
  })

  it('works out the number of groups from the group size', () => {
    expect(groupCount(23, 'size', 4)).toBe(6)
    expect(groupCount(23, 'size', 30)).toBe(1)
    expect(groupCount(0, 'size', 4)).toBe(0)
    expect(groupCount(3, 'count', 10)).toBe(3)
  })

  it('is deterministic for the same seed and different for another', () => {
    expect(makeGroups(names, 'count', 4, 7)).toEqual(makeGroups(names, 'count', 4, 7))
    expect(makeGroups(names, 'count', 4, 7)).not.toEqual(makeGroups(names, 'count', 4, 8))
  })
})

describe('spin wheel math', () => {
  it('lands the chosen slice under the pointer for every slice and any starting angle', () => {
    for (const total of [1, 2, 5, 12, 24, 30]) {
      for (let i = 0; i < total; i++) {
        for (const start of [0, 123.4, 1000]) {
          for (const jitter of [-0.5, 0, 0.5]) {
            const target = landingRotation(i, total, start, jitter)
            expect(target).toBeGreaterThan(start + 360 * 4) // always spins several full turns forward
            expect(sliceUnderPointer(target, total)).toBe(i)
          }
        }
      }
    }
  })
})
