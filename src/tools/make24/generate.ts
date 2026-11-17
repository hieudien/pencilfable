import { createRng, randInt, shuffle } from '../../lib/rng'
import { solutions } from './solver'

export type Target = 10 | 12 | 24
export type Level = 'easy' | 'medium' | 'hard'

export interface Card {
  /** The four numbers, in the order they are shown */
  numbers: number[]
  /** One way to reach the target (the shortest one found) */
  solution: string
  /** How many different ways exist: many = easier, few = trickier */
  ways: number
}

/** Biggest number on a card. */
export const MAX_NUMBER: Record<Level, number> = { easy: 9, medium: 9, hard: 13 }

/** How many different solutions a card has. Easy cards have lots of ways in; hard ones have only 1–3. */
export const WAYS_BAND: Record<Level, [number, number]> = {
  easy: [10, Infinity],
  medium: [4, 9],
  hard: [1, 3],
}

const MAX_TRIES = 3000

/**
 * Cards that can ALWAYS be solved (checked by trying every way), with a spread of difficulty.
 * If the wanted difficulty runs short for some target, any solvable card is used rather than failing.
 */
let lastCall: { key: string; cards: Card[] } | null = null

/** Same cards every time for the same inputs; remembers the last result so the page and its warnings share one search. */
export function generateCards(count: number, target: Target, level: Level, seed: number): Card[] {
  const key = `${count}|${target}|${level}|${seed}`
  if (lastCall?.key === key) return lastCall.cards
  const cards = buildCards(count, target, level, seed)
  lastCall = { key, cards }
  return cards
}

/** How many of these cards are easier or harder than the level that was asked for. */
export function offLevelCount(cards: Card[], level: Level): number {
  const [lo, hi] = WAYS_BAND[level]
  return cards.filter((c) => c.ways < lo || c.ways > hi).length
}

function buildCards(count: number, target: Target, level: Level, seed: number): Card[] {
  const rng = createRng(seed)
  const [lo, hi] = WAYS_BAND[level]
  const max = MAX_NUMBER[level]
  const seen = new Set<string>()
  const cards: Card[] = []
  const spare: Card[] = []

  for (let tries = 0; tries < MAX_TRIES && cards.length < count; tries++) {
    const numbers = Array.from({ length: 4 }, () => randInt(rng, 1, max))
    const key = [...numbers].sort((a, b) => a - b).join(',')
    if (seen.has(key)) continue
    seen.add(key)
    const found = solutions(numbers, target)
    if (found.length === 0) continue
    const card: Card = { numbers, solution: found[0], ways: found.length }
    if (found.length >= lo && found.length <= hi) cards.push(card)
    else if (spare.length < count) spare.push(card)
  }
  for (const card of spare) {
    if (cards.length >= count) break
    cards.push(card)
  }
  return shuffle(rng, cards).slice(0, count)
}
