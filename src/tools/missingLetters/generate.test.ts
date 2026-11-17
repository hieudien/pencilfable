import { describe, expect, it } from 'vitest'
import { generateMissing, hideCount, parseMissingWords } from './generate'

const words = parseMissingWords('apple, banana, cat, gym, school, it')

describe('missing letters', () => {
  it('always hides something and always leaves something to see', () => {
    for (const amount of ['one', 'some', 'many'] as const) {
      for (let seed = 1; seed <= 30; seed++) {
        for (const w of generateMissing(words, amount, false, seed)) {
          const hidden = w.hidden.filter(Boolean).length
          expect(hidden).toBeGreaterThanOrEqual(1)
          expect(hidden).toBeLessThan(w.letters.length)
        }
      }
    }
  })

  it('hides more letters as the amount grows', () => {
    expect(hideCount(9, 'one')).toBe(1)
    expect(hideCount(9, 'some')).toBe(3)
    expect(hideCount(10, 'many')).toBe(5)
    expect(hideCount(2, 'many')).toBe(1)
  })

  it('hides only vowels when asked (and only when the word has vowels)', () => {
    for (let seed = 1; seed <= 30; seed++) {
      for (const w of generateMissing(words, 'many', true, seed)) {
        if (!w.letters.some((l) => 'AEIOU'.includes(l))) continue
        w.letters.forEach((l, i) => w.hidden[i] && expect('AEIOU').toContain(l))
      }
    }
  })

  it('is deterministic for the same seed', () => {
    expect(generateMissing(words, 'some', false, 4)).toEqual(generateMissing(words, 'some', false, 4))
  })
})
