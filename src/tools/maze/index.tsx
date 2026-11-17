import { Route } from 'lucide-react'
import { Segmented } from '../../components/ui'
import { WorksheetHeader } from '../../components/Sheet'
import { contentHeight, contentWidth, HEADER_H } from '../../lib/paper'
import type { PageSpec, ReadyTool } from '../types'
import { generateMaze, MAZE_LEVELS, type Maze, type MazeLevel } from './generate'

interface Settings {
  level: MazeLevel
}

const PAD = 46 // room above/below the maze for the START / FINISH signs
const GREEN = '#059669'
const ORANGE = '#ea580c'

function MazeDrawing({ maze, px, stroke, showSolution }: { maze: Maze; px: number; stroke: number; showSolution?: boolean }) {
  const { rows, cols } = maze
  const s = Math.floor(px / cols)
  const ox = 6
  const oy = PAD
  const W = cols * s + ox * 2
  const H = rows * s + PAD * 2
  const X = (c: number) => ox + c * s
  const Y = (r: number) => oy + r * s

  let d = `M${X(0)} ${Y(0)}V${Y(rows)}` // left wall
  d += `M${X(cols)} ${Y(0)}V${Y(rows)}` // right wall
  d += `M${X(1)} ${Y(0)}H${X(cols)}` // top wall, with a gap above the first cell
  d += `M${X(0)} ${Y(rows)}H${X(cols - 1)}` // bottom wall, with a gap below the last cell
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (c < cols - 1 && !maze.rightOpen[r][c]) d += `M${X(c + 1)} ${Y(r)}V${Y(r + 1)}`
      if (r < rows - 1 && !maze.downOpen[r][c]) d += `M${X(c)} ${Y(r + 1)}H${X(c + 1)}`
    }
  }

  const arrow = (cx: number, top: number) => `${cx - 11},${top} ${cx + 11},${top} ${cx},${top + 22}`
  const startX = X(0) + s / 2
  const endX = X(cols - 1) + s / 2

  const route = maze.solution.map(([r, c]) => `${X(c) + s / 2},${Y(r) + s / 2}`)
  const routeFull = [`${startX},${Y(0)}`, ...route, `${endX},${Y(rows)}`].join(' ')

  return (
    <div className="relative mx-auto" style={{ width: W, height: H }}>
      <div className="absolute left-0 top-0 rounded-md px-2 py-0.5 text-[15px] font-black tracking-widest text-white" style={{ background: GREEN }}>
        START
      </div>
      <div className="absolute bottom-0 right-0 rounded-md px-2 py-0.5 text-[15px] font-black tracking-widest text-white" style={{ background: ORANGE }}>
        FINISH
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block">
        <polygon points={arrow(startX, PAD - 26)} fill={GREEN} />
        <polygon points={arrow(endX, Y(rows) + 4)} fill={ORANGE} />
        {showSolution && (
          <polyline
            points={routeFull}
            fill="none"
            stroke="#ef4444"
            strokeOpacity={0.8}
            strokeWidth={Math.max(4, s * 0.3)}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        <path d={d} fill="none" stroke="#1c1917" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

const maze: ReadyTool<Settings> = {
  id: 'maze',
  slug: 'maze',
  number: 12,
  name: 'Maze Maker',
  category: 'puzzles',
  icon: Route,
  tagline: 'A brand-new maze every time you press the button.',
  status: 'ready',
  defaultTitle: 'Maze Adventure',
  defaultSettings: { level: 'medium' },
  usesSeed: true,
  seedLabel: 'New maze',
  answerKey: { label: 'Include solution', description: 'Adds a page with the way through marked in red.' },

  Controls({ settings, patch }) {
    return (
      <Segmented
        label="How hard?"
        hint={{ easy: 'Big, simple maze for little hands.', medium: 'A good challenge for most kids.', hard: 'Lots of twists and turns.' }[settings.level]}
        value={settings.level}
        onChange={(v) => patch({ level: v })}
        options={[
          { value: 'easy', label: 'Easy' },
          { value: 'medium', label: 'Medium' },
          { value: 'hard', label: 'Hard' },
        ]}
      />
    )
  },

  pages(settings, ctx) {
    const m = generateMaze(settings.level, ctx.seed)
    const stroke = MAZE_LEVELS[settings.level].stroke
    const avail = contentHeight(ctx.paper) - HEADER_H - 34 - PAD * 2
    const px = Math.min(contentWidth(ctx.paper) - 24, 640, avail)

    const pages: PageSpec[] = [
      {
        node: (
          <div className="flex h-full flex-col">
            <WorksheetHeader title={ctx.title} teacherName={ctx.teacherName} />
            <p className="mb-1 mt-2 text-center text-[16px] font-semibold text-stone-600">Start at the green arrow. Find your way to the orange arrow!</p>
            <div className="flex flex-1 items-center justify-center">
              <MazeDrawing maze={m} px={px} stroke={stroke} />
            </div>
          </div>
        ),
      },
    ]
    if (ctx.includeAnswerKey) {
      pages.push({
        label: 'Solution',
        node: (
          <div className="flex h-full flex-col">
            <WorksheetHeader title={`${ctx.title} – Solution`} nameLine={false} />
            <div className="mt-4">
              <MazeDrawing maze={m} px={Math.min(px, 560)} stroke={stroke} showSolution />
            </div>
          </div>
        ),
      })
    }
    return pages
  },
}

export default maze
