import { describe, expect, it } from 'vitest'
import { parsePath } from './router'

describe('router', () => {
  it('sends the home address to the landing page', () => {
    expect(parsePath('/')).toEqual({ name: 'landing' })
    expect(parsePath('')).toEqual({ name: 'landing' })
  })

  it('knows the marketing pages, ignoring slashes and case', () => {
    expect(parsePath('/donate')).toEqual({ name: 'donate' })
    expect(parsePath('/Donate/')).toEqual({ name: 'donate' })
    expect(parsePath('/privacy')).toEqual({ name: 'legal', kind: 'privacy' })
    expect(parsePath('/terms')).toEqual({ name: 'legal', kind: 'terms' })
  })

  it('treats any other address as a tool', () => {
    expect(parsePath('/word-search')).toEqual({ name: 'tool', slug: 'word-search' })
    expect(parsePath('/tools')).toEqual({ name: 'tool', slug: '' })
    expect(parsePath('/nonsense')).toEqual({ name: 'tool', slug: 'nonsense' })
  })
})
