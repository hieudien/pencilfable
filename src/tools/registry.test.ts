import { describe, expect, it } from 'vitest'
import { parsePath } from '../lib/router'
import { READY_TOOLS, TOOLS } from './registry'

describe('tool catalogue', () => {
  it('has 20 ready tools with unique ids and addresses', () => {
    expect(READY_TOOLS).toHaveLength(20)
    expect(TOOLS).toHaveLength(20)
    expect(new Set(TOOLS.map((t) => t.id)).size).toBe(TOOLS.length)
    expect(new Set(TOOLS.map((t) => t.slug)).size).toBe(TOOLS.length)
  })

  it('never gives a tool an address that a marketing page already uses', () => {
    for (const t of TOOLS) expect(parsePath('/' + t.slug)).toEqual({ name: 'tool', slug: t.slug })
  })
})

