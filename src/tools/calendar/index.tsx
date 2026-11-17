import { CalendarRange } from 'lucide-react'
import { Segmented, Stepper, Toggle } from '../../components/ui'
import { contentHeight, contentWidth } from '../../lib/paper'
import type { ReadyTool } from '../types'
import { buildMonth, MONTH_NAMES, WEEKDAYS, weekdayOrder, type WeekStart } from './months'

interface Settings {
  view: 'month' | 'year'
  month: number
  year: number
  weekStart: WeekStart
  shadeWeekends: boolean
  notes: boolean
}

const NOW = new Date()
const BORDER = '#44403c'
const WEEKEND = '#f5f5f4'

const calendar: ReadyTool<Settings> = {
  id: 'calendar',
  slug: 'calendar-maker',
  number: 14,
  name: 'Calendar Maker',
  category: 'classroom',
  icon: CalendarRange,
  tagline: 'A monthly calendar with room to write, or a whole year on one page.',
  status: 'ready',
  defaultTitle: 'Calendar',
  hideTitle: true,
  defaultSettings: { view: 'month', month: NOW.getMonth(), year: NOW.getFullYear(), weekStart: 0, shadeWeekends: true, notes: true },

  Controls({ settings, patch }) {
    return (
      <>
        <Segmented
          label="What do you need?"
          value={settings.view}
          onChange={(v) => patch({ view: v })}
          options={[{ value: 'month', label: 'One month' }, { value: 'year', label: 'Whole year' }]}
        />
        {settings.view === 'month' && (
          <Segmented
            label="Month"
            value={settings.month}
            onChange={(v) => patch({ month: v })}
            options={MONTH_NAMES.map((n, i) => ({ value: i, label: n.slice(0, 3) }))}
          />
        )}
        <Stepper label="Year" value={settings.year} min={2000} max={2100} onChange={(v) => patch({ year: v })} />
        <Segmented
          label="Week starts on"
          value={settings.weekStart}
          onChange={(v) => patch({ weekStart: v })}
          options={[{ value: 0, label: 'Sunday' }, { value: 1, label: 'Monday' }]}
        />
        <Toggle label="Shade weekends" description="A light gray tint on Saturday and Sunday." checked={settings.shadeWeekends} onChange={(v) => patch({ shadeWeekends: v })} />
        {settings.view === 'month' && <Toggle label="Notes box at the bottom" checked={settings.notes} onChange={(v) => patch({ notes: v })} />}
      </>
    )
  },

  pages(settings, ctx) {
    const W = contentWidth(ctx.paper)
    const H = contentHeight(ctx.paper)
    const order = weekdayOrder(settings.weekStart)
    const isWeekend = (col: number) => order[col] === 0 || order[col] === 6

    if (settings.view === 'year') {
      const gap = 18
      const cols = 3
      const miniW = Math.floor((W - gap * (cols - 1)) / cols)
      const titleH = 70
      const miniH = Math.floor((H - titleH - gap * 3) / 4)
      const rowH = Math.floor((miniH - 50) / 6)
      return [
        {
          node: (
            <div className="flex h-full flex-col">
              <div className="flex items-baseline justify-between" style={{ height: titleH }}>
                <h1 className="text-[44px] font-black leading-none text-stone-900">{settings.year}</h1>
                <span className="text-[15px] font-bold text-stone-500">{ctx.teacherName}</span>
              </div>
              <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, ${miniW}px)`, gap }}>
                {MONTH_NAMES.map((name, mi) => {
                  const weeks = buildMonth(settings.year, mi, settings.weekStart)
                  return (
                    <div key={name} style={{ height: miniH }}>
                      <div className="mb-1 text-center text-[16px] font-black uppercase tracking-wide text-stone-900">{name}</div>
                      <div className="grid grid-cols-7 text-center text-[11px] font-black text-stone-500">
                        {order.map((d) => <div key={d}>{WEEKDAYS[d][0]}</div>)}
                      </div>
                      <div className="grid grid-cols-7 border-t-2 text-center text-[13px] font-bold text-stone-900" style={{ borderColor: BORDER }}>
                        {weeks.flat().map((day, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-center"
                            style={{ height: rowH, background: settings.shadeWeekends && isWeekend(i % 7) && day ? WEEKEND : undefined }}
                          >
                            {day ?? ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ),
        },
      ]
    }

    const weeks = buildMonth(settings.year, settings.month, settings.weekStart)
    const titleH = 84
    const headH = 34
    const notesH = settings.notes ? 120 : 0
    const gridH = H - titleH - headH - notesH - (settings.notes ? 16 : 0) - 4
    const rowH = Math.floor(gridH / weeks.length)
    const cell = { borderRight: `2px solid ${BORDER}`, borderBottom: `2px solid ${BORDER}` }

    return [
      {
        node: (
          <div className="flex h-full flex-col">
            <div className="flex items-end justify-between" style={{ height: titleH }}>
              <h1 className="text-[52px] font-black leading-none tracking-tight text-stone-900">
                {MONTH_NAMES[settings.month]} <span className="text-stone-400">{settings.year}</span>
              </h1>
              <span className="mb-1 text-[15px] font-bold text-stone-500">{ctx.teacherName}</span>
            </div>
            <div className="grid grid-cols-7" style={{ width: W, borderTop: `2px solid ${BORDER}`, borderLeft: `2px solid ${BORDER}` }}>
              {order.map((d) => (
                <div key={d} className="flex items-center justify-center bg-stone-200 text-[14px] font-black uppercase tracking-wide text-stone-900" style={{ height: headH, ...cell }}>
                  {WEEKDAYS[d]}
                </div>
              ))}
              {weeks.flat().map((day, i) => (
                <div
                  key={i}
                  className="px-1.5 pt-0.5 text-[20px] font-black text-stone-900"
                  style={{ height: rowH, ...cell, background: !day ? '#fafaf9' : settings.shadeWeekends && isWeekend(i % 7) ? WEEKEND : undefined }}
                >
                  {day ?? ''}
                </div>
              ))}
            </div>
            {settings.notes && (
              <div className="mt-4 rounded-lg px-2 pt-1" style={{ height: notesH, border: `2px solid ${BORDER}`, width: W }}>
                <div className="text-[13px] font-black uppercase tracking-wide text-stone-600">Notes</div>
              </div>
            )}
          </div>
        ),
      },
    ]
  },
}

export default calendar
