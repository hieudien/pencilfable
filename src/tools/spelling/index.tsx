import { SpellCheck } from 'lucide-react'
import { Segmented, TextArea } from '../../components/ui'
import { WorksheetHeader } from '../../components/Sheet'
import { contentHeight, contentWidth, HEADER_H } from '../../lib/paper'
import { chunk, parseList } from '../../lib/text'
import { tooFew, tooMany } from '../issues'
import type { PageSpec, ReadyTool } from '../types'

type Style = 'cover' | 'rainbow'

interface Settings {
  words: string
  style: Style
}

const MAX_WORDS = 24
const ROW_H = 66
const HEAD_H = 34
const INTRO_H = 34
const TRACE_COLORS = ['#f87171', '#fbbf24', '#60a5fa']

const HEADINGS: Record<Style, string[]> = {
  cover: ['Look', 'Cover and write', 'Write again', 'Check'],
  rainbow: ['Word', 'Trace in red', 'Trace in yellow', 'Trace in blue'],
}

/** Three guide lines like handwriting paper: top, dashed middle, baseline. */
function Guides() {
  return (
    <>
      <div className="absolute left-0 right-0" style={{ top: '14%', borderTop: '1.5px solid #94a3b8' }} />
      <div className="absolute left-0 right-0" style={{ top: '43%', borderTop: '1.2px dashed #94a3b8' }} />
      <div className="absolute left-0 right-0" style={{ top: '72%', borderTop: '2px solid #475569' }} />
    </>
  )
}

function WordRow({ word, style, font, colW, rowH }: { word: string; style: Style; font: number; colW: number[]; rowH: number }) {
  const cell = 'relative'
  const text = { fontSize: font, lineHeight: 1, whiteSpace: 'nowrap' as const }
  // Letters sit on the baseline (72% of the row)
  const onBaseline = { position: 'absolute' as const, left: 8, bottom: `${rowH * 0.28 - font * 0.18}px` }
  return (
    <div className="flex" style={{ height: rowH }}>
      <div className={`${cell} font-extrabold text-stone-900`} style={{ width: colW[0] }}>
        <Guides />
        <span style={{ ...text, ...onBaseline }}>{word}</span>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className={cell} style={{ width: colW[i], borderLeft: '2px solid #d6d3d1' }}>
          <Guides />
          {style === 'rainbow' && (
            <span className="font-extrabold" style={{ ...text, ...onBaseline, color: TRACE_COLORS[i - 1] }}>{word}</span>
          )}
          {style === 'cover' && i === 3 && (
            <span className="absolute rounded-full border-[3px] border-stone-400" style={{ width: 26, height: 26, left: '50%', top: rowH * 0.3, transform: 'translateX(-50%)' }} />
          )}
        </div>
      ))}
    </div>
  )
}

const spelling: ReadyTool<Settings> = {
  id: 'spelling',
  slug: 'spelling-practice',
  number: 3,
  name: 'Spelling Practice',
  category: 'literacy',
  icon: SpellCheck,
  tagline: 'Look, cover, write, check – or trace each word in rainbow colors.',
  status: 'ready',
  defaultTitle: 'Spelling Practice',
  defaultSettings: { words: 'because\nfriend\nschool\nthrough\nwould\nbeautiful\nfamily\nanother', style: 'cover' },

  Controls({ settings, patch }) {
    return (
      <>
        <TextArea label="Spelling words" hint="One word per line, or separate them with commas." rows={8} value={settings.words} onChange={(v) => patch({ words: v })} />
        <Segmented
          label="Practice style"
          hint={settings.style === 'cover' ? 'Kids look at the word, fold or cover it, then write it from memory.' : 'Kids trace over the colored words, one color at a time.'}
          value={settings.style}
          onChange={(v) => patch({ style: v })}
          options={[{ value: 'cover', label: 'Look, cover, write' }, { value: 'rainbow', label: 'Rainbow tracing' }]}
        />
      </>
    )
  },

  check(settings) {
    const count = parseList(settings.words).length
    return [
      ...tooFew(count, 1, 'word', 'Type one word per line, or separate words with commas.'),
      ...tooMany(count, MAX_WORDS, 'word'),
    ]
  },

  pages(settings, ctx) {
    const words = parseList(settings.words).slice(0, MAX_WORDS)
    if (words.length === 0) return []
    const W = contentWidth(ctx.paper)
    const H = contentHeight(ctx.paper)
    // Rainbow: four equal columns (every copy of the word must fit). Cover: a narrow "check" column.
    const fractions = settings.style === 'rainbow' ? [0.25, 0.25, 0.25, 0.25] : [0.29, 0.27, 0.27, 0.17]
    const widths = fractions.map((f) => Math.floor(W * f))
    widths[3] = W - widths[0] - widths[1] - widths[2]
    const longest = Math.max(...words.map((w) => Array.from(w).length), 3)
    const fitCol = settings.style === 'rainbow' ? Math.min(...widths) : widths[0]
    const font = Math.max(14, Math.min(34, (fitCol - 20) / (longest * 0.62)))

    // Short lists get roomier rows so the page looks full.
    const fitRow = Math.floor((H - HEADER_H - INTRO_H - HEAD_H - 6) / words.length)
    const rowH = fitRow >= ROW_H ? Math.min(104, fitRow) : ROW_H
    const firstCap = Math.floor((H - HEADER_H - INTRO_H - HEAD_H) / rowH)
    const laterCap = Math.floor((H - HEAD_H) / rowH)
    const groups = [words.slice(0, firstCap), ...chunk(words.slice(firstCap), laterCap)]

    return groups.map<PageSpec>((g, gi) => ({
      node: (
        <div className="flex h-full flex-col">
          {gi === 0 && (
            <>
              <WorksheetHeader title={ctx.title} teacherName={ctx.teacherName} />
              <p className="mb-1 mt-2 text-center text-[16px] font-semibold text-stone-600" style={{ height: INTRO_H - 8 }}>
                {settings.style === 'cover' ? 'Look at the word. Cover it. Write it from memory. Then check!' : 'Trace each word in the color shown.'}
              </p>
            </>
          )}
          <div className="flex bg-stone-200 text-[13px] font-black uppercase tracking-wide text-stone-700" style={{ height: HEAD_H }}>
            {HEADINGS[settings.style].map((h, i) => (
              <div key={h} className="flex items-center justify-center" style={{ width: widths[i] }}>{h}</div>
            ))}
          </div>
          {g.map((w) => <WordRow key={w} word={w} style={settings.style} font={font} colW={widths} rowH={rowH} />)}
        </div>
      ),
    }))
  },
}

export default spelling
