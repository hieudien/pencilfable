import { Link2 } from 'lucide-react'
import { TextArea } from '../../components/ui'
import { WorksheetHeader } from '../../components/Sheet'
import { contentHeight, contentWidth, HEADER_H } from '../../lib/paper'
import { nonEmptyLines, skipped, tooFew, tooMany } from '../issues'
import type { PageSpec, ReadyTool } from '../types'
import { matchOrder, parsePairs } from './generate'

interface Settings {
  pairs: string
}

const MAX_PAIRS = 12
const DEFAULT_PAIRS = ['dog | bark', 'cat | meow', 'cow | moo', 'duck | quack', 'sheep | baa', 'lion | roar', 'snake | hiss', 'frog | ribbit'].join('\n')

function fit(text: string, boxW: number, rowH: number) {
  const byHeight = rowH * 0.36
  const byWidth = (boxW * 0.88) / (Math.max(text.length, 1) * 0.56)
  return Math.max(11, Math.min(26, byHeight, byWidth))
}

function Box({ text, w, h }: { text: string; w: number; h: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl border-[3px] border-stone-800 px-2 text-center font-extrabold leading-tight"
      style={{ width: w, height: h, fontSize: fit(text, w, h), overflowWrap: 'anywhere' }}
    >
      {text}
    </div>
  )
}

const dot = <span className="inline-block h-4 w-4 shrink-0 rounded-full border-[3px] border-stone-800 bg-white" />

const matching: ReadyTool<Settings> = {
  id: 'matching',
  slug: 'matching-pairs',
  number: 5,
  name: 'Matching Pairs',
  category: 'literacy',
  icon: Link2,
  tagline: 'Kids draw a line to join each pair.',
  status: 'ready',
  defaultTitle: 'Match Each Pair',
  defaultSettings: { pairs: DEFAULT_PAIRS },
  usesSeed: true,
  seedLabel: 'Shuffle right side',
  answerKey: { label: 'Include answer key', description: 'Adds a page listing every correct pair.' },

  Controls({ settings, patch }) {
    return (
      <>
        <TextArea
          label="Your pairs"
          hint="One pair per line. Put a | between the two sides, like: dog | bark"
          rows={9}
          value={settings.pairs}
          onChange={(v) => patch({ pairs: v })}
        />
      </>
    )
  },

  check(settings) {
    const pairs = parsePairs(settings.pairs)
    return [
      ...tooFew(pairs.length, 2, 'pair', 'Write each pair on its own line with a | between the two sides, like: dog | bark.'),
      ...skipped(nonEmptyLines(settings.pairs) - pairs.length, 'it has no | between the two sides, or one side is empty'),
      ...tooMany(pairs.length, MAX_PAIRS, 'pair'),
    ]
  },

  pages(settings, ctx) {
    const pairs = parsePairs(settings.pairs).slice(0, MAX_PAIRS)
    if (pairs.length < 2) return []
    const order = matchOrder(pairs.length, ctx.seed)
    const W = contentWidth(ctx.paper)
    const avail = contentHeight(ctx.paper) - HEADER_H - 40
    const rowH = Math.min(96, Math.floor(avail / pairs.length))
    const boxH = Math.min(74, rowH - 14)
    const boxW = Math.floor(W * 0.36)

    const main = (
      <div className="flex h-full flex-col">
        <WorksheetHeader title={ctx.title} teacherName={ctx.teacherName} />
        <p className="mb-2 mt-2 text-center text-[16px] font-semibold text-stone-600">Draw a line from each box on the left to its match on the right.</p>
        <div className="flex flex-col">
          {pairs.map((p, i) => (
            <div key={i} className="flex items-center justify-between" style={{ height: rowH }}>
              <div className="flex items-center gap-2">
                <Box text={p.left} w={boxW} h={boxH} />
                {dot}
              </div>
              <div className="flex items-center gap-2">
                {dot}
                <Box text={pairs[order[i]].right} w={boxW} h={boxH} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )

    const pages: PageSpec[] = [{ node: main }]
    if (ctx.includeAnswerKey) {
      pages.push({
        label: 'Answer Key',
        node: (
          <div className="flex h-full flex-col">
            <WorksheetHeader title={`${ctx.title} – Answer Key`} nameLine={false} />
            <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 text-[20px] font-bold">
              {pairs.map((p, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-7 text-right text-stone-500">{i + 1}.</span>
                  <span>{p.left}</span>
                  <span className="text-stone-400">→</span>
                  <span className="text-emerald-700">{p.right}</span>
                </li>
              ))}
            </ul>
          </div>
        ),
      })
    }
    return pages
  },
}

export default matching
