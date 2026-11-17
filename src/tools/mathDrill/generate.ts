import { createRng, pick, randInt, type Rng } from '../../lib/rng'

export type Operation = '+' | '-' | '×' | '÷'
export type OperationChoice = Operation | 'mixed'

export interface Problem {
  a: number
  b: number
  op: Operation
  answer: number
}

/** Times tables stop at 12 – asking for 87 × 94 is not a "drill" for elementary kids. */
export function factorCap(max: number): number {
  return Math.min(max, 12)
}

function make(op: Operation, max: number, rng: Rng): Problem {
  switch (op) {
    case '+': {
      const a = randInt(rng, 1, max)
      const b = randInt(rng, 1, max)
      return { a, b, op, answer: a + b }
    }
    case '-': {
      const x = randInt(rng, 1, max)
      const y = randInt(rng, 1, max)
      const a = Math.max(x, y)
      const b = Math.min(x, y)
      return { a, b, op, answer: a - b } // never negative
    }
    case '×': {
      const cap = factorCap(max)
      const a = randInt(rng, 1, cap)
      const b = randInt(rng, 1, cap)
      return { a, b, op, answer: a * b }
    }
    case '÷': {
      const cap = factorCap(max)
      const b = randInt(rng, 2, Math.max(2, cap)) // divisor
      const q = randInt(rng, 1, cap) // answer
      return { a: b * q, b, op, answer: q } // always divides exactly
    }
  }
}

const ALL_OPS: Operation[] = ['+', '-', '×', '÷']

export function generateProblems(choice: OperationChoice, max: number, count: number, seed: number): Problem[] {
  const rng = createRng(seed)
  const seen = new Set<string>()
  const out: Problem[] = []
  let guard = 0
  while (out.length < count) {
    const op = choice === 'mixed' ? pick(rng, ALL_OPS) : choice
    const p = make(op, max, rng)
    const key = `${p.a}${p.op}${p.b}`
    // Avoid repeats, but give up after a while for tiny ranges so we always return `count` problems.
    if (seen.has(key) && guard++ < 3000) continue
    seen.add(key)
    out.push(p)
  }
  return out
}
