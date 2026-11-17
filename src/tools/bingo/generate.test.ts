import { describe, expect, it } from 'vitest'
import { cellsNeeded, FREE, generateBingoCards } from './generate'

const items = Array.from({ length: 40 }, (_, i) => `W${i + 1}`)

describe('bingo', () => {
  it('needs 24 items for a 5×5 card with a free space, 25 without', () => {
    expect(cellsNeeded(5, true)).toBe(24)
    expect(cellsNeeded(5, false)).toBe(25)
    expect(cellsNeeded(4, true)).toBe(16) // even-sized cards never get a free space
  })

  it('makes unique cards, each with distinct items and a free centre', () => {
    const cards = generateBingoCards({ items, size: 5, freeSpace: true, cards: 30, seed: 1 })
    expect(cards).toHaveLength(30)
    expect(new Set(cards.map((c) => c.join('|'))).size).toBe(30)
    for (const c of cards) {
      expect(c).toHaveLength(25)
      expect(c[12]).toBe(FREE)
      const real = c.filter((x) => x !== FREE)
      expect(new Set(real).size).toBe(24)
      for (const x of real) expect(items).toContain(x)
    }
  })

  it('returns nothing when there are not enough items', () => {
    expect(generateBingoCards({ items: items.slice(0, 10), size: 5, freeSpace: true, cards: 3, seed: 1 })).toEqual([])
  })

  it('is deterministic for the same seed', () => {
    const spec = { items, size: 4, freeSpace: false, cards: 5, seed: 99 }
    expect(generateBingoCards(spec)).toEqual(generateBingoCards(spec))
  })
})
