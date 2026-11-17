import { Dices } from 'lucide-react'
import { Button, Segmented, TextArea, Toggle } from '../../components/ui'
import { WorksheetHeader } from '../../components/Sheet'
import { contentHeight, contentWidth, HEADER_H } from '../../lib/paper'
import { parseList } from '../../lib/text'
import type { Issue, ReadyTool } from '../types'
import { DOT_FACE_NUMBERS, hasNeighbor, NET_CELLS, NET_COLS, NET_ROWS, TABS, type Side } from './net'

type Mode = 'dots' | 'custom'

interface Settings {
  mode1: Mode
  words1: string
  second: boolean
  mode2: Mode
  words2: string
  size: 'small' | 'medium' | 'large'
  colors: boolean
}

const TINTS = ['#fecaca', '#fed7aa', '#fef08a', '#bbf7d0', '#bfdbfe', '#e9d5ff']
const PRESETS: { label: string; lines: string[] }[] = [
  { label: 'Question words', lines: ['Who?', 'What?', 'Where?', 'When?', 'Why?', 'How?'] },
  { label: 'Feelings', lines: ['Happy', 'Sad', 'Angry', 'Sleepy', 'Excited', 'Scared'] },
  { label: 'Actions', lines: ['Jump', 'Clap', 'Spin', 'Hop', 'Stomp', 'Wave'] },
  { label: 'Math signs', lines: ['+', '−', '×', '÷', '=', '?'] },
]
const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
}
const SIZES = { small: 100, medium: 130, large: 170 }
const TAB_DEPTH = 0.28

function facesFor(mode: Mode, words: string): (string | number)[] {
  if (mode === 'dots') return DOT_FACE_NUMBERS
  const lines = parseList(words, { splitCommas: false })
  return Array.from({ length: 6 }, (_, i) => lines[i] ?? '')
}

function Face({ content, s }: { content: string | number; s: number }) {
  if (typeof content === 'number') {
    const pad = s * 0.2
    const step = (s - pad * 2) / 2
    return (
      <svg width={s} height={s} className="block">
        {PIPS[content].map(([c, r], i) => (
          <circle key={i} cx={pad + c * step} cy={pad + r * step} r={s * 0.085} fill="#1c1917" />
        ))}
      </svg>
    )
  }
  const longest = Math.max(...content.split(/\s+/).map((w) => w.length), 1)
  const fs = Math.max(11, Math.min(s * 0.32, (s * 0.82) / (longest * 0.64)))
  return (
    <div className="flex items-center justify-center p-1 text-center font-black leading-tight text-stone-900" style={{ width: s, height: s, fontSize: fs, overflowWrap: 'anywhere' }}>
      {content}
    </div>
  )
}

function tabPoints(x: number, y: number, s: number, side: Side): string {
  const t = s * TAB_DEPTH
  const k = s * 0.16
  switch (side) {
    case 'top': return `${x},${y} ${x + k},${y - t} ${x + s - k},${y - t} ${x + s},${y}`
    case 'bottom': return `${x},${y + s} ${x + k},${y + s + t} ${x + s - k},${y + s + t} ${x + s},${y + s}`
    case 'left': return `${x},${y} ${x - t},${y + k} ${x - t},${y + s - k} ${x},${y + s}`
    case 'right': return `${x + s},${y} ${x + s + t},${y + k} ${x + s + t},${y + s - k} ${x + s},${y + s}`
  }
}

function DieNet({ faces, s, colors }: { faces: (string | number)[]; s: number; colors: boolean }) {
  const t = s * TAB_DEPTH
  const ox = t // room for the tab on the right/left
  const oy = t
  const W = NET_COLS * s + t * 2
  const H = NET_ROWS * s + t * 2
  const line = (x1: number, y1: number, x2: number, y2: number, fold: boolean, key: string) => (
    <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={fold ? '#78716c' : '#1c1917'} strokeWidth={fold ? 1.8 : 3} strokeDasharray={fold ? '6 5' : undefined} strokeLinecap="round" />
  )
  return (
    <div className="relative mx-auto" style={{ width: W, height: H }}>
      <svg width={W} height={H} className="absolute inset-0">
        {TABS.map((tab, i) => (
          <polygon key={i} points={tabPoints(ox + tab.col * s, oy + tab.row * s, s, tab.side)} fill="#e7e5e4" stroke="#1c1917" strokeWidth="3" strokeLinejoin="round" />
        ))}
        {NET_CELLS.map((c) => (
          <rect key={c.face} x={ox + c.col * s} y={oy + c.row * s} width={s} height={s} fill={colors ? TINTS[c.face] : '#ffffff'} />
        ))}
        {NET_CELLS.flatMap((c) => {
          const x = ox + c.col * s
          const y = oy + c.row * s
          const sides: [Side, number, number, number, number][] = [
            ['top', x, y, x + s, y],
            ['bottom', x, y + s, x + s, y + s],
            ['left', x, y, x, y + s],
            ['right', x + s, y, x + s, y + s],
          ]
          return sides.map(([side, x1, y1, x2, y2]) => line(x1, y1, x2, y2, hasNeighbor(c.row, c.col, side), `${c.face}-${side}`))
        })}
      </svg>
      {NET_CELLS.map((c) => (
        <div key={c.face} className="absolute" style={{ left: ox + c.col * s, top: oy + c.row * s }}>
          <Face content={faces[c.face]} s={s} />
        </div>
      ))}
    </div>
  )
}

