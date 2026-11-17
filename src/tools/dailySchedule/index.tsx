import { ArrowDown, ArrowUp, CalendarClock, X } from 'lucide-react'
import { Toggle } from '../../components/ui'
import { WorksheetHeader } from '../../components/Sheet'
import { contentHeight, contentWidth, HEADER_H } from '../../lib/paper'
import { tooMany } from '../issues'
import type { ReadyTool } from '../types'
import { ACTIVITIES, byId, moveEntry, type Entry } from './catalog'

interface Settings {
  entries: Entry[]
  checkboxes: boolean
}

const MAX_ENTRIES = 12
const entry = (id: string, time = ''): Entry => ({ id, label: byId(id).label, time })

const iconBtn =
  'flex h-9 w-9 items-center justify-center rounded-lg border-2 border-stone-300 bg-white text-stone-600 hover:border-emerald-400 hover:text-emerald-700 disabled:opacity-30'

const dailySchedule: ReadyTool<Settings> = {
  id: 'daily-schedule',
  slug: 'daily-schedule',
  number: 19,
  name: 'Visual Daily Schedule',
  category: 'classroom',
  icon: CalendarClock,
  tagline: 'A picture routine poster kids can follow on their own.',
  status: 'ready',
  defaultTitle: 'Our Day',
  defaultSettings: {
    entries: [
      entry('arrive', '8:30'), entry('circle', '8:45'), entry('reading', '9:00'), entry('math', '10:00'),
      entry('snack', '11:00'), entry('recess', '11:15'), entry('lunch', '12:00'), entry('home', '3:00'),
    ],
    checkboxes: true,
  },

  Controls({ settings, patch }) {
    const { entries } = settings
    const set = (next: Entry[]) => patch({ entries: next })
    const edit = (i: number, p: Partial<Entry>) => set(entries.map((e, k) => (k === i ? { ...e, ...p } : e)))
    const input = 'min-w-0 rounded-lg border-2 border-stone-300 px-2 py-1.5 text-[15px] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100'
    return (
      <>
        <div>
          <div className="mb-1.5 text-[15px] font-bold text-stone-800">Your day, in order</div>
          <ul className="space-y-2">
            {entries.map((e, i) => {
              const a = byId(e.id)
              const Icon = a.icon
              return (
                <li key={i} className="flex items-center gap-1.5 rounded-xl bg-stone-50 p-1.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: a.color }}>
                    <Icon size={20} color="#fff" />
                  </span>
                  <input aria-label="Activity name" className={`${input} flex-1`} value={e.label} maxLength={24} onChange={(ev) => edit(i, { label: ev.target.value })} />
                  <input aria-label="Time" className={`${input} w-[4.5rem]`} value={e.time} maxLength={8} placeholder="Time" onChange={(ev) => edit(i, { time: ev.target.value })} />
                  <button type="button" className={iconBtn} aria-label="Move up" disabled={i === 0} onClick={() => set(moveEntry(entries, i, i - 1))}><ArrowUp size={16} /></button>
                  <button type="button" className={iconBtn} aria-label="Move down" disabled={i === entries.length - 1} onClick={() => set(moveEntry(entries, i, i + 1))}><ArrowDown size={16} /></button>
                  <button type="button" className={iconBtn} aria-label="Remove" onClick={() => set(entries.filter((_, k) => k !== i))}><X size={16} /></button>
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <div className="mb-1.5 text-[15px] font-bold text-stone-800">Add an activity</div>
          <div className="grid grid-cols-3 gap-1.5">
            {ACTIVITIES.map((a) => {
              const Icon = a.icon
              return (
                <button
                  key={a.id}
                  type="button"
                  disabled={entries.length >= MAX_ENTRIES}
                  onClick={() => set([...entries, entry(a.id)])}
                  className="flex flex-col items-center gap-1 rounded-xl border-2 border-stone-200 bg-white px-1 py-2 text-center text-[12px] font-bold leading-tight text-stone-700 hover:border-emerald-400 disabled:opacity-40"
                >
                  <Icon size={22} color={a.color} />
                  {a.label}
                </button>
              )
            })}
          </div>
        </div>

        <Toggle label="Add tick circles" description="Kids tick each activity when it is done." checked={settings.checkboxes} onChange={(v) => patch({ checkboxes: v })} />
      </>
    )
  },

  check(settings) {
    const n = settings.entries.length
    if (n === 0) return [{ level: 'error', message: 'Your schedule is empty. Tap some pictures under "Add an activity" to build it.' }]
    return tooMany(n, MAX_ENTRIES, 'activity', 'Remove one to see it on the page.')
  },

  pages(settings, ctx) {
    const entries = settings.entries.slice(0, MAX_ENTRIES)
    if (entries.length === 0) return []
    const W = contentWidth(ctx.paper)
    const H = contentHeight(ctx.paper)
    const cols = entries.length <= 8 ? 1 : 2
    const rows = Math.ceil(entries.length / cols)
    const gap = 12
    const cardW = Math.floor((W - gap * (cols - 1)) / cols)
    const availH = H - HEADER_H - 16
    const cardH = Math.min(128, Math.floor((availH - gap * (rows - 1)) / rows))
    const iconBox = cardH - 8
    const labelFs = Math.max(18, Math.min(44, cardH * 0.38, (cardW - iconBox - 150) / 9))

    // Fill column by column so the order reads top→bottom, left→right.
    const ordered: (Entry | null)[] = []
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) ordered.push(entries[c * rows + r] ?? null)

    return [
      {
        node: (
          <div className="flex h-full flex-col">
            <WorksheetHeader title={ctx.title} teacherName={ctx.teacherName} nameLine={false} />
            <div className="mt-2 grid content-start" style={{ gridTemplateColumns: `repeat(${cols}, ${cardW}px)`, gap }}>
              {ordered.map((e, i) => {
                if (!e) return <div key={i} />
                const a = byId(e.id)
                const Icon = a.icon
                return (
                  <div key={i} className="flex items-center gap-3 overflow-hidden rounded-2xl border-[3px] px-1.5" style={{ height: cardH, borderColor: a.color, background: '#fff' }}>
                    <div className="flex shrink-0 items-center justify-center rounded-xl" style={{ width: iconBox, height: iconBox, background: a.color }}>
                      <Icon size={iconBox * 0.62} color="#ffffff" strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0 flex-1 font-black leading-tight text-stone-900" style={{ fontSize: labelFs }}>
                      {e.label}
                    </div>
                    {e.time && (
                      <div className="shrink-0 rounded-full px-3 py-1 font-extrabold text-stone-900" style={{ background: `${a.color}26`, fontSize: Math.max(15, labelFs * 0.62) }}>
                        {e.time}
                      </div>
                    )}
                    {settings.checkboxes && <div className="shrink-0 rounded-full border-[3px] border-stone-400" style={{ width: cardH * 0.4, height: cardH * 0.4 }} />}
                  </div>
                )
              })}
            </div>
          </div>
        ),
      },
    ]
  },
}

export default dailySchedule
