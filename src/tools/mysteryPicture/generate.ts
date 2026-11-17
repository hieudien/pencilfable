import { createRng, pick, randInt, shuffle, type Rng } from '../../lib/rng'
import { SIZE, type Picture } from './pictures'

export type Operation = '+' | '-' | '×' | '÷'
export type OperationChoice = Operation | 'mixed'
export type Level = 'easy' | 'medium' | 'hard'

export interface Problem {
  a: number
  b: number
  op: Operation
  answer: number
}

/** The answers that get a color. All are composite, so multiplication and division always work. */
export const ANSWER_POOLS: Record<Level, number[]> = {
  easy: [4, 6, 8, 9, 10, 12],
  medium: [12, 14, 15, 16, 18, 20, 21, 24],
  hard: [24, 28, 32, 36, 40, 42, 45, 48, 54, 56, 63, 72],
}

const LIMITS: Record<Level, { maxSubtrahend: number; maxDivisor: number }> = {
  easy: { maxSubtrahend: 9, maxDivisor: 5 },
  medium: { maxSubtrahend: 20, maxDivisor: 9 },
  hard: { maxSubtrahend: 50, maxDivisor: 6 },
}

/** A problem whose answer is exactly `ans`. */
export function problemFor(op: Operation, ans: number, level: Level, rng: Rng): Problem {
  const { maxSubtrahend, maxDivisor } = LIMITS[level]
  switch (op) {
    case '+': {
      const a = randInt(rng, 1, ans - 1)
      return { a, b: ans - a, op, answer: ans }
    }
    case '-': {
      const b = randInt(rng, 1, maxSubtrahend)
      return { a: ans + b, b, op, answer: ans }
    }
    case '×': {
      const pairs: [number, number][] = []
      for (let a = 2; a <= 12; a++) if (ans % a === 0 && ans / a >= 2 && ans / a <= 12) pairs.push([a, ans / a])
      if (pairs.length === 0) return problemFor('+', ans, level, rng)
      const [a, b] = pick(rng, pairs)
      return { a, b, op, answer: ans }
    }
    case '÷': {
      const b = randInt(rng, 2, maxDivisor)
      return { a: ans * b, b, op, answer: ans }
    }
  }
}

const OPS: Operation[] = ['+', '-', '×', '÷']

export interface PicturePuzzle {
  /** key[i] = the answer that means color i of the picture */
  key: number[]
  /** problems[row][col] is the problem for that square */
  problems: Problem[][]
}

/** Picks which answer belongs to which color, then one problem per square. */
export function generatePicturePuzzle(picture: Picture, choice: OperationChoice, level: Level, seed: number): PicturePuzzle {
  const rng = createRng(seed)
  const key = shuffle(rng, ANSWER_POOLS[level]).slice(0, picture.colors.length)
  const problems = picture.rows.map((row) =>
    Array.from(row).map((digit) => problemFor(choice === 'mixed' ? pick(rng, OPS) : choice, key[Number(digit) - 1], level, rng)),
  )
  return { key, problems }
}

export function isValidPicture(p: Picture): boolean {
  return (
    p.rows.length === SIZE &&
    p.rows.every((r) => r.length === SIZE && Array.from(r).every((d) => Number(d) >= 1 && Number(d) <= p.colors.length))
  )
}
