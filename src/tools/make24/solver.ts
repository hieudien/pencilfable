/** Exact fractions so division never produces rounding errors (8 ÷ (3 − 8 ÷ 3) = 24). */
interface Frac {
  n: number
  d: number
}

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))
const frac = (n: number, d = 1): Frac => {
  const g = gcd(n, d) || 1
  return d < 0 ? { n: -n / g, d: -d / g } : { n: n / g, d: d / g }
}

interface Item {
  v: Frac
  e: string
  /** 1 = sum/difference, 2 = product/quotient, 3 = a plain number. Decides when brackets are needed. */
  prec: number
}

/** Put brackets around an operand only when its operator binds more loosely than the one around it. */
const wrap = (i: Item, minPrec: number) => (i.prec < minPrec ? `(${i.e})` : i.e)

function combine(a: Item, b: Item): Item[] {
  const out: Item[] = []
  const [x, y] = a.e <= b.e ? [a, b] : [b, a] // order operands so a + b and b + a are the same expression
  out.push({ v: frac(a.v.n * b.v.d + b.v.n * a.v.d, a.v.d * b.v.d), e: `${wrap(x, 1)} + ${wrap(y, 1)}`, prec: 1 })
  out.push({ v: frac(a.v.n * b.v.n, a.v.d * b.v.d), e: `${wrap(x, 2)} × ${wrap(y, 2)}`, prec: 2 })
  out.push({ v: frac(a.v.n * b.v.d - b.v.n * a.v.d, a.v.d * b.v.d), e: `${wrap(a, 1)} − ${wrap(b, 2)}`, prec: 1 })
  out.push({ v: frac(b.v.n * a.v.d - a.v.n * b.v.d, a.v.d * b.v.d), e: `${wrap(b, 1)} − ${wrap(a, 2)}`, prec: 1 })
  if (b.v.n !== 0) out.push({ v: frac(a.v.n * b.v.d, a.v.d * b.v.n), e: `${wrap(a, 2)} ÷ ${wrap(b, 3)}`, prec: 2 })
  if (a.v.n !== 0) out.push({ v: frac(b.v.n * a.v.d, b.v.d * a.v.n), e: `${wrap(b, 2)} ÷ ${wrap(a, 3)}`, prec: 2 })
  return out
}

function search(items: Item[], target: number, found: Set<string>) {
  if (items.length === 1) {
    const { v, e } = items[0]
    if (v.d === 1 && v.n === target) found.add(e)
    return
  }
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const rest = items.filter((_, k) => k !== i && k !== j)
      for (const c of combine(items[i], items[j])) search([...rest, c], target, found)
    }
  }
}

/** All different ways to reach `target` using every number exactly once (each written once, brackets included). */
export function solutions(numbers: number[], target: number): string[] {
  const found = new Set<string>()
  search(numbers.map((n) => ({ v: frac(n), e: String(n), prec: 3 })), target, found)
  return [...found].sort((a, b) => a.length - b.length || (a < b ? -1 : 1))
}

export const isSolvable = (numbers: number[], target: number) => solutions(numbers, target).length > 0
