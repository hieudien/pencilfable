import { Anchor } from 'lucide-react'
import { Segmented } from '../../components/ui'
import { WorksheetHeader } from '../../components/Sheet'
import { contentHeight, contentWidth, HEADER_H } from '../../lib/paper'
import type { PageSpec, ReadyTool } from '../types'
import { columnLabel, exampleShot, fleetFor, rowLabel, type CoordStyle, type GridSize, type Ship } from './fleet'

interface Settings {
  size: GridSize
  coords: CoordStyle
}

function Grid({ n, cell, style }: { n: number; cell: number; style: CoordStyle }) {
  const label = 'flex items-center justify-center font-black text-stone-600'
  return (
    <div className="grid" style={{ gridTemplateColumns: `repeat(${n + 1}, ${cell}px)` }}>
      <div style={{ height: cell }} />
      {Array.from({ length: n }, (_, c) => (
        <div key={c} className={label} style={{ height: cell, fontSize: cell * 0.5 }}>{columnLabel(c, style)}</div>
      ))}
      {Array.from({ length: n }, (_, r) => (
        <div key={r} className="contents">
          <div className={label} style={{ height: cell, fontSize: cell * 0.5 }}>{rowLabel(r)}</div>
          {Array.from({ length: n }, (_, c) => (
            <div
              key={c}
              style={{
                height: cell,
                borderRight: '1.5px solid #78716c',
                borderBottom: '1.5px solid #78716c',
                borderTop: r === 0 ? '2.5px solid #1c1917' : undefined,
                borderLeft: c === 0 ? '2.5px solid #1c1917' : undefined,
                ...(r === n - 1 ? { borderBottom: '2.5px solid #1c1917' } : {}),
                ...(c === n - 1 ? { borderRight: '2.5px solid #1c1917' } : {}),
                background: '#f0f9ff',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function FleetList({ fleet, title, hint }: { fleet: Ship[]; title: string; hint: string }) {
  return (
    <div className="rounded-xl border-2 border-stone-300 px-3 py-2">
      <div className="text-[13px] font-black uppercase tracking-widest text-stone-500">{title}</div>
      <div className="mb-1.5 text-[13px] font-semibold text-stone-500">{hint}</div>
      <ul className="space-y-1.5">
        {fleet.map((s, i) => (
          <li key={i} className="flex items-center gap-2.5 text-[15px] font-bold text-stone-800">
            <span className="flex">
              {Array.from({ length: s.length }, (_, k) => (
                <span key={k} className="inline-block h-5 w-5 border-2 border-stone-800 bg-white" style={{ marginLeft: k ? -2 : 0 }} />
              ))}
            </span>
            {s.name} <span className="text-stone-400">({s.length})</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const seaBattle: ReadyTool<Settings> = {
  id: 'sea-battle',
  slug: 'sea-battle-game',
  number: 3,
  name: 'Sea Battle Game',
  category: 'puzzles',
  icon: Anchor,
  tagline: 'A two-player hide-and-find game. Just a printout and a pencil!',
  status: 'ready',
  defaultTitle: 'Sea Battle',
  defaultSettings: { size: 8, coords: 'letters' },
  answerKey: { label: 'Print a sheet for each player', description: 'Two pages, one for Player 1 and one for Player 2.' },

  Controls({ settings, patch }) {
    const fleet = fleetFor(settings.size)
    return (
      <>
        <Segmented
          label="Grid size"
          hint={{ 5: 'Quick game for little ones (ages 5–6).', 8: 'A good game for most kids (ages 7–9).', 10: 'The full game for older kids.' }[settings.size]}
          value={settings.size}
          onChange={(v) => patch({ size: v })}
          options={[{ value: 5, label: '5×5' }, { value: 8, label: '8×8' }, { value: 10, label: '10×10' }]}
        />
        <Segmented
          label="Coordinates"
          hint={settings.coords === 'letters' ? 'Letters across, numbers down. Call a shot like "C4".' : 'Numbers across and down. Call a shot like "3, 4".'}
          value={settings.coords}
          onChange={(v) => patch({ coords: v })}
          options={[{ value: 'letters', label: 'Letters + numbers' }, { value: 'numbers', label: 'Numbers only' }]}
        />
        <div className="rounded-xl bg-stone-50 p-3 text-sm text-stone-600">
          <b className="text-stone-800">Each player hides {fleet.length} ships.</b> Ships go in a straight line, across or down, and must not overlap.
          <br />
          <b className="text-stone-800">How to play:</b> take turns calling a square, like &ldquo;{exampleShot(settings.coords)}&rdquo;. Your opponent says &ldquo;Hit!&rdquo; or &ldquo;Miss!&rdquo; and tells you when a ship is sunk. Sink every ship to win.
        </div>
      </>
    )
  },

  pages(settings, ctx) {
    const n = settings.size
    const fleet = fleetFor(n)
    const W = contentWidth(ctx.paper)
    const H = contentHeight(ctx.paper)
    const titleH = 34
    const rulesH = 64
    const availH = H - HEADER_H - rulesH - 14
    const cell = Math.floor(Math.min((availH - titleH * 2 - 24) / 2 / (n + 1), (W * 0.55) / (n + 1), 62))
    const gridW = cell * (n + 1)
    const sideW = W - gridW - 22

    const sheet = (player: number): PageSpec => ({
      label: `Player ${player}`,
      node: (
        <div className="flex h-full flex-col">
          <WorksheetHeader title={ctx.title} teacherName={ctx.teacherName} />
          <div className="mb-2 mt-2 flex items-center gap-3 rounded-xl bg-sky-50 px-3 py-1.5 text-[14px] font-semibold leading-snug text-stone-700" style={{ height: rulesH - 8 }}>
            <span className="shrink-0 rounded-full bg-sky-600 px-3 py-0.5 text-[13px] font-black uppercase tracking-wide text-white">Player {player}</span>
            <span>
              Hide your ships on <b>My Fleet</b>. Take turns calling a square, like &ldquo;{exampleShot(settings.coords)}&rdquo;. Mark <b>✕</b> for a hit and <b>○</b> for a miss on <b>Enemy Waters</b>.
            </span>
          </div>

          <div className="flex gap-[22px]" style={{ height: titleH + gridW }}>
            <div>
              <div className="font-black uppercase tracking-widest text-stone-800" style={{ height: titleH, fontSize: 17, lineHeight: `${titleH}px` }}>Enemy Waters <span className="text-[13px] font-bold normal-case tracking-normal text-stone-500">· mark your shots</span></div>
              <Grid n={n} cell={cell} style={settings.coords} />
            </div>
            <div style={{ width: sideW }} className="pt-[34px]">
              <FleetList fleet={fleet} title="Enemy fleet" hint="Cross out a ship when you sink it." />
            </div>
          </div>

          <div className="mt-[10px] flex gap-[22px]" style={{ height: titleH + gridW }}>
            <div>
              <div className="font-black uppercase tracking-widest text-stone-800" style={{ height: titleH, fontSize: 17, lineHeight: `${titleH}px` }}>My Fleet <span className="text-[13px] font-bold normal-case tracking-normal text-stone-500">· draw your ships</span></div>
              <Grid n={n} cell={cell} style={settings.coords} />
            </div>
            <div style={{ width: sideW }} className="pt-[34px]">
              <FleetList fleet={fleet} title="My ships" hint="Hide each one in a straight line." />
            </div>
          </div>
        </div>
      ),
    })

    return ctx.includeAnswerKey ? [sheet(1), sheet(2)] : [sheet(1)]
  },
}

export default seaBattle
