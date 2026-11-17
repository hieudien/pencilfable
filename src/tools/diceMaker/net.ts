/**
 * A cube net shaped like a cross: a row of four faces, one face above the second, one below it.
 *
 *            [4 top]
 *   [0 left][1 front][2 right][3 back]
 *            [5 bottom]
 */
export interface NetCell {
  face: number
  row: number
  col: number
}

export const NET_CELLS: NetCell[] = [
  { face: 0, row: 1, col: 0 },
  { face: 1, row: 1, col: 1 },
  { face: 2, row: 1, col: 2 },
  { face: 3, row: 1, col: 3 },
  { face: 4, row: 0, col: 1 },
  { face: 5, row: 2, col: 1 },
]

export type Side = 'top' | 'bottom' | 'left' | 'right'

export interface Tab {
  row: number
  col: number
  side: Side
}

/** The 7 glue flaps. Each one is glued to the matching outer edge of its neighbour when the cube is folded. */
export const TABS: Tab[] = [
  { row: 1, col: 3, side: 'right' }, // back → left
  { row: 1, col: 0, side: 'top' }, // left → top
  { row: 1, col: 2, side: 'top' }, // right → top
  { row: 1, col: 3, side: 'top' }, // back → top
  { row: 1, col: 0, side: 'bottom' }, // left → bottom
  { row: 1, col: 2, side: 'bottom' }, // right → bottom
  { row: 1, col: 3, side: 'bottom' }, // back → bottom
]

export const NET_ROWS = 3
export const NET_COLS = 4

const has = (row: number, col: number) => NET_CELLS.some((c) => c.row === row && c.col === col)

const NEIGHBOR: Record<Side, [number, number]> = { top: [-1, 0], bottom: [1, 0], left: [0, -1], right: [0, 1] }

/** True when the face has another face on that side (so it is a fold line, not a cut line). */
export function hasNeighbor(row: number, col: number, side: Side): boolean {
  const [dr, dc] = NEIGHBOR[side]
  return has(row + dr, col + dc)
}

export function outerEdges(): Tab[] {
  const out: Tab[] = []
  for (const c of NET_CELLS) for (const side of ['top', 'bottom', 'left', 'right'] as Side[]) if (!hasNeighbor(c.row, c.col, side)) out.push({ row: c.row, col: c.col, side })
  return out
}

/** Dice numbers per face so opposite faces always add up to 7 (left/right, front/back, top/bottom). */
export const DOT_FACE_NUMBERS = [1, 2, 6, 5, 3, 4]