function DieControls({
  label, mode, words, onMode, onWords,
}: { label: string; mode: Mode; words: string; onMode: (m: Mode) => void; onWords: (w: string) => void }) {
  return (
    <div className="space-y-3">
      <Segmented label={label} value={mode} onChange={onMode} options={[{ value: 'dots', label: 'Dots (1–6)' }, { value: 'custom', label: 'My own words' }]} />
      {mode === 'custom' && (
        <>
          <TextArea label="Six faces" hint="One per line (first six are used)." rows={6} value={words} onChange={onWords} />
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <Button key={p.label} variant="secondary" className="!px-2.5 !py-1 !text-sm" onClick={() => onWords(p.lines.join('\n'))}>{p.label}</Button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const diceMaker: ReadyTool<Settings> = {
  id: 'dice-maker',
  slug: 'dice-maker',
  number: 7,
  name: 'Dice Maker',
  category: 'puzzles',
  icon: Dices,
  tagline: 'Cut-and-fold dice with your own words, numbers or symbols.',
  status: 'ready',
  defaultTitle: 'Make Your Own Dice',
  defaultSettings: { mode1: 'custom', words1: PRESETS[0].lines.join('\n'), second: false, mode2: 'dots', words2: PRESETS[1].lines.join('\n'), size: 'medium', colors: true },

  Controls({ settings, patch }) {
    return (
      <>
        <DieControls label="First die" mode={settings.mode1} words={settings.words1} onMode={(m) => patch({ mode1: m })} onWords={(w) => patch({ words1: w })} />
        <Toggle label="Add a second die" description="Great for games that use two dice." checked={settings.second} onChange={(v) => patch({ second: v })} />
        {settings.second && (
          <DieControls label="Second die" mode={settings.mode2} words={settings.words2} onMode={(m) => patch({ mode2: m })} onWords={(w) => patch({ words2: w })} />
        )}
        <Segmented
          label="Die size"
          value={settings.size}
          onChange={(v) => patch({ size: v })}
          options={[{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }]}
        />
        <Toggle label="Color the faces" description="Turn off to save ink." checked={settings.colors} onChange={(v) => patch({ colors: v })} />
        <p className="text-sm text-stone-500">Tip: print on thick paper or card stock. Cut along the solid lines, fold on the dotted lines, and glue the gray tabs inside.</p>
      </>
    )
  },

  check(settings) {
    const issues: Issue[] = []
    const dice: [string, Mode, string][] = [['die', settings.mode1, settings.words1]]
    if (settings.second) dice.push(['second die', settings.mode2, settings.words2])
    dice.forEach(([name, mode, words], i) => {
      if (mode !== 'custom') return
      const label = settings.second ? (i === 0 ? 'The first die' : 'The second die') : 'Your die'
      const n = parseList(words, { splitCommas: false }).length
      if (n < 6) {
        issues.push({ level: 'warn', message: `${label} has only ${n} of 6 faces filled in, so ${6 - n} ${6 - n === 1 ? 'face is' : 'faces are'} blank. Add ${6 - n} more ${6 - n === 1 ? 'line' : 'lines'} under "Six faces".` })
      } else if (n > 6) {
        issues.push({ level: 'warn', message: `${label} has ${n} lines but only 6 faces. Only the first 6 are used.` })
      }
      void name
    })
    return issues
  },

  pages(settings, ctx) {
    const dice = [facesFor(settings.mode1, settings.words1)]
    if (settings.second) dice.push(facesFor(settings.mode2, settings.words2))
    const W = contentWidth(ctx.paper)
    const availH = contentHeight(ctx.paper) - HEADER_H - 44
    const perDie = availH / dice.length - 20
    const s = Math.floor(Math.min(SIZES[settings.size], (W - 2 * TAB_DEPTH * SIZES.large) / NET_COLS, perDie / (NET_ROWS + 2 * TAB_DEPTH)))

    return [
      {
        node: (
          <div className="flex h-full flex-col">
            <WorksheetHeader title={ctx.title} teacherName={ctx.teacherName} nameLine={false} />
            <p className="mb-2 text-center text-[15px] font-semibold text-stone-600">Cut along the solid lines. Fold on the dotted lines. Glue the gray tabs inside.</p>
            <div className="flex flex-1 flex-col items-center justify-around">
              {dice.map((faces, i) => <DieNet key={i} faces={faces} s={s} colors={settings.colors} />)}
            </div>
          </div>
        ),
      },
    ]
  },
}

export default diceMaker
