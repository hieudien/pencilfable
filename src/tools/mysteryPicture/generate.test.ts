import { describe, expect, it } from 'vitest'
import { ANSWER_POOLS, generatePicturePuzzle, isValidPicture, type Level, type OperationChoice } from './generate'
import { PICTURES } from './pictures'

const calc = (a: number, b: number, op: string) => ({ '+': a + b, '-': a - b, '×': a * b, '÷': a / b })[op as '+']

describe('mystery picture', () => {
  it('has well-formed 12×12 pictures with 3–4 colors each', () => {
    expect(PICTURES.length).toBeGreaterThanOrEqual(6)
    for (const p of PICTURES) {
      expect(isValidPicture(p)).toBe(true)
      expect(p.colors.length).toBeGreaterThanOrEqual(3)
      expect(p.colors.length).toBeLessThanOrEqual(4)
      // every color in the key is really used, so kids never see an unused color
      for (let i = 1; i <= p.colors.length; i++) expect(p.rows.join('')).toContain(String(i))
    }
    expect(new Set(PICTURES.map((p) => p.id)).size).toBe(PICTURES.length)
  })

  it('only uses composite answers, so every operation can make every answer', () => {
    for (const pool of Object.values(ANSWER_POOLS)) {
      for (const n of pool) expect(Array.from({ length: n - 2 }, (_, i) => i + 2).some((d) => n % d === 0)).toBe(true)
    }
  })

  for (const level of ['easy', 'medium', 'hard'] as Level[]) {
    for (const op of ['+', '-', '×', '÷', 'mixed'] as OperationChoice[]) {
      it(`every square's problem equals its color's answer (${level}, ${op})`, () => {
        for (const picture of PICTURES) {
          for (let seed = 1; seed <= 6; seed++) {
            const { key, problems } = generatePicturePuzzle(picture, op, level, seed)
            expect(key).toHaveLength(picture.colors.length)
            expect(new Set(key).size).toBe(key.length) // two colors never share an answer
            expect(problems).toHaveLength(12)
            problems.forEach((row, r) =>
              row.forEach((p, c) => {
                expect(p.answer).toBe(key[Number(picture.rows[r][c]) - 1])
                expect(calc(p.a, p.b, p.op)).toBe(p.answer)
                expect(p.a).toBeGreaterThan(0)
                expect(p.b).toBeGreaterThan(0)
              }),
            )
          }
        }
      })
    }
  }

  it('is deterministic for the same seed and changes with a new one', () => {
    const a = generatePicturePuzzle(PICTURES[0], 'mixed', 'medium', 3)
    expect(a).toEqual(generatePicturePuzzle(PICTURES[0], 'mixed', 'medium', 3))
    expect(a).not.toEqual(generatePicturePuzzle(PICTURES[0], 'mixed', 'medium', 4))
  })
})
