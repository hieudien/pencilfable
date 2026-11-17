import { describe, expect, it } from 'vitest'
import { matchOrder, parsePairs } from './generate'

describe('matching pairs', () => {
  it('reads pairs with different separators and skips broken lines', () => {
    const pairs = parsePairs('dog | bark\ncat = meow\nno separator\ncow->moo\n | empty left\nbird |')
    expect(pairs).toEqual([
      { left: 'dog', right: 'bark' },
      { left: 'cat', right: 'meow' },
      { left: 'cow', right: 'moo' },
    ])
  })

  it('shuffles the right column so nothing is level with its partner', () => {
    for (let n = 2; n <= 12; n++) {
      for (let seed = 1; seed <= 20; seed++) {
        const order = matchOrder(n, seed)
        expect([...order].sort((a, b) => a - b)).toEqual(Array.from({ length: n }, (_, i) => i))
        order.forEach((v, i) => expect(v).not.toBe(i))
      }
    }
  })

  it('handles a single pair and is deterministic', () => {
    expect(matchOrder(1, 5)).toEqual([0])
    expect(matchOrder(8, 5)).toEqual(matchOrder(8, 5))
  })
})
