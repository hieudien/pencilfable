import { describe, expect, it } from 'vitest'
import { ALPHABET, layoutMessage, makeCipher, normalizeMessage, type CodeStyle } from './generate'

describe('secret code', () => {
  it('cleans the message', () => {
    expect(normalizeMessage('  Café   ÉCOLE!  ')).toBe('CAFE ECOLE!')
  })

  for (const style of ['symbols', 'shuffled', 'ordered'] as CodeStyle[]) {
    it(`gives every letter its own code (${style})`, () => {
      for (let seed = 1; seed <= 20; seed++) {
        const c = makeCipher(style, seed)
        expect(c).toHaveLength(26)
        expect(new Set(c).size).toBe(26)
      }
    })
  }

  it('uses 0–25 for symbols and 1–26 for numbers', () => {
    expect(Math.min(...makeCipher('symbols', 1))).toBe(0)
    expect(Math.max(...makeCipher('symbols', 1))).toBe(25)
    expect(Math.min(...makeCipher('shuffled', 1))).toBe(1)
    expect(Math.max(...makeCipher('shuffled', 1))).toBe(26)
    expect(makeCipher('ordered', 9)[0]).toBe(1)
  })

  it('wraps by whole words and never exceeds the line width', () => {
    const code = makeCipher('ordered', 1)
    const msg = 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG'
    for (const perLine of [8, 12, 15]) {
      const lines = layoutMessage(msg, code, perLine)
      for (const l of lines) {
        expect(l.length).toBeLessThanOrEqual(perLine)
        expect(l[0].kind).not.toBe('space')
        expect(l[l.length - 1].kind).not.toBe('space')
      }
      const rebuilt = lines.map((l) => l.map((t) => (t.kind === 'space' ? ' ' : t.ch)).join('')).join(' ')
      expect(rebuilt).toBe(msg)
    }
  })

  it('splits a word that is longer than a line', () => {
    const lines = layoutMessage('SUPERCALIFRAGILISTIC', makeCipher('ordered', 1), 8)
    expect(lines.map((l) => l.length)).toEqual([8, 8, 4])
  })

  it('treats punctuation and numbers as plain boxes without a code', () => {
    const [line] = layoutMessage('HI 5!', makeCipher('ordered', 1), 10)
    expect(line.filter((t) => t.kind === 'other').map((t) => (t.kind === 'other' ? t.ch : ''))).toEqual(['5', '!'])
    expect(ALPHABET).toHaveLength(26)
  })
})
