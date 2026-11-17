import { describe, expect, it } from 'vitest'
import { generateWordSearch, parseWordSearchWords, placedCells } from './generate'

const words = parseWordSearchWords('apple, banana\ncherry\ngrape\nlemon\nmango\norange\npeach\npear\nplum')

describe('word search', () => {
  it('parses words from lines and commas, removing duplicates', () => {
    expect(parseWordSearchWords('cat, dog\ncat\n  bird ').map((w) => w.label)).toEqual(['CAT', 'DOG', 'BIRD'])
  })

  for (const difficulty of ['easy', 'medium', 'hard'] as const) {
    it(`reads every placed word back from the grid (${difficulty})`, () => {
      for (let seed = 1; seed <= 25; seed++) {
        const p = generateWordSearch(words, 12, difficulty, seed)
        expect(p.placed.length + p.unplaced.length).toBe(words.length)
        for (const w of p.placed) {
          const read = w.letters.map((_, i) => p.grid[w.row + w.dr * i][w.col + w.dc * i])
          expect(read).toEqual(w.letters)
        }
      }
    })
  }

  it('is deterministic for the same seed and differs for another', () => {
    const a = generateWordSearch(words, 12, 'medium', 7)
    const b = generateWordSearch(words, 12, 'medium', 7)
    const c = generateWordSearch(words, 12, 'medium', 8)
    expect(a.grid).toEqual(b.grid)
    expect(a.grid).not.toEqual(c.grid)
  })

  it('reports words that cannot fit instead of dropping them silently', () => {
    const p = generateWordSearch(parseWordSearchWords('extraordinarily, cat'), 10, 'easy', 1)
    expect(p.unplaced.map((w) => w.label)).toEqual(['EXTRAORDINARILY'])
    expect(p.placed.map((w) => w.label)).toEqual(['CAT'])
  })

  it('only uses easy directions (right/down) on easy', () => {
    const p = generateWordSearch(words, 12, 'easy', 3)
    for (const w of p.placed) expect(w.dr >= 0 && w.dc >= 0 && w.dr + w.dc === 1).toBe(true)
  })

  it('keeps accented letters and highlights the right cells', () => {
    const p = generateWordSearch(parseWordSearchWords('élève, ñandú'), 10, 'easy', 2)
    expect(p.placed).toHaveLength(2)
    expect(placedCells(p).size).toBeGreaterThanOrEqual(8)
  })
})
