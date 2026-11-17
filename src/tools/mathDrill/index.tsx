import { Calculator } from 'lucide-react'
import { Segmented } from '../../components/ui'
import { WorksheetHeader } from '../../components/Sheet'
import { contentHeight, HEADER_H } from '../../lib/paper'
import type { PageSpec, ReadyTool } from '../types'
import { factorCap, generateProblems, type OperationChoice, type Problem } from './generate'

interface Settings {
  operation: OperationChoice
  max: number
  count: number
  layout: 'vertical' | 'horizontal'
}

const OP_SYMBOL: Record<string, string> = { '+': '+', '-': '−', '×': '×', '÷': '÷' }

function layoutFor(count: number, layout: Settings['layout']) {
  if (layout === 'vertical') {
    const cols = count <= 20 ? 4 : count <= 30 ? 5 : 6
    return { cols, font: count <= 20 ? 34 : count <= 30 ? 30 : 26, maxRow: 170 }
  }
  const cols = count <= 20 ? 2 : 3
  return { cols, font: count <= 20 ? 28 : count <= 30 ? 25 : 22, maxRow: 84 }
}

function Vertical({ p, n, font }: { p: Problem; n: number; font: number }) {
  const num = 'font-extrabold tabular-nums leading-none'
  return (
    <div className="relative flex h-full items-start justify-center">
      <span className="absolute left-1 top-0 text-[12px] font-bold text-stone-400">{n}</span>
      {p.op === '÷' ? (
        <div className={`mt-3 flex items-end ${num}`} style={{ fontSize: font }}>
          <span className="pb-[2px] pr-2">{p.b}</span>
          <span className="border-l-[3px] border-t-[3px] border-stone-900 px-3 pb-[2px] pt-2" style={{ minWidth: font * 2.2, borderTopLeftRadius: 8 }}>
            {p.a}
          </span>
        </div>
      ) : (
        <div className={`mt-3 ${num}`} style={{ fontSize: font, minWidth: font * 2.6 }}>
          <div className="pb-2 text-right">{p.a}</div>
          <div className="flex justify-between border-b-[3px] border-stone-900 pb-1.5">
            <span>{OP_SYMBOL[p.op]}</span>
            <span>{p.b}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function Horizontal({ p, n, font, answer }: { p: Problem; n: number; font: number; answer?: boolean }) {
  return (
    <div className="flex h-full items-center gap-2 font-extrabold tabular-nums" style={{ fontSize: font }}>
      <span className="w-6 shrink-0 text-[12px] font-bold text-stone-400">{n}</span>
      <span className="whitespace-nowrap">
        {p.a} {OP_SYMBOL[p.op]} {p.b} =
      </span>
      {answer ? <span className="text-emerald-700">{p.answer}</span> : <span className="mb-[-6px] h-[1em] w-16 border-b-[3px] border-stone-900" />}
    </div>
  )
}

const mathDrill: ReadyTool<Settings> = {
  id: 'math-drill',
  slug: 'math-drills',
  number: 8,
  name: 'Math Drill Sheets',
  category: 'math',
  icon: Calculator,
  tagline: 'Fresh practice problems in one click.',
  status: 'ready',
  defaultTitle: 'Math Practice',
  defaultSettings: { operation: '+', max: 20, count: 30, layout: 'vertical' },
  usesSeed: true,
  seedLabel: 'New problems',
  answerKey: { label: 'Include answer key', description: 'Adds a page with every answer.' },

  Controls({ settings, patch }) {
    return (
      <>
        <Segmented
          label="What kind of math?"
          hint={{ '+': 'Addition', '-': 'Subtraction', '×': 'Multiplication', '÷': 'Division', mixed: 'A mix of all four' }[settings.operation]}
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
          label="Biggest number"
          hint={settings.operation === '×' || settings.operation === '÷' || settings.operation === 'mixed' ? `Times tables stop at ${factorCap(settings.max)}.` : undefined}
          value={settings.max}
          onChange={(v) => patch({ max: v })}
          options={[10, 20, 50, 100].map((n) => ({ value: n, label: String(n) }))}
        />
        <Segmented
          label="How many problems?"
          value={settings.count}
          onChange={(v) => patch({ count: v })}
          options={[12, 20, 30, 50].map((n) => ({ value: n, label: String(n) }))}
        />
        <Segmented
          label="Style"
          value={settings.layout}
          onChange={(v) => patch({ layout: v })}
          options={[
            { value: 'vertical', label: 'Stacked' },
            { value: 'horizontal', label: 'In a line' },
          ]}
        />
      </>
    )
  },

  pages(settings, ctx) {
    const problems = generateProblems(settings.operation, settings.max, settings.count, ctx.seed)
    const { cols, font, maxRow } = layoutFor(settings.count, settings.layout)
    const rows = Math.ceil(problems.length / cols)
    const avail = contentHeight(ctx.paper) - HEADER_H - 44
    const rowH = Math.min(maxRow, Math.floor(avail / rows))

    const worksheet = (
      <div className="flex h-full flex-col">
        <WorksheetHeader title={ctx.title} teacherName={ctx.teacherName} />
        <div className="mb-2 mt-2 flex items-end justify-between text-[15px] font-bold text-stone-600">
          <span>Solve each problem.</span>
          <span className="flex items-end gap-1 text-stone-800">
            Score: <span className="inline-block w-10 border-b-2 border-stone-800" /> / {problems.length}
          </span>
        </div>
        <div className="grid gap-x-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: rowH }}>
          {problems.map((p, i) => (
            <div key={i} className="overflow-hidden">
              {settings.layout === 'vertical' ? <Vertical p={p} n={i + 1} font={font} /> : <Horizontal p={p} n={i + 1} font={font} />}
            </div>
          ))}
        </div>
      </div>
    )

    const pages: PageSpec[] = [{ node: worksheet }]
    if (ctx.includeAnswerKey) {
      const keyCols = problems.length <= 20 ? 3 : 4
      const keyFont = 19
      const keyRows = Math.ceil(problems.length / keyCols)
      pages.push({
        label: 'Answer Key',
        node: (
          <div className="flex h-full flex-col">
            <WorksheetHeader title={`${ctx.title} – Answer Key`} nameLine={false} />
            <div className="mt-4 grid gap-x-4" style={{ gridTemplateColumns: `repeat(${keyCols}, 1fr)`, gridAutoRows: Math.min(52, Math.floor(avail / keyRows)) }}>
              {problems.map((p, i) => (
                <Horizontal key={i} p={p} n={i + 1} font={keyFont} answer />
              ))}
            </div>
          </div>
        ),
      })
    }
    return pages
  },
}

export default mathDrill
