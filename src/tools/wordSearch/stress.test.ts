import { describe, expect, it } from 'vitest'
import { createRng, randInt } from '../../lib/rng'
import { generateWordSearch, type Difficulty, type WordEntry } from './generate'

/** Realistic teacher lists: n words of 3–9 letters. */
function randomWords(n: number, seed: number, maxLen: number): WordEntry[] {
  const rng = createRng(seed)
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const seen = new Set<string>()
  const out: WordEntry[] = []
  while (out.length < n) {
    const len = randInt(rng, 3, maxLen)
    const w = Array.from({ length: len }, () => letters[randInt(rng, 0, 25)]).join('')
    if (seen.has(w)) continue
    seen.add(w)
    out.push({ label: w, letters: Array.from(w) })
  }
  return out
}

describe('word search always fits the words a teacher can reasonably ask for', () => {
  const cases: { size: number; words: number; maxLen: number }[] = [
    { size: 10, words: 8, maxLen: 7 },
    { size: 10, words: 12, maxLen: 8 },
    { size: 12, words: 15, maxLen: 9 },
    { size: 15, words: 20, maxLen: 10 },
    { size: 15, words: 30, maxLen: 8 },
    { size: 18, words: 30, maxLen: 10 },
  ]
  for (const difficulty of ['easy', 'medium', 'hard'] as Difficulty[]) {
    for (const c of cases) {
      it(`places every word: ${c.words} words up to ${c.maxLen} letters on ${c.size}×${c.size} (${difficulty})`, () => {
        let failures = 0
        for (let seed = 1; seed <= 60; seed++) {
          const words = randomWords(c.words, seed * 31, Math.min(c.maxLen, c.size))
          const p = generateWordSearch(words, c.size, difficulty, seed)
          if (p.unplaced.length > 0) failures++
          // whatever is placed must really be in the grid
          for (const w of p.placed) {
            expect(w.letters.map((_, i) => p.grid[w.row + w.dr * i][w.col + w.dc * i])).toEqual(w.letters)
          }
        }
        expect(failures, `${failures}/60 puzzles left words out`).toBe(0)
      })
    }
  }

  it('stays fast enough to run on every keystroke', () => {
    const words = randomWords(30, 5, 10)
    const t0 = performance.now()
    for (let seed = 1; seed <= 20; seed++) generateWordSearch(words, 18, 'hard', seed)
    expect((performance.now() - t0) / 20).toBeLessThan(60) // ms per puzzle
  })
})
