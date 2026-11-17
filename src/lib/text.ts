/** Split a textarea into clean, non-empty items (one per line; commas also separate). */
export function parseList(raw: string, opts: { splitCommas?: boolean; unique?: boolean } = {}): string[] {
  const { splitCommas = true, unique = true } = opts
  const parts = raw.split(splitCommas ? /[\n,;]+/ : /\n+/).map((s) => s.trim()).filter(Boolean)
  return unique ? Array.from(new Set(parts)) : parts
}

export function chunk<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function toInt(v: unknown, fallback: number): number {
  const n = typeof v === 'number' ? v : parseInt(String(v), 10)
  return Number.isFinite(n) ? n : fallback
}
