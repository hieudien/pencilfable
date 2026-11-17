import { describe, expect, it } from 'vitest'
import { buildChain, duplicateAnswers, parseQA } from './generate'

const items = parseQA('2 + 3 | 5\n4 + 4 | 8\n6 - 1 | 5\n10 - 3 | 7\n3 × 3 | 9\nbad line\n | nothing')

describe('I have… who has?', () => {
  it('reads question | answer lines', () => {
    expect(items).toHaveLength(5)
    expect(items[0]).toEqual({ q: '2 + 3', a: '5' })
  })

  it('links the cards into one closed loop', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const cards = buildChain(items, seed)
      expect(cards).toHaveLength(5)
      // the question on card k is answered by the answer on card k+1 (and the last one wraps to the first)
      cards.forEach((c, k) => {
        const next = cards[(k + 1) % cards.length]
        const question = items.find((it) => it.q === c.who)!
        expect(question.a).toBe(next.have)
      })
      // each question is asked exactly once
      expect(new Set(cards.map((c) => c.who)).size).toBe(5)
      expect(cards.filter((c) => c.start)).toHaveLength(1)
      expect(cards[0].start).toBe(true)
    }
  })

  it('keeps cards correct even when two questions share an answer', () => {
    const cards = buildChain(items, 3) // "2 + 3" and "6 - 1" are both 5
    const asked = cards.map((c) => c.who).sort()
    expect(asked).toEqual(items.map((i) => i.q).sort())
  })

  it('spots answers that two cards would share', () => {
    expect(duplicateAnswers(items)).toEqual(['5'])
    expect(duplicateAnswers(parseQA('a | 1\nb | 2\nc | 3'))).toEqual([])
    expect(duplicateAnswers(parseQA('a | Cat\nb | cat'))).toEqual(['cat'])
  })

  it('is deterministic for the same seed', () => {
    expect(buildChain(items, 8)).toEqual(buildChain(items, 8))
  })
})
