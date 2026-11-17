import { createRng, shuffle } from '../../lib/rng'

export interface QA {
  q: string
  a: string
}

export interface HaveCard {
  /** The answer this card holds: "I have ..." */
  have: string
  /** The next question: "Who has ...?" */
  who: string
  /** The first card: its holder starts by reading only the "Who has" line */
  start: boolean
}

/** One item per line: `3 + 4 | 7` (question | answer). */
export function parseQA(raw: string): QA[] {
  const out: QA[] = []
  for (const line of raw.split('\n')) {
    const m = line.match(/^(.*?)\s*(?:\||=|->|\t)\s*(.*)$/)
    if (!m) continue
    const q = m[1].trim()
    const a = m[2].trim()
    if (q && a) out.push({ q, a })
  }
  return out
}

/**
 * Builds the closed loop: card k says "I have A_k. Who has Q_(k+1)?", and the last card asks Q_0,
 * which brings the game back to the first card. Every question is asked once and answered once.
 */
export function buildChain(items: QA[], seed: number): HaveCard[] {
  const order = shuffle(createRng(seed), items)
  return order.map((item, k) => ({
    have: item.a,
    who: order[(k + 1) % order.length].q,
    start: k === 0,
  }))
}

/** Answers used more than once. Two students would both answer "Who has…?", so each answer must be unique. */
export function duplicateAnswers(items: QA[]): string[] {
  const seen = new Set<string>()
  const dup = new Set<string>()
  for (const { a } of items) {
    const key = a.toLowerCase()
    if (seen.has(key)) dup.add(a)
    seen.add(key)
  }
  return [...dup]
}
