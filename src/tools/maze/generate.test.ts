import { describe, expect, it } from 'vitest'
import { generateMaze, MAZE_LEVELS, type MazeLevel } from './generate'

const levels = Object.keys(MAZE_LEVELS) as MazeLevel[]

describe('maze', () => {
  for (const level of levels) {
    it(`always has a valid route from start to finish (${level})`, () => {
      for (let seed = 1; seed <= 30; seed++) {
        const m = generateMaze(level, seed)
        const path = m.solution
        expect(path.length).toBeGreaterThan(1)
        expect(path[0]).toEqual([0, 0])
        expect(path[path.length - 1]).toEqual([m.rows - 1, m.cols - 1])
        for (let i = 1; i < path.length; i++) {
          const [r0, c0] = path[i - 1]
          const [r1, c1] = path[i]
          if (r1 === r0 + 1 && c1 === c0) expect(m.downOpen[r0][c0]).toBe(true)
          else if (r1 === r0 - 1 && c1 === c0) expect(m.downOpen[r1][c1]).toBe(true)
          else if (c1 === c0 + 1 && r1 === r0) expect(m.rightOpen[r0][c0]).toBe(true)
          else if (c1 === c0 - 1 && r1 === r0) expect(m.rightOpen[r1][c1]).toBe(true)
          else throw new Error(`non-adjacent step ${path[i - 1]} -> ${path[i]}`)
        }
      }
    })
  }

  it('is a perfect maze (every cell reachable, no loops) on medium and hard', () => {
    for (const level of ['medium', 'hard'] as const) {
      const m = generateMaze(level, 42)
      let passages = 0
      for (let r = 0; r < m.rows; r++) for (let c = 0; c < m.cols; c++) passages += Number(m.rightOpen[r][c]) + Number(m.downOpen[r][c])
      // a spanning tree over N cells has exactly N-1 edges
      expect(passages).toBe(m.rows * m.cols - 1)
    }
  })

  it('is deterministic for the same seed', () => {
    expect(generateMaze('medium', 5)).toEqual(generateMaze('medium', 5))
    expect(generateMaze('medium', 5)).not.toEqual(generateMaze('medium', 6))
  })
})
