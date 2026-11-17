import { Sigma } from 'lucide-react'
import { Segmented } from '../../components/ui'
import { WorksheetHeader } from '../../components/Sheet'
import { contentHeight, contentWidth, HEADER_H } from '../../lib/paper'
import type { Issue, PageSpec, ReadyTool } from '../types'
import { generateCards, offLevelCount, type Card, type Level, type Target } from './generate'

interface Settings {
  target: Target
  level: Level
  count: 6 | 8 | 12
}

const TINTS = ['#fecaca', '#fde68a', '#bbf7d0', '#bfdbfe']

function Puzzle({ n, card, target, w, h }: { n: number; card: Card; target: Target; w: number; h: number }) {
  const circle = Math.max(34, Math.min(60, Math.floor(h * 0.32), Math.floor((w - 150) / 4) - 6))
  return (
    <div className="flex flex-col rounded-2xl p-3" style={{ width: w, height: h, border: '3px solid #1c1917' }}>
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-800 text-[14px] font-black text-white">{n}</span>
        <div className="flex flex-1 items-center justify-center gap-1.5">
          {card.numbers.map((num, i) => (
            <span
              key={i}
              className="flex items-center justify-center rounded-full border-[3px] border-stone-800 font-black text-stone-900"
              style={{ width: circle, height: circle, fontSize: circle * 0.5, background: TINTS[i] }}
            >
              {num}
            </span>
          ))}
        </div>
        <span className="shrink-0 text-[26px] font-black text-stone-800">= {target}</span>
      </div>
      <div className="mt-auto flex items-end gap-2 pb-1">
        <span className="text-[13px] font-bold text-stone-400">Show how:</span>
        <span className="flex-1 border-b-[3px] border-stone-700" style={{ height: Math.max(26, h * 0.2) }} />
      </div>
      <div className="mt-1 flex items-center justify-between text-[12px] font-bold text-stone-400">
        <span>Winner: P1 ◯ P2 ◯</span>
        <span>Use each number once</span>
      </div>
    </div>
  )
}

const make24: ReadyTool<Settings> = {
  id: 'four-numbers',
  slug: 'four-numbers-challenge',
  number: 4,
  name: 'Four Numbers Challenge',
  category: 'math',
  icon: Sigma,
  tagline: 'Race to reach the target with four numbers. Just paper and a pencil!',
  status: 'ready',
  defaultTitle: 'Number Challenge!',
  defaultSettings: { target: 24, level: 'medium', count: 8 },
  usesSeed: true,
  seedLabel: 'New puzzles',
  answerKey: { label: "Include teacher's answers", description: 'Adds a page with one way to solve every puzzle.' },

  Controls({ settings, patch }) {
    return (
      <>
        <Segmented
          label="Target number"
          hint={settings.target === 24 ? 'The classic game.' : settings.target === 12 ? 'A little gentler.' : 'Great for younger kids.'}
          value={settings.target}
          onChange={(v) => patch({ target: v })}
          options={[{ value: 10, label: 'Target 10' }, { value: 12, label: 'Target 12' }, { value: 24, label: 'Target 24' }]}
        />
        <Segmented
          label="How tricky?"
          hint={{ easy: 'Lots of different ways to solve each one.', medium: 'A few ways to solve each one.', hard: 'Only 1–3 ways. Bigger numbers too!' }[settings.level]}
          value={settings.level}
          onChange={(v) => patch({ level: v })}
          options={[{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }]}
        />
        <Segmented
          label="How many puzzles?"
          value={settings.count}
          onChange={(v) => patch({ count: v })}
          options={[{ value: 6, label: '6' }, { value: 8, label: '8' }, { value: 12, label: '12' }]}
        />
        <div className="rounded-xl bg-stone-50 p-3 text-sm text-stone-600">
          <b className="text-stone-800">How to play:</b> use all four numbers, each exactly once, with + − × ÷ (and brackets if you like) to make {settings.target}.
          Play alone, or race a friend: the first to write a correct answer wins the round. Every puzzle can be solved!
        </div>
      </>
    )
  },

  check(settings, ctx) {
    const cards = generateCards(settings.count, settings.target, settings.level, ctx.seed)
    const off = offLevelCount(cards, settings.level)
    const issues: Issue[] = []
    if (cards.length < settings.count) {
      issues.push({ level: 'warn', message: `Only ${cards.length} different puzzles could be made for target ${settings.target}, not ${settings.count}. Choose fewer puzzles or a different target.` })
    }
    if (off > 0) {
      issues.push({ level: 'warn', message: `${off} of the ${cards.length} puzzles are a different difficulty from "${settings.level}", because there are not enough exact matches for target ${settings.target}. Every puzzle can still be solved.` })
    }
    return issues
  },

  pages(settings, ctx) {
    const cards = generateCards(settings.count, settings.target, settings.level, ctx.seed)
    const W = contentWidth(ctx.paper)
    const H = contentHeight(ctx.paper)
    const cols = 2
    const rows = Math.ceil(cards.length / cols)
    const gap = 14
    const w = Math.floor((W - gap) / cols)
    const h = Math.min(230, Math.floor((H - HEADER_H - 58 - gap * (rows - 1)) / rows))

    const pages: PageSpec[] = [
      {
        node: (
          <div className="flex h-full flex-col">
            <WorksheetHeader title={ctx.title} teacherName={ctx.teacherName} />
            <div className="mb-2 mt-2 flex items-center justify-between text-[14px] font-semibold text-stone-600" style={{ height: 40 }}>
              <span className="max-w-[62%] leading-snug">Use all four numbers once each, with + − × ÷, to make <b>{settings.target}</b>. Brackets are allowed!</span>
              <span className="flex items-end gap-2 font-bold text-stone-800">
                Score: P1 <span className="inline-block w-10 border-b-2 border-stone-800" /> P2 <span className="inline-block w-10 border-b-2 border-stone-800" />
              </span>
            </div>
            <div className="grid content-start" style={{ gridTemplateColumns: `repeat(${cols}, ${w}px)`, gap }}>
              {cards.map((c, i) => <Puzzle key={i} n={i + 1} card={c} target={settings.target} w={w} h={h} />)}
            </div>
          </div>
        ),
      },
    ]

    if (ctx.includeAnswerKey) {
      pages.push({
        label: "Teacher's answers",
        node: (
          <div className="flex h-full flex-col">
            <WorksheetHeader title={`${ctx.title} – Answers`} nameLine={false} />
            <p className="mb-3 mt-1 text-[14px] font-semibold text-stone-500">One way to solve each puzzle. Other correct answers are possible.</p>
            <ol className="space-y-2 text-[20px] font-bold">
              {cards.map((c, i) => (
                <li key={i} className="flex items-baseline gap-3 border-b border-stone-200 pb-1.5">
                  <span className="w-8 text-right text-stone-400">{i + 1}.</span>
                  <span className="w-[150px] shrink-0 text-stone-500">{c.numbers.join(', ')}</span>
                  <span className="text-emerald-700">{c.solution} = {settings.target}</span>
                  <span className="ml-auto text-[13px] font-semibold text-stone-400">{c.ways} {c.ways === 1 ? 'way' : 'ways'}</span>
                </li>
              ))}
            </ol>
          </div>
        ),
      })
    }
    return pages
  },
}

export default make24
