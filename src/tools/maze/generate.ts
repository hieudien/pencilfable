import { createRng, shuffle } from '../../lib/rng'

export type MazeLevel = 'easy' | 'medium' | 'hard'

export const MAZE_LEVELS: Record<MazeLevel, { size: number; braid: number; stroke: number }> = {
  easy: { size: 8, braid: 0.18, stroke: 5 }, // a few extra openings → several ways through
  medium: { size: 14, braid: 0, stroke: 4 },
  hard: { size: 22, braid: 0, stroke: 3 },
}

export interface Maze {
  rows: number
  cols: number
  /** rightOpen[r][c]: can you walk from (r,c) to (r,c+1)? */
  rightOpen: boolean[][]
  /** downOpen[r][c]: can you walk from (r,c) to (r+1,c)? */
  downOpen: boolean[][]
  /** Start is the top of cell (0,0); the finish is the bottom of the last cell. */
  solution: [number, number][]
}

const grid = <T,>(rows: number, cols: number, v: T): T[][] => Array.from({ length: rows }, () => Array<T>(cols).fill(v))

export function generateMaze(level: MazeLevel, seed: number): Maze {
  const { size, braid } = MAZE_LEVELS[level]
  const rows = size
  const cols = size
  const rng = createRng(seed)
  const rightOpen = grid(rows, cols, false)
  const downOpen = grid(rows, cols, false)
  const seen = grid(rows, cols, false)

  // Depth-first "recursive backtracker" (iterative, so big mazes can't overflow the stack).
  const stack: [number, number][] = [[0, 0]]
  seen[0][0] = true
  while (stack.length) {
    const [r, c] = stack[stack.length - 1]
    const next = shuffle(rng, [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]] as [number, number][]).find(
      ([nr, nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols && !seen[nr][nc],
    )
    if (!next) {
      stack.pop()
      continue
    }
    const [nr, nc] = next
    if (nr === r - 1) downOpen[nr][nc] = true
    else if (nr === r + 1) downOpen[r][c] = true
    else if (nc === c - 1) rightOpen[nr][nc] = true
    else rightOpen[r][c] = true
    seen[nr][nc] = true
    stack.push([nr, nc])
  }

  // Optional: knock out some extra walls so easy mazes have more than one route.
  if (braid > 0) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (c < cols - 1 && !rightOpen[r][c] && rng() < braid) rightOpen[r][c] = true
        if (r < rows - 1 && !downOpen[r][c] && rng() < braid) downOpen[r][c] = true
      }
    }
  }

  return { rows, cols, rightOpen, downOpen, solution: solveMaze({ rows, cols, rightOpen, downOpen }) }
}

/** Shortest path from the start cell to the finish cell (breadth-first search). */
export function solveMaze(m: Pick<Maze, 'rows' | 'cols' | 'rightOpen' | 'downOpen'>): [number, number][] {
  const { rows, cols, rightOpen, downOpen } = m
  const prev = new Map<number, number>()
  const key = (r: number, c: number) => r * cols + c
  const queue: [number, number][] = [[0, 0]]
  prev.set(key(0, 0), -1)
  while (queue.length) {
    const [r, c] = queue.shift()!
    if (r === rows - 1 && c === cols - 1) break
    const moves: [number, number, boolean][] = [
      [r - 1, c, r > 0 && downOpen[r - 1][c]],
      [r + 1, c, r < rows - 1 && downOpen[r][c]],
      [r, c - 1, c > 0 && rightOpen[r][c - 1]],
      [r, c + 1, c < cols - 1 && rightOpen[r][c]],
    ]
    for (const [nr, nc, open] of moves) {
      if (open && !prev.has(key(nr, nc))) {
        prev.set(key(nr, nc), key(r, c))
        queue.push([nr, nc])
      }
    }
  }
  const path: [number, number][] = []
  let cur = key(rows - 1, cols - 1)
  if (!prev.has(cur)) return path
  while (cur !== -1) {
    path.push([Math.floor(cur / cols), cur % cols])
    cur = prev.get(cur)!
  }
  return path.reverse()
}
