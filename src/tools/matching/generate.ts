import { createRng, shuffle } from '../../lib/rng'

export interface Pair {
  left: string
  right: string
}

/** One pair per line, written as `left | right` (an `=`, a tab or `->` also work). */
export function parsePairs(raw: string): Pair[] {
  const out: Pair[] = []
  for (const line of raw.split('\n')) {
    const m = line.match(/^(.*?)\s*(?:\||=|->|\t)\s*(.*)$/)
    if (!m) continue
    const left = m[1].trim()
    const right = m[2].trim()
    if (left && right) out.push({ left, right })
  }
  return out
}

/**
 * Order of the right-hand column: `order[i]` is which pair is shown in right slot i.
 * With 2+ pairs nothing ever sits level with its own partner, so kids have to draw real lines.
 */
export function matchOrder(n: number, seed: number): number[] {
  const rng = createRng(seed)
  const base = Array.from({ length: n }, (_, i) => i)
  if (n < 2) return base
  for (let i = 0; i < 200; i++) {
    const p = shuffle(rng, base)
    if (p.every((v, idx) => v !== idx)) return p
  }
  return base.map((_, i) => (i + 1) % n) // guaranteed fallback: shift by one
}
