import type { ReadyTool, ToolEntry } from './types'
import wordSearch from './wordSearch'
import spelling from './spelling'
import wordScramble from './wordScramble'
import matching from './matching'
import missingLetters from './missingLetters'
import wordGuess from './wordGuess'
import mathDrill from './mathDrill'
import sudoku from './sudoku'
import secretCode from './secretCode'
import clock from './clock'
import mysteryPicture from './mysteryPicture'
import maze from './maze'
import bingo from './bingo'
import seaBattle from './seaBattle'
import make24 from './make24'
import iHaveWhoHas from './iHaveWhoHas'
import diceMaker from './diceMaker'
import studentPicker from './studentPicker'
import dailySchedule from './dailySchedule'
import calendar from './calendar'

/**
 * The full catalogue, in the order shown in the sidebar (grouped by category there).
 * A tool that is not built yet can be listed as `{ status: 'soon', ... }` (see SoonTool in types.ts).
 */
export const TOOLS: ToolEntry[] = [
  // Reading & Writing
  wordSearch,
  spelling,
  wordScramble,
  matching,
  missingLetters,
  wordGuess,
  // Math & Logic
  mathDrill,
  sudoku,
  secretCode,
  clock,
  mysteryPicture,
  make24,
  // Games & Puzzles
  maze,
  bingo,
  seaBattle,
  iHaveWhoHas,
  diceMaker,
  // Classroom Helpers
  studentPicker,
  dailySchedule,
  calendar,
]

export const READY_TOOLS = TOOLS.filter((t): t is ReadyTool => t.status === 'ready')
export const DEFAULT_SLUG = 'word-search'

export function findToolBySlug(slug: string): ToolEntry | undefined {
  return TOOLS.find((t) => t.slug === slug)
}
