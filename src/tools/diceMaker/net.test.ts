import { describe, expect, it } from 'vitest'
import { DOT_FACE_NUMBERS, hasNeighbor, NET_CELLS, outerEdges, TABS } from './net'

describe('dice net', () => {
  it('has six faces in a cross shape', () => {
    expect(NET_CELLS).toHaveLength(6)
    expect(new Set(NET_CELLS.map((c) => `${c.row},${c.col}`)).size).toBe(6)
    expect(new Set(NET_CELLS.map((c) => c.face)).size).toBe(6)
  })

  it('has 14 outer edges, and glue tabs on exactly half of them', () => {
    const outer = outerEdges()
    expect(outer).toHaveLength(14) // a cube net always has 14 outer edges, glued in 7 pairs
    expect(TABS).toHaveLength(7)
    for (const t of TABS) {
      expect(hasNeighbor(t.row, t.col, t.side)).toBe(false) // a tab sits on a cut edge, never on a fold
      expect(outer.some((e) => e.row === t.row && e.col === t.col && e.side === t.side)).toBe(true)
    }
    expect(new Set(TABS.map((t) => `${t.row},${t.col},${t.side}`)).size).toBe(7)
  })

  it('has no tab on the top or bottom faces (they only receive glued edges)', () => {
    for (const t of TABS) expect(t.col === 1 && t.row !== 1).toBe(false)
  })

  it('numbers opposite faces so they add up to 7', () => {
    const n = DOT_FACE_NUMBERS
    expect(new Set(n).size).toBe(6)
    expect(n[0] + n[2]).toBe(7) // left + right
    expect(n[1] + n[3]).toBe(7) // front + back
    expect(n[4] + n[5]).toBe(7) // top + bottom
  })
})
