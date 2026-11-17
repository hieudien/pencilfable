import { createRng, shuffle, type Rng } from '../../lib/rng'

export type SudokuSize = 4 | 6
export type SudokuLevel = 'easy' | 'medium' | 'hard'

/** Box shape (rows × cols): 4×4 uses 2×2 boxes, 6×6 uses 2×3 boxes. */
export const BOX: Record<SudokuSize, { r: number; c: number }> = { 4: { r: 2, c: 2 }, 6: { r: 2, c: 3 } }

/** How many numbers are already filled in. */
export const CLUES: Record<SudokuSize, Record<SudokuLevel, number>> = {
  4: { easy: 10, medium: 8, hard: 6 },
  6: { easy: 22, medium: 18, hard: 14 },
}

export interface SudokuPuzzle {
  size: SudokuSize
  /** 0 = empty. Row-major. */
  puzzle: number[]
  solution: number[]
}

function canPlace(g: number[], size: number, idx: number, v: number): boolean {
  const r = Math.floor(idx / size)
  const c = idx % size
  const { r: br, c: bc } = BOX[size as SudokuSize]
  for (let i = 0; i < size; i++) {
    if (g[r * size + i] === v || g[i * size + c] === v) return false
  }
  const r0 = Math.floor(r / br) * br
  const c0 = Math.floor(c / bc) * bc
  for (let i = 0; i < br; i++) for (let j = 0; j < bc; j++) if (g[(r0 + i) * size + c0 + j] === v) return false
  return true
}

/** Count solutions, stopping as soon as `limit` is reached. */
export function countSolutions(grid: readonly number[], size: number, limit = 2): number {
  const g = grid.slice()
  let count = 0
  const solve = (): void => {
    if (count >= limit) return
    // choose the empty cell with the fewest options
    let best = -1
    let bestOpts: number[] = []
    for (let i = 0; i < g.length; i++) {
      if (g[i] !== 0) continue
      const opts: number[] = []
      for (let v = 1; v <= size; v++) if (canPlace(g, size, i, v)) opts.push(v)
      if (best === -1 || opts.length < bestOpts.length) {
        best = i
        bestOpts = opts
        if (opts.length === 0) return
      }
    }
    if (best === -1) {
      count++
      return
    }
    for (const v of bestOpts) {
      g[best] = v
      solve()
      g[best] = 0
      if (count >= limit) return
    }
  }
  solve()
  return count
}

function fillRandom(size: number, rng: Rng): number[] {
  const g = Array<number>(size * size).fill(0)
  const go = (idx: number): boolean => {
    if (idx === g.length) return true
    for (const v of shuffle(rng, Array.from({ length: size }, (_, i) => i + 1))) {
      if (canPlace(g, size, idx, v)) {
        g[idx] = v
        if (go(idx + 1)) return true
        g[idx] = 0
      }
    }
    return false
  }
  go(0)
  return g
}

export function generateSudoku(size: SudokuSize, level: SudokuLevel, seed: number): SudokuPuzzle {
  const rng = createRng(seed)
  const solution = fillRandom(size, rng)
  const puzzle = solution.slice()
  const target = CLUES[size][level]
  let clues = puzzle.length
  for (const idx of shuffle(rng, puzzle.map((_, i) => i))) {
    if (clues <= target) break
    const keep = puzzle[idx]
    puzzle[idx] = 0
    if (countSolutions(puzzle, size, 2) !== 1) puzzle[idx] = keep // removing it would allow a second answer
    else clues--
  }
  return { size, puzzle, solution }
}

/** Each puzzle gets its own derived seed so "puzzle 3" stays the same when you add more puzzles. */
export function generateSudokuSet(size: SudokuSize, level: SudokuLevel, count: number, seed: number): SudokuPuzzle[] {
  return Array.from({ length: count }, (_, i) => generateSudoku(size, level, seed + i * 7919))
}
