import { describe, expect, it } from 'vitest'
import { generateScramble, parseScrambleWords } from './generate'

const sorted = (letters: string[]) => [...letters].sort().join('')

describe('word scramble', () => {
  it('cleans up the typed list', () => {
    expect(parseScrambleWords('school, Pencil\nschool\n a \nice-cream')).toEqual(['SCHOOL', 'PENCIL', 'ICECREAM'])
  })

  it('always uses exactly the same letters and never returns the original word', () => {
    const words = parseScrambleWords('school, pencil, teacher, book, desk, class, reading, lesson, ab, dd')
    for (let seed = 1; seed <= 40; seed++) {
      for (const item of generateScramble(words, false, seed)) {
        expect(sorted(item.scrambled)).toBe(sorted(Array.from(item.answer)))
        if (new Set(item.answer).size > 1) expect(item.scrambled.join('')).not.toBe(item.answer)
      }
    }
  })

  it('keeps the first letter when asked', () => {
    for (let seed = 1; seed <= 20; seed++) {
      for (const item of generateScramble(['SCHOOL', 'PENCIL'], true, seed)) {
        expect(item.scrambled[0]).toBe(item.answer[0])
        expect(item.scrambled.join('')).not.toBe(item.answer)
      }
    }
  })

  it('handles words made of one repeated letter without hanging', () => {
    expect(generateScramble(['AAA'], false, 1)[0].scrambled.join('')).toBe('AAA')
  })
})
