import { LayoutGrid, Star } from 'lucide-react'
import { Button, Segmented, Stepper, TextArea, Toggle } from '../../components/ui'
import { WorksheetHeader } from '../../components/Sheet'
import { contentHeight, contentWidth, HEADER_H } from '../../lib/paper'
import { chunk, parseList } from '../../lib/text'
import { tooMany } from '../issues'
import type { Issue, PageSpec, ReadyTool } from '../types'
import { cellsNeeded, FREE, generateBingoCards, hasFree } from './generate'

interface Settings {
  items: string
  size: number
  freeSpace: boolean
  cards: number
  perPage: 1 | 2 | 4
}

const MAX_ITEMS = 100
const DEFAULT_ITEMS = [
  'cat', 'dog', 'sun', 'hat', 'bed', 'cup', 'pig', 'bus', 'red', 'fox', 'run', 'big',
  'map', 'pen', 'box', 'net', 'jam', 'van', 'leg', 'fan', 'web', 'toy', 'log', 'zip', 'kid', 'egg',
].join('\n')

const numbers = (n: number) => Array.from({ length: n }, (_, i) => String(i + 1)).join('\n')

function fontSizeFor(text: string, cell: number): number {
  const longest = Math.max(...text.split(/\s+/).map((w) => w.length), 1)
  const bySize = cell * 0.34
  const byWord = (cell * 0.88) / (longest * 0.62)
  const byArea = (cell * 0.85) / Math.sqrt(text.length * 0.7)
  return Math.max(9, Math.min(bySize, byWord, byArea, 44))
}

