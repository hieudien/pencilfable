import type { ComponentType, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { Paper } from '../lib/paper'

export type CategoryId = 'literacy' | 'math' | 'puzzles' | 'classroom'

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'literacy', label: 'Reading & Writing' },
  { id: 'math', label: 'Math & Logic' },
  { id: 'puzzles', label: 'Games & Puzzles' },
  { id: 'classroom', label: 'Classroom Helpers' },
]

/** Everything a tool needs to know about the sheet being made (besides its own settings). */
export interface WorksheetContext {
  paper: Paper
  title: string
  teacherName: string
  includeAnswerKey: boolean
  /** Changes when the user presses "New puzzle". Tools must derive ALL randomness from it. */
  seed: number
}

export interface PageSpec {
  /** Small caption shown above the page in the preview only (never printed). */
  label?: string
  node: ReactNode
}

export interface ToolMeta {
  id: string
  slug: string
  /** Position in the original 1–20 list */
  number: number
  name: string
  category: CategoryId
  icon: LucideIcon
  tagline: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ReadyTool<S extends object = any> extends ToolMeta {
  status: 'ready'
  defaultTitle: string
  /** Hide the "Worksheet title" field for tools that print no title (e.g. sticker sheets) */
  hideTitle?: boolean
  defaultSettings: S
  /** Hide "Copy link" for tools that hold private data such as student names. */
  noShare?: boolean
  /** Show a "New puzzle" button that changes the random seed */
  usesSeed?: boolean
  seedLabel?: string
  /** Show the "answer key" switch in Page settings */
  answerKey?: { label: string; description: string }
  Controls: ComponentType<{ settings: S; patch: (p: Partial<S>) => void; ctx: WorksheetContext }>
  pages: (settings: S, ctx: WorksheetContext) => PageSpec[]
  /**
   * Tell the teacher when the input cannot make a game, or had to be trimmed. Shown above the preview.
   * 'error' = nothing could be made; 'warn' = a page was made, but something was left out or will not work.
   * Every message must say WHAT is wrong and WHAT to do about it.
   */
  check?: (settings: S, ctx: WorksheetContext) => Issue[]
}

export interface Issue {
  level: 'error' | 'warn'
  message: string
}

export interface SoonTool extends ToolMeta {
  status: 'soon'
}

export type ToolEntry = ReadyTool | SoonTool
