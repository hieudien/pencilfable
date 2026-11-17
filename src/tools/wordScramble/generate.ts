import { createRng, shuffle, type Rng } from '../../lib/rng'
import { parseList } from '../../lib/text'

export interface ScrambleItem {
  answer: string
  scrambled: string[]
}

export function parseScrambleWords(raw: string): string[] {
  return parseList(raw)
    .map((w) => w.normalize('NFC').toLocaleUpperCase().replace(/[^\p{L}\p{N}]/gu, ''))
    .filter((w) => Array.from(w).length >= 2)
    .filter((w, i, all) => all.indexOf(w) === i)
}

/** Shuffle letters so the result is never the original word (unless that is impossible, e.g. "AA"). */
export function scrambleLetters(letters: string[], keepFirst: boolean, rng: Rng): string[] {
  const head = keepFirst ? letters.slice(0, 1) : []
  const tail = keepFirst ? letters.slice(1) : letters
  const original = letters.join('')
  const canChange = new Set(tail).size > 1
  if (!canChange) return letters
  for (let i = 0; i < 50; i++) {
    const out = [...head, ...shuffle(rng, tail)]
    if (out.join('') !== original) return out
  }
  // Extremely unlikely: fall back to a simple rotation, which always differs when letters aren't all equal.
  return [...head, ...tail.slice(1), tail[0]]
}

export function generateScramble(words: string[], keepFirst: boolean, seed: number): ScrambleItem[] {
  const rng = createRng(seed)
  return words.map((answer) => ({ answer, scrambled: scrambleLetters(Array.from(answer), keepFirst, rng) }))
}
