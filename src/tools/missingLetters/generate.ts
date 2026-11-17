import { createRng, shuffle, type Rng } from '../../lib/rng'
import { parseList } from '../../lib/text'

export type Amount = 'one' | 'some' | 'many'

export interface MissingWord {
  answer: string
  letters: string[]
  hidden: boolean[]
}

const VOWELS = new Set(Array.from('AEIOUÀÁÂÃÄÅÆÈÉÊËÌÍÎÏÒÓÔÕÖØÙÚÛÜ'))

export function parseMissingWords(raw: string): string[] {
  return parseList(raw)
    .map((w) => w.normalize('NFC').toLocaleUpperCase().replace(/[^\p{L}\p{N}]/gu, ''))
    .filter((w) => Array.from(w).length >= 2)
    .filter((w, i, all) => all.indexOf(w) === i)
}

/** How many letters to hide: one, about a third, or about half – always leaving at least one visible. */
export function hideCount(len: number, amount: Amount): number {
  const want = amount === 'one' ? 1 : amount === 'some' ? Math.round(len / 3) : Math.round(len / 2)
  return Math.max(1, Math.min(want, len - 1))
}

export function hideLetters(word: string, amount: Amount, vowelsOnly: boolean, rng: Rng): MissingWord {
  const letters = Array.from(word)
  const eligibleAll = letters.map((_, i) => i)
  const vowelIdx = eligibleAll.filter((i) => VOWELS.has(letters[i]))
  // Fall back to any letter if the word has no vowels (e.g. "GYM" still works, "TSK" too)
  const pool = vowelsOnly && vowelIdx.length > 0 ? vowelIdx : eligibleAll
  const n = Math.min(hideCount(letters.length, amount), pool.length, letters.length - 1)
  const chosen = new Set(shuffle(rng, pool).slice(0, n))
  return { answer: word, letters, hidden: letters.map((_, i) => chosen.has(i)) }
}

export function generateMissing(words: string[], amount: Amount, vowelsOnly: boolean, seed: number): MissingWord[] {
  const rng = createRng(seed)
  return words.map((w) => hideLetters(w, amount, vowelsOnly, rng))
}
