import { describe, expect, it } from 'vitest'
import { generateCards, MAX_NUMBER, WAYS_BAND, type Level, type Target } from './generate'
import { isSolvable, solutions } from './solver'

/** Evaluate a printed solution such as "(7 − 8 ÷ 8) × 4" the ordinary way. */
const evaluate = (expr: string) => Function(`"use strict"; return (${expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')})`)() as number

describe('four numbers solver', () => {
  it('finds the famous hard one: 3, 3, 8, 8 → 8 ÷ (3 − 8 ÷ 3)', () => {
    const found = solutions([3, 3, 8, 8], 24)
    expect(found).toContain('8 ÷ (3 − 8 ÷ 3)')
  })

  it('knows when there is no way', () => {
    expect(isSolvable([1, 1, 1, 1], 24)).toBe(false)
    expect(isSolvable([1, 1, 1, 8], 24)).toBe(true) // (1 + 1 + 1) × 8
  })

  it('only returns expressions that really equal the target and use each number once', () => {
    for (const [nums, target] of [[[4, 7, 8, 8], 24], [[2, 3, 5, 12], 10], [[6, 6, 6, 6], 12]] as [number[], number][]) {
      const found = solutions(nums, target)
      expect(found.length).toBeGreaterThan(0)
      for (const e of found) {
        expect(Math.abs(evaluate(e) - target)).toBeLessThan(1e-9)
        expect(e.match(/\d+/g)!.map(Number).sort((a, b) => a - b)).toEqual([...nums].sort((a, b) => a - b))
      }
    }
  })

  it('counts a + b and b + a as one way', () => {
    const found = solutions([1, 2, 3, 4], 10)
    expect(found.filter((e) => e === '1 + 2 + 3 + 4').length).toBeLessThanOrEqual(1)
  })
})

describe('four numbers cards', () => {
  for (const target of [10, 12, 24] as Target[]) {
    for (const level of ['easy', 'medium', 'hard'] as Level[]) {
      it(`makes solvable, different cards (${target}, ${level})`, () => {
        for (const seed of [1, 2, 3]) {
          const cards = generateCards(12, target, level, seed)
          expect(cards).toHaveLength(12)
          expect(new Set(cards.map((c) => [...c.numbers].sort((a, b) => a - b).join())).size).toBe(12)
          for (const c of cards) {
            expect(c.numbers).toHaveLength(4)
            for (const n of c.numbers) {
              expect(n).toBeGreaterThanOrEqual(1)
              expect(n).toBeLessThanOrEqual(MAX_NUMBER[level])
            }
            expect(Math.abs(evaluate(c.solution) - target)).toBeLessThan(1e-9)
            expect(solutions(c.numbers, target).length).toBe(c.ways)
          }
        }
      })
    }
  }

  it('matches the difficulty the teacher asked for', () => {
    for (const level of ['easy', 'medium', 'hard'] as Level[]) {
      const cards = generateCards(12, 24, level, 5)
      const [lo, hi] = WAYS_BAND[level]
      for (const c of cards) {
        expect(c.ways).toBeGreaterThanOrEqual(lo)
        expect(c.ways).toBeLessThanOrEqual(hi)
      }
    }
  })

  it('is deterministic for the same seed and changes with a new one', () => {
    expect(generateCards(8, 24, 'medium', 4)).toEqual(generateCards(8, 24, 'medium', 4))
    expect(generateCards(8, 24, 'medium', 4)).not.toEqual(generateCards(8, 24, 'medium', 5))
  })
})
