import { createRng, shuffle } from '../../lib/rng'

export const FREE = '\u0000FREE'

export interface BingoSpec {
  items: string[]
  size: number
  freeSpace: boolean
  cards: number
  seed: number
}

export function cellsNeeded(size: number, freeSpace: boolean): number {
  return size * size - (hasFree(size, freeSpace) ? 1 : 0)
}

/** A free space only makes sense in the middle, so it needs an odd-sized card. */
export function hasFree(size: number, freeSpace: boolean): boolean {
  return freeSpace && size % 2 === 1
}

/** Every card is a different random pick/arrangement of the items. Returns row-major cell lists. */
export function generateBingoCards({ items, size, freeSpace, cards, seed }: BingoSpec): string[][] {
  const need = cellsNeeded(size, freeSpace)
  if (items.length < need) return []
  const rng = createRng(seed)
  const free = hasFree(size, freeSpace)
  const seen = new Set<string>()
  const out: string[][] = []
  let guard = 0
  while (out.length < cards) {
    const picked = shuffle(rng, items).slice(0, need)
    const cells = free ? [...picked.slice(0, (need >> 1)), FREE, ...picked.slice(need >> 1)] : picked
    const sig = cells.join('|')
    if (seen.has(sig) && guard++ < 500) continue
    seen.add(sig)
    out.push(cells)
  }
  return out
}
