export interface GuessWord {
  /** Letters of the word; a space stays a space (for phrases like "ice cream") */
  chars: string[]
  hint: string
}

export const MAX_WORD_LENGTH = 16

/** One word per line. Add a clue after a | : `elephant | a very big animal`. */
export function parseWords(raw: string): GuessWord[] {
  const out: GuessWord[] = []
  for (const line of raw.split('\n')) {
    const [wordPart, ...rest] = line.split('|')
    const word = (wordPart ?? '')
      .normalize('NFC')
      .toLocaleUpperCase()
      .replace(/[^\p{L}\p{N} ]/gu, '')
      .replace(/\s+/g, ' ')
      .trim()
    const chars = Array.from(word)
    if (chars.filter((c) => c !== ' ').length === 0 || chars.length > MAX_WORD_LENGTH) continue
    out.push({ chars, hint: rest.join('|').trim() })
  }
  return out
}

export function letterCount(w: GuessWord): number {
  return w.chars.filter((c) => c !== ' ').length
}
