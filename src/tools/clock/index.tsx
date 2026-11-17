import type { ReactNode } from 'react'
import { Clock } from 'lucide-react'
import { Segmented } from '../../components/ui'
import { WorksheetHeader } from '../../components/Sheet'
import { contentHeight, contentWidth, HEADER_H } from '../../lib/paper'
import type { PageSpec, ReadyTool } from '../types'
import { formatTime, generateTimes, handAngles, type ClockTime, type Precision } from './generate'

interface Settings {
  mode: 'read' | 'draw'
  precision: Precision
  count: 6 | 9 | 12
}

const HOUR_COLOR = '#dc2626'
const MINUTE_COLOR = '#1d4ed8'

function Face({ size, time }: { size: number; time?: ClockTime }) {
  const c = size / 2
  const r = size / 2 - 4
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const major = i % 5 === 0
    const a = (i * 6 * Math.PI) / 180
    const r1 = r - (major ? size * 0.07 : size * 0.035)
    return { x1: c + r1 * Math.sin(a), y1: c - r1 * Math.cos(a), x2: c + r * Math.sin(a), y2: c - r * Math.cos(a), major }
  })
  const hand = (deg: number, len: number) => {
    const a = (deg * Math.PI) / 180
    return { x2: c + len * Math.sin(a), y2: c - len * Math.cos(a) }
  }
  const angles = time ? handAngles(time) : null
  const numR = r - size * 0.15

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0">
        <circle cx={c} cy={c} r={r} fill="#ffffff" stroke="#1c1917" strokeWidth={Math.max(3, size * 0.02)} />
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#1c1917" strokeWidth={t.major ? 2.2 : 1} />
        ))}
        {angles && (
          <>
            <line x1={c} y1={c} {...hand(angles.hour, r * 0.5)} stroke={HOUR_COLOR} strokeWidth={Math.max(5, size * 0.04)} strokeLinecap="round" />
            <line x1={c} y1={c} {...hand(angles.minute, r * 0.78)} stroke={MINUTE_COLOR} strokeWidth={Math.max(3, size * 0.025)} strokeLinecap="round" />
          </>
        )}
        <circle cx={c} cy={c} r={Math.max(3.5, size * 0.025)} fill="#1c1917" />
      </svg>
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1
        const a = (n * 30 * Math.PI) / 180
        return (
          <div
            key={n}
            className="absolute font-black leading-none text-stone-900"
            style={{ left: c + numR * Math.sin(a), top: c - numR * Math.cos(a), transform: 'translate(-50%, -50%)', fontSize: size * 0.105 }}
          >
            {n}
          </div>
        )
      })}
    </div>
  )
}

function layout(count: number, W: number, H: number, labelH: number) {
  const cols = count === 6 ? 2 : 3
  const rows = Math.ceil(count / cols)
  const size = Math.floor(Math.min(W / cols - 36, H / rows - labelH - 14, 300))
  return { cols, rows, size }
}

const clock: ReadyTool<Settings> = {
  id: 'clock',
  slug: 'clock-worksheets',
  number: 13,
  name: 'Clock Worksheets',
  category: 'math',
  icon: Clock,
  tagline: 'Read the time, or draw the hands on blank clocks.',
  status: 'ready',
  defaultTitle: 'What Time Is It?',
  defaultSettings: { mode: 'read', precision: 'quarter', count: 12 },
  usesSeed: true,
  seedLabel: 'New times',
  answerKey: { label: 'Include answer key', description: 'Adds a page with every clock and its time.' },

  Controls({ settings, patch }) {
    return (
      <>
        <Segmented
          label="What do kids do?"
          hint={settings.mode === 'read' ? 'They look at each clock and write the time.' : 'They see the time and draw the hands.'}
          value={settings.mode}
          onChange={(v) => patch({ mode: v })}
          options={[{ value: 'read', label: 'Tell the time' }, { value: 'draw', label: 'Draw the hands' }]}
        />
        <Segmented
          label="Which times?"
          value={settings.precision}
          onChange={(v) => patch({ precision: v })}
          options={[
            { value: 'hour', label: "O'clock" },
            { value: 'half', label: 'Half hours' },
            { value: 'quarter', label: 'Quarters' },
            { value: 'five', label: '5 minutes' },
          ]}
        />
        <Segmented
          label="How many clocks?"
          value={settings.count}
          onChange={(v) => patch({ count: v })}
          options={[{ value: 6, label: '6 (big)' }, { value: 9, label: '9' }, { value: 12, label: '12' }]}
        />
      </>
    )
  },

  pages(settings, ctx) {
    const times = generateTimes(settings.count, settings.precision, ctx.seed)
    const W = contentWidth(ctx.paper)
    const availH = contentHeight(ctx.paper) - HEADER_H - 44
    const draw = settings.mode === 'draw'
    const { cols, size } = layout(settings.count, W, availH, 58)

    const grid = (items: ClockTime[], opts: { hands: boolean; label: (t: ClockTime) => ReactNode }) => (
      <div className="grid justify-center gap-x-4 gap-y-3" style={{ gridTemplateColumns: `repeat(${cols}, ${size + 30}px)` }}>
        {items.map((t, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="self-start pl-2 text-[13px] font-black text-stone-400">{i + 1}</div>
            <Face size={size} time={opts.hands ? t : undefined} />
            <div className="mt-1.5 flex h-[38px] items-end justify-center">{opts.label(t)}</div>
          </div>
        ))}
      </div>
    )

    const pages: PageSpec[] = [
      {
        node: (
          <div className="flex h-full flex-col">
            <WorksheetHeader title={ctx.title} teacherName={ctx.teacherName} />
            <p className="mb-2 mt-2 text-center text-[16px] font-semibold text-stone-600">
              {draw ? 'Draw the short hour hand and the long minute hand to show each time.' : 'Write the time shown on each clock.'}
            </p>
            {grid(times, {
              hands: !draw,
              label: (t) =>
                draw ? (
                  <span className="text-[30px] font-black tabular-nums text-stone-900">{formatTime(t)}</span>
                ) : (
                  <span className="flex items-end gap-1 text-[20px] font-black text-stone-500">
                    <span className="inline-block w-20 border-b-[3px] border-stone-800" />
                    :
                    <span className="inline-block w-14 border-b-[3px] border-stone-800" />
                  </span>
                ),
            })}
          </div>
        ),
      },
    ]

    if (ctx.includeAnswerKey) {
      pages.push({
        label: 'Answer Key',
        node: (
          <div className="flex h-full flex-col">
            <WorksheetHeader title={`${ctx.title} – Answer Key`} nameLine={false} />
            <div className="mt-3 flex items-center justify-center gap-5 text-[14px] font-bold text-stone-600">
              <span className="flex items-center gap-1.5"><span className="inline-block h-1.5 w-6 rounded-full" style={{ background: HOUR_COLOR }} /> hour hand</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-1 w-8 rounded-full" style={{ background: MINUTE_COLOR }} /> minute hand</span>
            </div>
            <div className="mt-2">
              {grid(times, { hands: true, label: (t) => <span className="text-[26px] font-black tabular-nums text-emerald-700">{formatTime(t)}</span> })}
            </div>
          </div>
        ),
      })
    }
    return pages
  },
}

export default clock