function Card({ cells, size, px, title, number }: { cells: string[]; size: number; px: number; title: string; number: number }) {
  const cell = Math.floor(px / size)
  const total = cell * size
  const titleFont = Math.max(22, Math.min(64, Math.round(total / 7)))
  return (
    <div className="flex flex-col items-center" style={{ width: total + 6 }}>
      <div className="w-full pb-1 text-center font-black tracking-[0.2em] text-stone-900" style={{ fontSize: titleFont, lineHeight: 1.15 }}>
        {title}
      </div>
      <div className="border-[3px] border-stone-900" style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, ${cell}px)` }}>
        {cells.map((text, i) => (
          <div
            key={i}
            className="flex items-center justify-center border border-stone-500 p-1 text-center font-extrabold leading-tight text-stone-900"
            style={{ height: cell, fontSize: text === FREE ? cell * 0.2 : fontSizeFor(text, cell), background: text === FREE ? '#fef3c7' : undefined, overflowWrap: 'anywhere' }}
          >
            {text === FREE ? (
              <span className="flex flex-col items-center gap-0.5">
                <Star size={cell * 0.34} color="#d97706" fill="#fbbf24" strokeWidth={2} />
                <span className="font-black tracking-widest">FREE</span>
              </span>
            ) : (
              text
            )}
          </div>
        ))}
      </div>
      <div className="mt-1 self-end text-[11px] font-semibold text-stone-400">Card {number}</div>
    </div>
  )
}

const bingo: ReadyTool<Settings> = {
  id: 'bingo',
  slug: 'bingo-cards',
  number: 15,
  name: 'Bingo Cards',
  category: 'puzzles',
  icon: LayoutGrid,
  tagline: 'Unique cards for the whole class from your own words.',
  status: 'ready',
  defaultTitle: 'BINGO',
  defaultSettings: { items: DEFAULT_ITEMS, size: 5, freeSpace: true, cards: 6, perPage: 2 },
  usesSeed: true,
  seedLabel: 'Shuffle cards',
  answerKey: { label: "Include caller's list", description: 'A page with every word, so you can call them out and check winners.' },

  Controls({ settings, patch }) {
    const need = cellsNeeded(settings.size, settings.freeSpace)
    return (
      <>
        <TextArea
          label="Words or numbers for the cards"
          hint={`One per line. You need at least ${need} for ${settings.size}×${settings.size} cards.`}
          rows={8}
          value={settings.items}
          onChange={(v) => patch({ items: v })}
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="!px-3 !py-1.5 !text-sm" onClick={() => patch({ items: numbers(30) })}>Use numbers 1–30</Button>
          <Button variant="secondary" className="!px-3 !py-1.5 !text-sm" onClick={() => patch({ items: numbers(75) })}>Use numbers 1–75</Button>
        </div>
        <Segmented
          label="Card size"
          value={settings.size}
          onChange={(v) => patch({ size: v })}
          options={[3, 4, 5].map((n) => ({ value: n, label: `${n}×${n}` }))}
        />
        {settings.size % 2 === 1 && (
          <Toggle label="Free space in the middle" checked={settings.freeSpace} onChange={(v) => patch({ freeSpace: v })} />
        )}
        <Stepper label="How many different cards?" hint="One for each student, plus a few spares." value={settings.cards} min={1} max={40} onChange={(v) => patch({ cards: v })} />
        <Segmented
          label="Cards per page"
          value={settings.perPage}
          onChange={(v) => patch({ perPage: v })}
          options={[{ value: 1, label: '1' }, { value: 2, label: '2' }, { value: 4, label: '4' }]}
        />
      </>
    )
  },

  check(settings) {
    const count = parseList(settings.items).length
    const need = cellsNeeded(settings.size, settings.freeSpace)
    const issues: Issue[] = []
    if (count < need) {
      issues.push({
        level: 'error',
        message: `You have ${count} ${count === 1 ? 'item' : 'items'}, but ${settings.size}×${settings.size} cards need at least ${need}${hasFree(settings.size, settings.freeSpace) ? ' (the free space fills the middle square)' : ''}. Add ${need - count} more, or choose a smaller card size.`,
      })
    }
    return [...issues, ...tooMany(count, MAX_ITEMS, 'item')]
  },

  pages(settings, ctx) {
    const items = parseList(settings.items).slice(0, MAX_ITEMS)
    const cards = generateBingoCards({ items, size: settings.size, freeSpace: settings.freeSpace, cards: settings.cards, seed: ctx.seed })
    if (cards.length === 0) return []

    const W = contentWidth(ctx.paper)
    const H = contentHeight(ctx.paper)
    const per = settings.perPage
    const slotW = per === 4 ? W / 2 : W
    const slotH = per === 1 ? H : per === 2 ? H / 2 : H / 2
    const titleH = per === 1 ? 84 : per === 2 ? 60 : 44
    const px = Math.floor(Math.min(slotW - 16, slotH - titleH - 26, 680))

    const pages: PageSpec[] = chunk(cards, per).map((group, pi) => ({
      label: `Cards ${pi * per + 1}–${pi * per + group.length}`,
      node: (
        <div
          className="grid h-full"
          style={{ gridTemplateColumns: per === 4 ? '1fr 1fr' : '1fr', gridTemplateRows: per === 1 ? '1fr' : '1fr 1fr' }}
        >
          {group.map((cells, i) => (
            <div key={i} className="flex items-center justify-center">
              <Card cells={cells} size={settings.size} px={px} title={ctx.title} number={pi * per + i + 1} />
            </div>
          ))}
        </div>
      ),
    }))

    if (ctx.includeAnswerKey) {
      const cols = items.length > 60 ? 4 : items.length > 30 ? 3 : 2
      const rows = Math.ceil(items.length / cols)
      pages.push({
        label: "Caller's list",
        node: (
          <div className="flex h-full flex-col">
            <WorksheetHeader title="Caller's List" nameLine={false} />
            <p className="mb-3 mt-1 text-center text-[15px] font-semibold text-stone-600">Tick each one as you call it out.</p>
            <ul className="grid gap-x-6" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: Math.min(34, Math.floor((H - HEADER_H - 50) / rows)) }}>
              {items.map((it) => (
                <li key={it} className="flex items-center gap-2 text-[18px] font-bold">
                  <span className="inline-block h-[16px] w-[16px] shrink-0 rounded-[3px] border-2 border-stone-700" />
                  {it}
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

export default bingo
