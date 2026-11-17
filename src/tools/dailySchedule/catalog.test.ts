import { describe, expect, it } from 'vitest'
import { ACTIVITIES, byId, moveEntry } from './catalog'

describe('daily schedule', () => {
  it('has unique activity ids and explicit hex colors', () => {
    expect(new Set(ACTIVITIES.map((a) => a.id)).size).toBe(ACTIVITIES.length)
    for (const a of ACTIVITIES) expect(a.color).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('falls back to the first activity for an unknown id', () => {
    expect(byId('nope').id).toBe(ACTIVITIES[0].id)
  })

  it('moves items up and down without losing any', () => {
    expect(moveEntry(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c'])
    expect(moveEntry(['a', 'b', 'c'], 2, 1)).toEqual(['a', 'c', 'b'])
    expect(moveEntry(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c'])
    expect(moveEntry(['a', 'b', 'c'], 2, 3)).toEqual(['a', 'b', 'c'])
  })
})
