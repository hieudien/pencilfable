import { describe, expect, it } from 'vitest'
import { letterCount, MAX_WORD_LENGTH, parseWords } from './generate'

describe('word guess', () => {
  it('reads words with optional clues', () => {
    const words = parseWords('elephant | a very big animal\nice  cream\n\n  \nsun | ')
    expect(words.map((w) => w.chars.join(''))).toEqual(['ELEPHANT', 'ICE CREAM', 'SUN'])
    expect(words[0].hint).toBe('a very big animal')
    expect(words[1].hint).toBe('')
  })

  it('counts letters without the spaces', () => {
    expect(letterCount(parseWords('ice cream')[0])).toBe(8)
  })

  it('skips words that are too long to fit the blanks', () => {
    expect(parseWords('x'.repeat(MAX_WORD_LENGTH + 1))).toHaveLength(0)
    expect(parseWords('x'.repeat(MAX_WORD_LENGTH))).toHaveLength(1)
  })

  it('strips punctuation and keeps accented letters', () => {
    expect(parseWords("don't! élève")[0].chars.join('')).toBe('DONT ÉLÈVE')
  })

  it('keeps a pipe inside the clue', () => {
    expect(parseWords('cat | small | furry')[0].hint).toBe('small | furry')
  })
})
