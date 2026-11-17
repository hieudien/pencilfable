import { describe, expect, it } from 'vitest'
import { READY_TOOLS } from '../tools/registry'
import { decodeShare, encodeShare, matchShape, readShareFromHash } from './share'

const defaults = { words: 'A\nB', size: 12, wordBank: true, items: [{ name: 'x', n: 1 }], tags: [] as string[] }

describe('share links', () => {
  it('round-trips settings, title and seed, including non-English text', () => {
    const settings = { words: 'Ünï cødé — 你好\nB', size: 15, wordBank: false, items: [{ name: 'y', n: 2 }], tags: ['a'] }
    const code = encodeShare({ settings, title: 'Tiêu đề', seed: 42 })
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(decodeShare(code, defaults, 'T')).toEqual({ settings, title: 'Tiêu đề', seed: 42 })
  })

  it('rejects garbage and unknown versions', () => {
    expect(decodeShare('%%%', defaults, 'T')).toBeNull()
    expect(decodeShare('e30', defaults, 'T')).toBeNull() // "{}"
    expect(decodeShare(btoa(JSON.stringify({ v: 2, s: {} })), defaults, 'T')).toBeNull()
  })

  it('ignores wrong types, unknown keys and oversize lists', () => {
    const evil = { words: 123, size: 'big', wordBank: 'yes', items: 'nope', extra: '<script>', tags: [1, 'b', { z: 1 }, null] }
    const out = matchShape(evil, defaults) as typeof defaults
    expect(out.words).toBe(defaults.words)
    expect(out.size).toBe(12)
    expect(out.wordBank).toBe(true)
    expect(out.items).toEqual(defaults.items)
    expect(out.tags).toEqual([1, 'b'])
    expect('extra' in out).toBe(false)
    expect(matchShape({ words: 'x'.repeat(50000) }, { words: '' })).toEqual({ words: 'x'.repeat(8000) })
    expect((matchShape({ items: Array.from({ length: 999 }, () => ({ name: 'a', n: 1 })) }, defaults) as typeof defaults).items).toHaveLength(200)
  })

  it('drops array items of the wrong shape instead of inventing them', () => {
    const out = matchShape({ items: [{ name: 'ok', n: 5 }, 'bad', 7] }, defaults) as typeof defaults
    expect(out.items).toEqual([{ name: 'ok', n: 5 }])
  })

  it('only accepts the #share= form', () => {
    const code = encodeShare({ settings: defaults, title: 'T' })
    expect(readShareFromHash('#share=' + code, defaults, 'T')?.title).toBe('T')
    expect(readShareFromHash('#other=' + code, defaults, 'T')).toBeNull()
    expect(readShareFromHash('', defaults, 'T')).toBeNull()
  })

  it('keeps a hostile link from changing the settings shape of any real tool', () => {
    for (const tool of READY_TOOLS) {
      const hostile = encodeShare({ settings: { words: 5, size: 'x', anything: [1, 2] }, title: 't'.repeat(500), seed: -1 })
      const got = decodeShare(hostile, tool.defaultSettings, tool.defaultTitle)
      expect(got).not.toBeNull()
      expect(Object.keys(got!.settings).sort()).toEqual(Object.keys(tool.defaultSettings).sort())
      expect(got!.title.length).toBeLessThanOrEqual(60)
      expect(got!.seed).toBeNull()
    }
  })
})
