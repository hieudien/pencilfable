import { describe, expect, it } from 'vitest'
import { BOX, CLUES, countSolutions, generateSudoku, type SudokuLevel, type SudokuSize } from './generate'

function isValidSolution(g: number[], size: number): boolean {
  const want = Array.from({ length: size }, (_, i) => i + 1).join()
  const { r: br, c: bc } = BOX[size as SudokuSize]
  for (let i = 0; i < size; i++) {
    const row = g.slice(i * size, i * size + size).sort().join()
    const col = Array.from({ length: size }, (_, k) => g[k * size + i]).sort().join()
    if (row !== want || col !== want) return false
  }
  for (let r0 = 0; r0 < size; r0 += br) {
    for (let c0 = 0; c0 < size; c0 += bc) {
      const box: number[] = []
      for (let i = 0; i < br; i++) for (let j = 0; j < bc; j++) box.push(g[(r0 + i) * size + c0 + j])
      if (box.sort().join() !== want) return false
    }
  }
  return true
}

describe('kids sudoku', () => {
  for (const size of [4, 6] as SudokuSize[]) {
    for (const level of ['easy', 'medium', 'hard'] as SudokuLevel[]) {
      it(`makes valid, uniquely solvable ${size}×${size} puzzles (${level})`, () => {
        for (let seed = 1; seed <= 12; seed++) {
          const p = generateSudoku(size, level, seed)
          expect(isValidSolution(p.solution, size)).toBe(true)
          expect(countSolutions(p.puzzle, size, 2)).toBe(1)
          p.puzzle.forEach((v, i) => v !== 0 && expect(v).toBe(p.solution[i]))
          const clues = p.puzzle.filter(Boolean).length
          expect(clues).toBeGreaterThanOrEqual(CLUES[size][level]) // never fewer than asked (uniqueness wins)
          expect(clues).toBeLessThan(size * size) // at least something to solve
        }
      })
    }
  }

  it('is deterministic for the same seed', () => {
    expect(generateSudoku(6, 'medium', 5)).toEqual(generateSudoku(6, 'medium', 5))
  })
})
