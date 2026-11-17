import { createRng, shuffle } from '../../lib/rng'

export type CodeStyle = 'symbols' | 'shuffled' | 'ordered'

export const ALPHABET = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
export const MAX_MESSAGE = 120

/** Uppercase, accents removed (É → E), extra spaces collapsed. */
export function normalizeMessage(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_MESSAGE)
}

/**
 * code[i] belongs to letter i.
 *  - symbols:  a shuffled picture number 0–25 (which icon to draw)
 *  - shuffled: a shuffled number 1–26
 *  - ordered:  A=1, B=2 … Z=26
 */
export function makeCipher(style: CodeStyle, seed: number): number[] {
  const rng = createRng(seed)
  if (style === 'ordered') return ALPHABET.map((_, i) => i + 1)
  const perm = shuffle(rng, ALPHABET.map((_, i) => i))
  return style === 'symbols' ? perm : perm.map((n) => n + 1)
}

export type Token =
  | { kind: 'letter'; ch: string; code: number }
  | { kind: 'other'; ch: string }
  | { kind: 'space' }

/** Break the message into lines of at most `perLine` boxes, moving whole words to the next line. */
export function layoutMessage(message: string, code: number[], perLine: number): Token[][] {
  const lines: Token[][] = []
  let cur: Token[] = []
  const flush = () => {
    while (cur.length && cur[cur.length - 1].kind === 'space') cur.pop()
    if (cur.length) lines.push(cur)
    cur = []
  }
  for (const word of message.split(' ').filter(Boolean)) {
    const tokens: Token[] = Array.from(word).map((ch) => {
      const idx = ALPHABET.indexOf(ch)
      return idx >= 0 ? { kind: 'letter', ch, code: code[idx] } : { kind: 'other', ch }
    })
    // Words longer than a whole line are cut up so they still fit.
    for (let i = 0; i < tokens.length; i += perLine) {
      const piece = tokens.slice(i, i + perLine)
      const needed = cur.length + (cur.length ? 1 : 0) + piece.length
      if (needed > perLine) flush()
      if (cur.length) cur.push({ kind: 'space' })
      cur.push(...piece)
    }
  }
  flush()
  return lines
}
