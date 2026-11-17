import { describe, expect, it } from 'vitest'
import { generateProblems, type Operation } from './generate'

const compute = (a: number, b: number, op: Operation) => ({ '+': a + b, '-': a - b, '×': a * b, '÷': a / b })[op]

describe('math drill', () => {
  for (const op of ['+', '-', '×', '÷', 'mixed'] as const) {
    for (const max of [10, 20, 100]) {
      it(`makes correct answers for ${op} up to ${max}`, () => {
        for (let seed = 1; seed <= 20; seed++) {
          const ps = generateProblems(op, max, 50, seed)
          expect(ps).toHaveLength(50)
          for (const p of ps) {
            expect(compute(p.a, p.b, p.op)).toBe(p.answer)
            expect(Number.isInteger(p.answer)).toBe(true)
            expect(p.answer).toBeGreaterThanOrEqual(0)
            expect(p.b).toBeGreaterThan(0)
            if (p.op === '+' || p.op === '-') expect(p.a).toBeLessThanOrEqual(max * (p.op === '+' ? 1 : 1))
          }
        }
      })
    }
  }

  it('does not repeat problems when there is room', () => {
    const ps = generateProblems('+', 20, 50, 9)
    expect(new Set(ps.map((p) => `${p.a}+${p.b}`)).size).toBe(50)
  })

  it('still returns the full count when the range is tiny', () => {
    expect(generateProblems('÷', 10, 50, 1)).toHaveLength(50)
  })

  it('is deterministic for the same seed', () => {
    expect(generateProblems('mixed', 20, 20, 3)).toEqual(generateProblems('mixed', 20, 20, 3))
  })
})
