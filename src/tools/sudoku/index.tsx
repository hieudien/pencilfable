import { Grid3x3 } from 'lucide-react'
import { Segmented, Stepper } from '../../components/ui'
import { WorksheetHeader } from '../../components/Sheet'
import { contentHeight, contentWidth, HEADER_H } from '../../lib/paper'
import { chunk } from '../../lib/text'
import type { PageSpec, ReadyTool } from '../types'
import { BOX, generateSudokuSet, type SudokuLevel, type SudokuPuzzle, type SudokuSize } from './generate'

interface Settings {
  size: SudokuSize
  level: SudokuLevel
  count: number
  perPage: 1 | 2 | 4
}

function SudokuGrid({ p, px, label, showSolution }: { p: SudokuPuzzle; px: number; label: string; showSolution?: boolean }) {
  const { size } = p
  const { r: br, c: bc } = BOX[size]
  const cell = Math.floor(px / size)
  return (
    <div className="flex flex-col items-center">
      <div className="mb-1 self-start text-[14px] font-extrabold text-stone-500">{label}</div>
      <div className="border-[4px] border-stone-900" style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, ${cell}px)` }}>
        {p.puzzle.map((given, i) => {
          const r = Math.floor(i / size)
          const c = i % size
          const filled = showSolution && given === 0
          return (
            <div
              key={i}
              className="flex items-center justify-center font-black"
              style={{
                height: cell,
                fontSize: cell * 0.56,
                borderRight: c < size - 1 ? `${(c + 1) % bc === 0 ? 4 : 1}px solid ${(c + 1) % bc === 0 ? '#1c1917' : '#a8a29e'}` : undefined,
                borderBottom: r < size - 1 ? `${(r + 1) % br === 0 ? 4 : 1}px solid ${(r + 1) % br === 0 ? '#1c1917' : '#a8a29e'}` : undefined,
                background: given !== 0 ? '#f5f5f4' : undefined,
                color: filled ? '#059669' : '#1c1917',
              }}
            >
              {showSolution ? p.solution[i] : given || ''}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function gridPx(perPage: number, W: number, H: number) {
  if (perPage === 1) return Math.min(W - 80, H - HEADER_H - 120, 520)
  if (perPage === 2) return Math.min(W - 160, (H - HEADER_H - 40) / 2 - 56, 330)
  return Math.min((W - 40) / 2 - 20, (H - HEADER_H - 40) / 2 - 56, 300)
}

const sudoku: ReadyTool<Settings> = {
  id: 'sudoku',
  slug: 'kids-sudoku',
  number: 9,
  name: 'Kids Sudoku',
  category: 'math',
  icon: Grid3x3,
  tagline: 'Small 4×4 and 6×6 puzzles that always have one answer.',
  status: 'ready',
  defaultTitle: 'Number Puzzle',
  defaultSettings: { size: 4, level: 'easy', count: 4, perPage: 2 },
  usesSeed: true,
  seedLabel: 'New puzzles',
  answerKey: { label: 'Include answer key', description: 'Adds a page with every solved puzzle.' },

  Controls({ settings, patch }) {
    return (
      <>
        <Segmented
          label="Grid size"
          hint={settings.size === 4 ? 'Numbers 1–4. Great for ages 5–7.' : 'Numbers 1–6. A step up for ages 7–9.'}
          value={settings.size}
          onChange={(v) => patch({ size: v })}
          options={[{ value: 4, label: '4×4' }, { value: 6, label: '6×6' }]}
        />
        <Segmented
          label="How hard?"
          value={settings.level}
          onChange={(v) => patch({ level: v })}
          options={[{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }]}
        />
        <Stepper label="How many puzzles?" value={settings.count} min={1} max={12} onChange={(v) => patch({ count: v })} />
        <Segmented
          label="Puzzles per page"
          value={settings.perPage}
          onChange={(v) => patch({ perPage: v })}
          options={[{ value: 1, label: '1 (big)' }, { value: 2, label: '2' }, { value: 4, label: '4' }]}
        />
      </>
    )
  },

  pages(settings, ctx) {
    const puzzles = generateSudokuSet(settings.size, settings.level, settings.count, ctx.seed)
    const W = contentWidth(ctx.paper)
    const H = contentHeight(ctx.paper)
    const per = settings.perPage
    const px = gridPx(per, W, H)
    const n = settings.size
    const area = (
      puzzlesOnPage: SudokuPuzzle[], start: number, solution: boolean, sizePx: number,
    ) => (
      <div
        className="grid flex-1"
        style={{ gridTemplateColumns: per === 4 ? '1fr 1fr' : '1fr', gridTemplateRows: per === 1 ? '1fr' : '1fr 1fr' }}
      >
        {puzzlesOnPage.map((p, i) => (
          <div key={i} className="flex items-center justify-center">
            <SudokuGrid p={p} px={sizePx} label={`Puzzle ${start + i + 1}`} showSolution={solution} />
          </div>
        ))}
      </div>
    )

    const pages: PageSpec[] = chunk(puzzles, per).map((group, pi) => ({
      label: `Puzzles ${pi * per + 1}–${pi * per + group.length}`,
      node: (
        <div className="flex h-full flex-col">
          <WorksheetHeader title={ctx.title} teacherName={ctx.teacherName} />
          <p className="mb-1 mt-2 text-center text-[16px] font-semibold text-stone-600">
            Fill every empty box with a number from 1 to {n}. Don&apos;t repeat a number in any row, column or thick-lined box!
          </p>
          {area(group, pi * per, false, px)}
        </div>
      ),
    }))

    if (ctx.includeAnswerKey) {
      const keyPer = 4
      const keyPx = Math.min((W - 40) / 2 - 20, 280)
      chunk(puzzles, keyPer).forEach((group, pi) => {
        pages.push({
          label: 'Answer Key',
          node: (
            <div className="flex h-full flex-col">
              <WorksheetHeader title={`${ctx.title} – Answer Key`} nameLine={false} />
              <div className="grid flex-1" style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }}>
                {group.map((p, i) => (
                  <div key={i} className="flex items-center justify-center">
                    <SudokuGrid p={p} px={keyPx} label={`Puzzle ${pi * keyPer + i + 1}`} showSolution />
                  </div>
                ))}
              </div>
            </div>
          ),
        })
      })
    }
    return pages
  },
}

export default sudoku
