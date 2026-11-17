import { Hand } from 'lucide-react'
import { TextArea } from '../../components/ui'
import { WorksheetHeader } from '../../components/Sheet'
import { contentHeight, contentWidth } from '../../lib/paper'
import { chunk } from '../../lib/text'
import { nonEmptyLines, skipped, tooFew, tooMany } from '../issues'
import type { Issue, PageSpec, ReadyTool } from '../types'
import { buildChain, duplicateAnswers, parseQA, type HaveCard } from './generate'

interface Settings {
  items: string
}

const MAX_CARDS = 30
const DEFAULT_ITEMS = [
  '2 + 3 | 5', '4 + 4 | 8', '10 - 3 | 7', '6 + 6 | 12', '9 - 5 | 4', '3 + 3 | 6', '7 + 2 | 9', '15 - 4 | 11', '5 + 5 | 10', '1 + 0 | 1',
].join('\n')

/** Largest font (px) at which the text still fits the box. */
function fitFont(text: string, w: number, h: number, max = 30, min = 12): number {
  for (let fs = max; fs >= min; fs -= 1) {
    const perLine = Math.max(1, Math.floor(w / (fs * 0.58)))
    const lines = Math.ceil(text.length / perLine)
    if (lines * fs * 1.2 <= h) return fs
  }
  return min
}

function Card({ card, w, h }: { card: HaveCard; w: number; h: number }) {
  const half = (h - 6) / 2
  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ width: w, height: h, border: '3px dashed #78716c' }}>
      <div className="flex flex-col justify-center px-4" style={{ height: half, background: '#dcfce7' }}>
        <div className="text-[13px] font-black uppercase tracking-widest text-emerald-800">I have</div>
        <div className="font-black leading-tight text-stone-900" style={{ fontSize: fitFont(card.have, w - 32, half - 24) }}>{card.have}</div>
      </div>
      <div className="flex flex-col justify-center px-4" style={{ height: half, background: '#dbeafe', borderTop: '3px solid #1c1917' }}>
        <div className="text-[13px] font-black uppercase tracking-widest text-blue-800">Who has</div>
        <div className="font-black leading-tight text-stone-900" style={{ fontSize: fitFont(card.who, w - 32, half - 24) }}>{card.who}?</div>
      </div>
      {card.start && (
        <div className="absolute right-3 top-2 rounded-full bg-amber-300 px-2.5 py-0.5 text-[12px] font-black uppercase tracking-wide text-amber-950">Start here</div>
      )}
    </div>
  )
}

const iHaveWhoHas: ReadyTool<Settings> = {
  id: 'i-have-who-has',
  slug: 'i-have-who-has',
  number: 5,
  name: '"I Have… Who Has?"',
  category: 'puzzles',
  icon: Hand,
  tagline: 'The classroom listening game: every student holds one card.',
  status: 'ready',
  defaultTitle: 'I Have… Who Has?',
  hideTitle: true,
  defaultSettings: { items: DEFAULT_ITEMS },
  usesSeed: true,
  seedLabel: 'Reshuffle the loop',
  answerKey: { label: "Include teacher's key", description: 'A page with the order of the loop and how to play.' },

  Controls({ settings, patch }) {
    return (
      <>
        <TextArea
          label="Questions and answers"
          hint="One per line: question | answer. Example: 3 + 4 | 7. Make about as many as you have students."
          rows={10}
          value={settings.items}
          onChange={(v) => patch({ items: v })}
        />
        <p className="text-sm text-stone-500">
          How to play: hand out one card to each student. The student with the START card reads only the blue &ldquo;Who has&rdquo; line. Whoever holds the answer says &ldquo;I have…&rdquo; and reads their own blue line. Keep going until the loop is complete!
        </p>
      </>
    )
  },

  check(settings) {
    const items = parseQA(settings.items)
    const dup = duplicateAnswers(items)
    const issues: Issue[] = [
      ...tooFew(items.length, 3, 'line', 'Write each one as: question | answer, for example 3 + 4 | 7.'),
      ...skipped(nonEmptyLines(settings.items) - items.length, 'it has no | between the question and the answer, or one side is empty'),
    ]
    if (dup.length > 0) {
      issues.push({ level: 'warn', message: `Some answers appear more than once (${dup.join(', ')}). Give every card a different answer, or two students will both think it is their turn.` })
    }
    return [...issues, ...tooMany(items.length, MAX_CARDS, 'card')]
  },

  pages(settings, ctx) {
    const items = parseQA(settings.items).slice(0, MAX_CARDS)
    if (items.length < 3) return []
    const cards = buildChain(items, ctx.seed)
    const W = contentWidth(ctx.paper)
    const H = contentHeight(ctx.paper)
    const rows = 5
    const w = Math.floor(W / 2) - 6
    const h = Math.floor(H / rows) - 6

    const pages: PageSpec[] = chunk(cards, rows * 2).map((group, pi) => ({
      label: `Cards ${pi * 10 + 1}–${pi * 10 + group.length}`,
      node: (
        <div className="grid content-start justify-center gap-x-3 gap-y-[6px]" style={{ gridTemplateColumns: `repeat(2, ${w}px)` }}>
          {group.map((c, i) => <Card key={i} card={c} w={w} h={h} />)}
        </div>
      ),
    }))

    if (ctx.includeAnswerKey) {
      pages.push({
        label: "Teacher's key",
        node: (
          <div className="flex h-full flex-col">
            <WorksheetHeader title="Teacher's Key" nameLine={false} />
            <ol className="mt-2 text-[17px] font-bold">
              {cards.map((c, k) => (
                <li key={k} className="flex gap-3 border-b border-stone-200 py-1.5">
                  <span className="w-8 text-right text-stone-400">{k + 1}.</span>
                  <span className="flex-1">I have <b className="text-emerald-700">{c.have}</b></span>
                  <span className="flex-1 text-blue-800">Who has {c.who}?</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-[14px] text-stone-500">Card 1 is the START card. The last card asks the question that brings the game back to card 1.</p>
          </div>
        ),
      })
    }
    return pages
  },
}

export default iHaveWhoHas
