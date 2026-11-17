import { Search } from 'lucide-react'
import { Segmented, TextArea } from '../../components/ui'
import { WorksheetHeader } from '../../components/Sheet'
import { contentHeight, contentWidth, HEADER_H } from '../../lib/paper'
import { tooMany } from '../issues'
import type { Issue, PageSpec, ReadyTool, WorksheetContext } from '../types'
import { generateWordSearch, parseWordSearchWords, placedCells, type Difficulty, type WordSearchPuzzle } from './generate'

interface Settings {
  words: string
  size: number
  difficulty: Difficulty
}

const MAX_WORDS = 30

function build(s: Settings, seed: number): { puzzle: WordSearchPuzzle } {
  const all = parseWordSearchWords(s.words)
  const entries = all.slice(0, MAX_WORDS)
  return { puzzle: generateWordSearch(entries, s.size, s.difficulty, seed) }
}

function Grid({ puzzle, px, highlight }: { puzzle: WordSearchPuzzle; px: number; highlight?: Set<string> }) {
  const cell = Math.floor(px / puzzle.size)
  const total = cell * puzzle.size
  return (
    <div
      className="mx-auto border-2 border-stone-800"
      style={{ width: total + 4, display: 'grid', gridTemplateColumns: `repeat(${puzzle.size}, ${cell}px)` }}
    >
      {puzzle.grid.map((row, r) =>
        row.map((ch, c) => {
          const on = highlight?.has(`${r},${c}`)
          return (
            <div
              key={`${r}-${c}`}
              className="flex items-center justify-center border border-stone-300 font-extrabold text-stone-900"
              style={{ height: cell, fontSize: Math.round(cell * 0.56), background: on ? '#fcd34d' : undefined }}
            >
              {ch}
            </div>
          )
        }),
      )}
    </div>
  )
}

function WordBank({ puzzle }: { puzzle: WordSearchPuzzle }) {
  return (
    <div className="rounded-2xl border-2 border-stone-800 px-5 py-3">
      <div className="mb-1.5 text-center text-[15px] font-black uppercase tracking-widest">Word Bank</div>
      <ul className="grid grid-cols-3 gap-x-4 gap-y-1">
        {puzzle.placed.map((w) => (
          <li key={w.label} className="flex items-center gap-2 text-[17px] font-bold">
            <span className="inline-block h-[14px] w-[14px] shrink-0 rounded-[3px] border-2 border-stone-700" />
            {w.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

function bankHeight(count: number) {
  return 44 + Math.ceil(count / 3) * 27 + 8
}

const wordSearch: ReadyTool<Settings> = {
  id: 'word-search',
  slug: 'word-search',
  number: 2,
  name: 'Word Search',
  category: 'literacy',
  icon: Search,
  tagline: 'Type your words and get a ready-to-print puzzle.',
  status: 'ready',
  defaultTitle: 'Fruit Word Search',
  defaultSettings: {
    words: 'APPLE\nBANANA\nCHERRY\nGRAPE\nLEMON\nMANGO\nORANGE\nPEACH\nPEAR\nPLUM',
    size: 12,
    difficulty: 'easy',
  },
  usesSeed: true,
  seedLabel: 'New puzzle',
  answerKey: { label: 'Include answer key', description: 'Adds a page showing where every word is hidden.' },

  Controls({ settings, patch }) {
    return (
      <>
        <TextArea
          label="Your words"
          hint="One word per line, or separate them with commas."
          rows={8}
          value={settings.words}
          onChange={(v) => patch({ words: v })}
        />
        <Segmented
          label="Puzzle size"
          value={settings.size}
          onChange={(v) => patch({ size: v })}
          options={[10, 12, 15, 18].map((n) => ({ value: n, label: `${n}×${n}` }))}
        />
        <Segmented
          label="How tricky?"
          hint={{ easy: 'Words go across and down.', medium: 'Words also go diagonally.', hard: 'Words go in every direction, even backwards.' }[settings.difficulty]}
          value={settings.difficulty}
          onChange={(v) => patch({ difficulty: v })}
          options={[
            { value: 'easy', label: 'Easy' },
            { value: 'medium', label: 'Medium' },
            { value: 'hard', label: 'Hard' },
          ]}
        />
      </>
    )
  },

  check(settings, ctx) {
    const all = parseWordSearchWords(settings.words)
    if (all.length === 0) return [{ level: 'error', message: 'Type at least one word in "Your words". Use one word per line, or separate words with commas.' }]
    const issues: Issue[] = [...tooMany(all.length, MAX_WORDS, 'word')]
    const { puzzle } = build(settings, ctx.seed)
    const tooLong = puzzle.unplaced.filter((w) => w.letters.length > settings.size)
    const noRoom = puzzle.unplaced.filter((w) => w.letters.length <= settings.size)
    if (tooLong.length > 0) {
      issues.push({ level: 'warn', message: `Too long for a ${settings.size}×${settings.size} puzzle, so left out: ${tooLong.map((w) => `${w.label} (${w.letters.length} letters)`).join(', ')}. Choose a bigger puzzle size or a shorter word.` })
    }
    if (noRoom.length > 0) {
      issues.push({ level: 'warn', message: `There was no room left for: ${noRoom.map((w) => w.label).join(', ')}. Choose a bigger puzzle size, fewer words, or an easier level that allows more overlap.` })
    }
    if (puzzle.placed.length === 0) issues.push({ level: 'error', message: `None of your words fit in a ${settings.size}×${settings.size} puzzle. Choose a bigger size or shorter words.` })
    return issues
  },

  pages(settings: Settings, ctx: WorksheetContext) {
    const { puzzle } = build(settings, ctx.seed)
    if (puzzle.placed.length === 0) return []
    const avail = contentHeight(ctx.paper) - HEADER_H - 34 - bankHeight(puzzle.placed.length) - 20
    const px = Math.max(240, Math.min(contentWidth(ctx.paper) - 24, 620, avail))

    const main = (
      <div className="flex h-full flex-col">
        <WorksheetHeader title={ctx.title} teacherName={ctx.teacherName} />
        <p className="mb-3 mt-2 text-center text-[16px] font-semibold text-stone-600">Find and circle all the hidden words!</p>
        <Grid puzzle={puzzle} px={px} />
        <div className="mt-auto pb-1">
          <WordBank puzzle={puzzle} />
        </div>
      </div>
    )
    const pages: PageSpec[] = [{ node: main }]
    if (ctx.includeAnswerKey) {
      const keyPx = Math.min(contentWidth(ctx.paper) - 24, 560)
      pages.push({
        node: (
          <div className="flex h-full flex-col">
            <WorksheetHeader title={`${ctx.title} – Answer Key`} nameLine={false} />
            <div className="mt-4">
              <Grid puzzle={puzzle} px={keyPx} highlight={placedCells(puzzle)} />
            </div>
          </div>
        ),
        label: 'Answer Key',
      })
    }
    return pages
  },
}

export default wordSearch
