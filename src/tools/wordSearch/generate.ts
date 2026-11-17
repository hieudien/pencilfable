import { createRng, shuffle } from '../../lib/rng'
import { parseList } from '../../lib/text'

export type Difficulty = 'easy' | 'medium' | 'hard'

/** [rowStep, colStep] */
const DIRECTIONS: Record<Difficulty, [number, number][]> = {
  easy: [[0, 1], [1, 0]], // → ↓
  medium: [[0, 1], [1, 0], [1, 1], [-1, 1]], // + diagonals
  hard: [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]], // + backwards
}

export interface WordEntry {
  /** What the teacher typed (shown in the word bank) */
  label: string
  /** Letters used in the grid */
  letters: string[]
}

export interface PlacedWord extends WordEntry {
  row: number
  col: number
  dr: number
  dc: number
}

export interface WordSearchPuzzle {
  size: number
  grid: string[][]
  placed: PlacedWord[]
  unplaced: WordEntry[]
}

export function parseWordSearchWords(raw: string): WordEntry[] {
  return parseList(raw, { splitCommas: true })
    .map((label) => ({
      label: label.toLocaleUpperCase(),
      letters: Array.from(label.normalize('NFC').toLocaleUpperCase().replace(/[^\p{L}\p{N}]/gu, '')),
    }))
    .filter((e) => e.letters.length > 0)
}

const A_Z = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ')

type Cell = string | null
interface Attempt {
  grid: Cell[][]
  placed: PlacedWord[]
  unplaced: WordEntry[]
}

/** One try at placing the words in this order. Every possible spot is tried (in random order) for each word. */
function attempt(order: WordEntry[], size: number, dirs: [number, number][], rng: () => number): Attempt {
  const grid: Cell[][] = Array.from({ length: size }, () => Array<Cell>(size).fill(null))
  const placed: PlacedWord[] = []
  const unplaced: WordEntry[] = []

  for (const entry of order) {
    const len = entry.letters.length
    if (len > size) {
      unplaced.push(entry)
      continue
    }
    const candidates: { row: number; col: number; dr: number; dc: number }[] = []
    for (const [dr, dc] of dirs) {
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          const endR = row + dr * (len - 1)
          const endC = col + dc * (len - 1)
          if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue
          candidates.push({ row, col, dr, dc })
        }
      }
    }
    let done = false
    for (const c of shuffle(rng, candidates)) {
      let fits = true
      for (let i = 0; i < len; i++) {
        const cell = grid[c.row + c.dr * i][c.col + c.dc * i]
        if (cell !== null && cell !== entry.letters[i]) {
          fits = false
          break
        }
      }
      if (!fits) continue
      for (let i = 0; i < len; i++) grid[c.row + c.dr * i][c.col + c.dc * i] = entry.letters[i]
      placed.push({ ...entry, ...c })
      done = true
      break
    }
    if (!done) unplaced.push(entry)
  }
  return { grid, placed, unplaced }
}

const MAX_ATTEMPTS = 80

export function generateWordSearch(entries: WordEntry[], size: number, difficulty: Difficulty, seed: number): WordSearchPuzzle {
  const rng = createRng(seed)
  const dirs = DIRECTIONS[difficulty]

  // Long words first: they are the hardest to fit.
  let order = [...entries].sort((a, b) => b.letters.length - a.letters.length)

  // A crowded grid can occasionally trap the last word. When that happens, start over with a different
  // order and layout (still fully determined by the seed) and keep the best result.
  let best = attempt(order, size, dirs, rng)
  for (let n = 1; n < MAX_ATTEMPTS && best.unplaced.some((w) => w.letters.length <= size); n++) {
    // keep the longest words early, but mix words of the same length
    order = [...entries].sort((a, b) => b.letters.length - a.letters.length || rng() - 0.5)
    if (n % 4 === 0) order = shuffle(rng, entries)
    const next = attempt(order, size, dirs, rng)
    if (next.unplaced.length < best.unplaced.length) best = next
  }
  const { grid, placed, unplaced } = best

  // Filler letters: A–Z plus any special characters used by the words, so accents don't give them away.
  const extra = new Set<string>()
  for (const e of entries) for (const ch of e.letters) if (!A_Z.includes(ch)) extra.add(ch)
  const pool = [...A_Z, ...extra]

  const filled = grid.map((row) => row.map((cell) => cell ?? pool[Math.floor(rng() * pool.length)]))
  // Keep the word bank in the order the teacher typed it
  placed.sort((a, b) => entries.findIndex((e) => e.label === a.label) - entries.findIndex((e) => e.label === b.label))
  return { size, grid: filled, placed, unplaced }
}

export function placedCells(p: WordSearchPuzzle): Set<string> {
  const s = new Set<string>()
  for (const w of p.placed) {
    for (let i = 0; i < w.letters.length; i++) s.add(`${w.row + w.dr * i},${w.col + w.dc * i}`)
  }
  return s
}
