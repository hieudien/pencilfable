import { createRng, shuffle } from '../../lib/rng'

export type GroupMode = 'count' | 'size'

/** How many groups you end up with. */
export function groupCount(students: number, mode: GroupMode, n: number): number {
  if (students === 0) return 0
  const g = mode === 'count' ? n : Math.ceil(students / Math.max(1, n))
  return Math.max(1, Math.min(g, students))
}

/** Shuffle everyone, then deal them out like cards so group sizes differ by at most one. */
export function makeGroups(names: string[], mode: GroupMode, n: number, seed: number): string[][] {
  const g = groupCount(names.length, mode, n)
  const groups: string[][] = Array.from({ length: g }, () => [])
  shuffle(createRng(seed), names).forEach((name, i) => groups[i % g].push(name))
  return groups
}

/** Angle (degrees, clockwise from the top) the wheel must turn so slice `index` ends under the pointer. */
export function landingRotation(index: number, total: number, currentRotation: number, jitter: number, extraTurns = 5): number {
  const slice = 360 / total
  const center = (index + 0.5) * slice
  const base = Math.ceil(currentRotation / 360) * 360 + 360 * extraTurns
  return base + (360 - center) + jitter * slice * 0.7
}

/** Which slice is under the pointer for a given wheel rotation (inverse of landingRotation). */
export function sliceUnderPointer(rotation: number, total: number): number {
  const slice = 360 / total
  const angle = (((360 - (rotation % 360)) % 360) + 360) % 360
  return Math.min(total - 1, Math.floor(angle / slice))
}
