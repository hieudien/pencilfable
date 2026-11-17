export type GridSize = 5 | 8 | 10
export type CoordStyle = 'letters' | 'numbers'

export interface Ship {
  name: string
  length: number
}

/** The fleet each player hides. Ships sit in a straight line, across or down. */
export function fleetFor(size: GridSize): Ship[] {
  switch (size) {
    case 5:
      return [{ name: 'Big boat', length: 3 }, { name: 'Boat', length: 2 }, { name: 'Little boat', length: 2 }]
    case 8:
      return [{ name: 'Warship', length: 4 }, { name: 'Cruiser', length: 3 }, { name: 'Submarine', length: 3 }, { name: 'Little boat', length: 2 }]
    case 10:
      return [{ name: 'Carrier', length: 5 }, { name: 'Warship', length: 4 }, { name: 'Cruiser', length: 3 }, { name: 'Submarine', length: 3 }, { name: 'Little boat', length: 2 }]
  }
}

/** Label above column `i` (0-based): A, B, C… or 1, 2, 3… */
export function columnLabel(i: number, style: CoordStyle): string {
  return style === 'letters' ? String.fromCharCode(65 + i) : String(i + 1)
}

/** Rows are always numbered from 1. */
export function rowLabel(i: number): string {
  return String(i + 1)
}

/** Example of how to call a shot, e.g. "C4" or "3, 4". */
export function exampleShot(style: CoordStyle): string {
  return style === 'letters' ? 'C4' : '3, 4'
}

export function shipSquares(fleet: Ship[]): number {
  return fleet.reduce((sum, s) => sum + s.length, 0)
}
