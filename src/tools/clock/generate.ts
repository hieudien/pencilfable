import { createRng, shuffle } from '../../lib/rng'

export type Precision = 'hour' | 'half' | 'quarter' | 'five'

export interface ClockTime {
  h: number // 1–12
  m: number // 0–59
}

const MINUTES: Record<Precision, number[]> = {
  hour: [0],
  half: [0, 30],
  quarter: [0, 15, 30, 45],
  five: Array.from({ length: 12 }, (_, i) => i * 5),
}

/** Different times on every clock; only repeats once every possible time has been used. */
export function generateTimes(count: number, precision: Precision, seed: number): ClockTime[] {
  const rng = createRng(seed)
  const all: ClockTime[] = []
  for (let h = 1; h <= 12; h++) for (const m of MINUTES[precision]) all.push({ h, m })
  const out: ClockTime[] = []
  while (out.length < count) out.push(...shuffle(rng, all))
  return out.slice(0, count)
}

/** Degrees clockwise from 12 o'clock. The hour hand creeps forward as the minutes pass. */
export function handAngles(t: ClockTime): { hour: number; minute: number } {
  return { hour: (t.h % 12) * 30 + t.m * 0.5, minute: t.m * 6 }
}

export function formatTime(t: ClockTime): string {
  return `${t.h}:${String(t.m).padStart(2, '0')}`
}
