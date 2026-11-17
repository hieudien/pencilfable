import { Lock, Users } from 'lucide-react'
import { Segmented, Stepper, TextArea } from '../../components/ui'
import { WorksheetHeader } from '../../components/Sheet'
import { contentHeight, contentWidth, HEADER_H } from '../../lib/paper'
import { parseList } from '../../lib/text'
import { tooFew, tooMany } from '../issues'
import type { ReadyTool } from '../types'
import { groupCount, makeGroups, type GroupMode } from './groups'
import { Wheel } from './Wheel'

interface Settings {
  names: string
  mode: GroupMode
  amount: number
}

const MAX_NAMES = 60
const HEAD_COLORS = ['#fca5a5', '#fdba74', '#fde047', '#86efac', '#7dd3fc', '#c4b5fd', '#f9a8d4', '#5eead4']
const DEFAULT_NAMES = ['Ava', 'Liam', 'Sofia', 'Noah', 'Mia', 'Ethan', 'Zoe', 'Lucas', 'Emma', 'Mason', 'Lily', 'Oliver', 'Ella', 'Jack'].join('\n')

const studentPicker: ReadyTool<Settings> = {
  id: 'student-picker',
  slug: 'student-picker',
  number: 18,
  name: 'Student Picker & Groups',
  category: 'classroom',
  icon: Users,
  tagline: 'Spin the wheel to pick a student, or make fair groups to print.',
  status: 'ready',
  defaultTitle: 'Our Groups',
  defaultSettings: { names: DEFAULT_NAMES, mode: 'count', amount: 4 },
  usesSeed: true,
  seedLabel: 'Shuffle groups',

  Controls({ settings, patch }) {
    const names = parseList(settings.names, { splitCommas: true }).slice(0, MAX_NAMES)
    const total = groupCount(names.length, settings.mode, settings.amount)
    return (
      <>
        <TextArea label="Student names" hint="One name per line, or separate with commas." rows={7} value={settings.names} onChange={(v) => patch({ names: v })} />
        <p className="-mt-2 flex items-center gap-1.5 text-sm text-stone-500">
          <Lock size={14} /> Names stay on this computer. They are never uploaded.
        </p>

        <div className="border-t border-stone-200 pt-4">
          <div className="mb-2 text-[15px] font-extrabold text-stone-800">Pick a student</div>
          <Wheel names={names} />
        </div>

        <div className="space-y-4 border-t border-stone-200 pt-4">
          <div className="text-[15px] font-extrabold text-stone-800">Make groups</div>
          <Segmented
            label="Split the class by"
            value={settings.mode}
            onChange={(v) => patch({ mode: v })}
            options={[{ value: 'count', label: 'Number of groups' }, { value: 'size', label: 'Students per group' }]}
          />
          <Stepper
            label={settings.mode === 'count' ? 'How many groups?' : 'How many in each group?'}
            hint={names.length > 0 ? `You will get ${total} ${total === 1 ? 'group' : 'groups'}.` : undefined}
            value={settings.amount}
            min={1}
            max={20}
            onChange={(v) => patch({ amount: v })}
          />
        </div>
      </>
    )
  },

  check(settings) {
    const count = parseList(settings.names, { splitCommas: true }).length
    return [
      ...tooFew(count, 2, 'name', 'Type one name per line, or separate names with commas. (The wheel works with 1 name, but groups need at least 2.)'),
      ...tooMany(count, MAX_NAMES, 'name'),
    ]
  },

  pages(settings, ctx) {
    const names = parseList(settings.names, { splitCommas: true }).slice(0, MAX_NAMES)
    if (names.length < 2) return []
    const groups = makeGroups(names, settings.mode, settings.amount, ctx.seed)
    const W = contentWidth(ctx.paper)
    const H = contentHeight(ctx.paper)
    const cols = groups.length <= 4 ? 2 : groups.length <= 9 ? 3 : 4
    const rows = Math.ceil(groups.length / cols)
    const gap = 14
    const boxW = Math.floor((W - gap * (cols - 1)) / cols)
    const availH = H - HEADER_H - 20
    const boxH = Math.min(380, Math.floor((availH - gap * (rows - 1)) / rows))
    const biggest = Math.max(...groups.map((g) => g.length))
    const headH = 40
    const lineH = Math.max(16, Math.min(34, Math.floor((boxH - headH - 16) / biggest)))
    const longest = Math.max(...names.map((n) => n.length), 4)
    const font = Math.max(11, Math.min(lineH * 0.66, 22, (boxW * 0.82) / (longest * 0.56)))

    return [
      {
        node: (
          <div className="flex h-full flex-col">
            <WorksheetHeader title={ctx.title} teacherName={ctx.teacherName} nameLine={false} />
            <div className="mt-2 grid content-start" style={{ gridTemplateColumns: `repeat(${cols}, ${boxW}px)`, gap }}>
              {groups.map((g, gi) => (
                <div key={gi} className="overflow-hidden rounded-xl border-[3px] border-stone-800" style={{ height: boxH }}>
                  <div className="flex items-center justify-center font-black text-stone-900" style={{ height: headH, background: HEAD_COLORS[gi % HEAD_COLORS.length], fontSize: 19 }}>
                    Group {gi + 1}
                  </div>
                  <ul className="px-3 py-1.5">
                    {g.map((name) => (
                      <li key={name} className="truncate font-bold leading-none" style={{ height: lineH, lineHeight: `${lineH}px`, fontSize: font }}>
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ),
      },
    ]
  },
}

export default studentPicker
