import { Palette } from 'lucide-react'
import { Segmented } from '../../components/ui'
import { WorksheetHeader } from '../../components/Sheet'
import { contentHeight, contentWidth, HEADER_H } from '../../lib/paper'
import type { PageSpec, ReadyTool } from '../types'
import { generatePicturePuzzle, type Level, type OperationChoice } from './generate'
import { byId, PICTURES, SIZE, type Picture } from './pictures'

interface Settings {
  picture: string
  operation: OperationChoice
  level: Level
}

const SYMBOL: Record<string, string> = { '+': '+', '-': '−', '×': '×', '÷': '÷' }

function Key({ picture, values, width }: { picture: Picture; values: number[]; width: number }) {
  return (
    <div className="flex items-center justify-center gap-4 rounded-2xl border-[3px] border-stone-800 px-3 py-2" style={{ width }}>
      <span className="text-[14px] font-black uppercase tracking-wide text-stone-500">Color key</span>
      {picture.colors.map((c, i) => (
        <div key={c.name} className="flex items-center gap-1.5">
          <span className="text-[22px] font-black text-stone-900">{values[i]}</span>
          <span className="text-stone-400">=</span>
          <span className="inline-block h-6 w-6 rounded-md border-2 border-stone-800" style={{ background: c.hex }} />
          <span className="text-[14px] font-bold text-stone-700">{c.name}</span>
        </div>
      ))}
    </div>
  )
}

const mysteryPicture: ReadyTool<Settings> = {
  id: 'mystery-picture',
  slug: 'mystery-picture',
  number: 8,
  name: 'Mystery Picture Math',
  category: 'math',
  icon: Palette,
  tagline: 'Solve each square, color by the answer, and reveal a secret picture.',
  status: 'ready',
  defaultTitle: 'Color the Mystery Picture!',
  defaultSettings: { picture: 'heart', operation: '+', level: 'medium' },
  usesSeed: true,
  seedLabel: 'New problems',
  answerKey: { label: 'Reveal the picture', description: 'Adds a page showing the finished picture.' },

  Controls({ settings, patch }) {
    return (
      <>
        <Segmented
          label="Mystery picture"
          hint="Kids will not know which one it is until they finish coloring!"
          value={settings.picture}
          onChange={(v) => patch({ picture: v })}
          options={PICTURES.map((p) => ({ value: p.id, label: p.name }))}
        />
        <Segmented
          label="What kind of math?"
          value={settings.operation}
          onChange={(v) => patch({ operation: v })}
          options={[
            { value: '+', label: <span className="text-2xl leading-none">+</span> },
            { value: '-', label: <span className="text-2xl leading-none">−</span> },
            { value: '×', label: <span className="text-2xl leading-none">×</span> },
            { value: '÷', label: <span className="text-2xl leading-none">÷</span> },
            { value: 'mixed', label: 'Mix' },
          ]}
        />
        <Segmented
          label="How big are the answers?"
          value={settings.level}
          onChange={(v) => patch({ level: v })}
          options={[{ value: 'easy', label: 'Up to 12' }, { value: 'medium', label: 'Up to 24' }, { value: 'hard', label: 'Up to 72' }]}
        />
        <p className="text-sm text-stone-500">Each color gets its own answer. Kids solve a square, look up the answer in the color key, and color it in.</p>
      </>
    )
  },

  pages(settings, ctx) {
    const picture = byId(settings.picture)
    const { key, problems } = generatePicturePuzzle(picture, settings.operation, settings.level, ctx.seed)
    const W = contentWidth(ctx.paper)
    const H = contentHeight(ctx.paper)
    const keyH = 56
    const cell = Math.floor(Math.min(W / SIZE, (H - HEADER_H - keyH - 40) / SIZE))
    const gridW = cell * SIZE

    const pages: PageSpec[] = [
      {
        node: (
          <div className="flex h-full flex-col">
            <WorksheetHeader title={ctx.title} teacherName={ctx.teacherName} />
            <p className="mb-2 mt-2 text-center text-[15px] font-semibold text-stone-600">Solve each problem. Find the answer in the color key. Color the square to match!</p>
            <div className="flex justify-center"><Key picture={picture} values={key} width={Math.min(W, 660)} /></div>
            <div className="mx-auto mt-3 grid border-2 border-stone-800" style={{ gridTemplateColumns: `repeat(${SIZE}, ${cell}px)`, width: gridW + 4 }}>
              {problems.flat().map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center whitespace-nowrap border border-stone-300 font-extrabold tabular-nums text-stone-900"
                  style={{ height: cell, fontSize: Math.floor(cell * 0.25) }}
                >
                  {p.a} {SYMBOL[p.op]} {p.b}
                </div>
              ))}
            </div>
          </div>
        ),
      },
    ]

    if (ctx.includeAnswerKey) {
      pages.push({
        label: 'The mystery picture',
        node: (
          <div className="flex h-full flex-col">
            <WorksheetHeader title={`It's a ${picture.name}!`} nameLine={false} />
            <div className="mt-2 flex justify-center"><Key picture={picture} values={key} width={Math.min(W, 660)} /></div>
            <div className="mx-auto mt-4 grid border-2 border-stone-800" style={{ gridTemplateColumns: `repeat(${SIZE}, ${cell}px)`, width: gridW + 4 }}>
              {picture.rows.flatMap((row, r) =>
                Array.from(row).map((d, c) => (
                  <div key={`${r}-${c}`} className="border border-stone-300" style={{ height: cell, background: picture.colors[Number(d) - 1].hex }} />
                )),
              )}
            </div>
          </div>
        ),
      })
    }
    return pages
  },
}

export default mysteryPicture
