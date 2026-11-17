import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { createRng } from '../lib/rng'
import { PAPERS, type PaperId } from '../lib/paper'
import { READY_TOOLS } from './registry'
import type { ReadyTool, WorksheetContext } from './types'

/**
 * Smoke tests for EVERY tool. For each one we build the pages and render them to HTML:
 *  - with default settings, on both paper sizes, with/without answer key, over many seeds;
 *  - with awkward text typed into every text box (empty, huge, accents, emoji, symbols);
 *  - with every on/off switch flipped;
 *  - with EVERY button and stepper end the controls offer (captured automatically), alone and in random combinations.
 * A tool that throws, or prints "undefined" / "NaN" on the page, fails here.
 */

// Capture every choice the controls offer (segmented buttons, steppers) so we can try all of them.
const offered = vi.hoisted(() => [] as { options: unknown[]; onChange: (v: unknown) => void }[])
vi.mock('../components/ui', async (importOriginal) => {
  const real = await importOriginal<typeof import('../components/ui')>()
  return {
    ...real,
    Segmented: (p: { options: { value: unknown }[]; onChange: (v: unknown) => void }) => {
      offered.push({ options: p.options.map((o) => o.value), onChange: p.onChange })
      return null
    },
    Stepper: (p: { min: number; max: number; onChange: (v: unknown) => void }) => {
      offered.push({ options: [p.min, Math.round((p.min + p.max) / 2), p.max], onChange: p.onChange })
      return null
    },
  }
})

const papers: PaperId[] = ['letter', 'a4']

const ctxFor = (paper: PaperId, seed: number, includeAnswerKey: boolean): WorksheetContext => ({
  paper: PAPERS[paper],
  title: 'Test title',
  teacherName: 'Ms. Test',
  includeAnswerKey,
  seed,
})

const BAD = /undefined|NaN|\[object Object\]/

function renderPages(tool: ReadyTool, settings: object, ctx: WorksheetContext): string[] {
  return tool.pages(settings, ctx).map((p) => renderToStaticMarkup(createElement('div', null, p.node)))
}

function renderControls(tool: ReadyTool, settings: object, patch: (p: Record<string, unknown>) => void = () => {}) {
  return renderToStaticMarkup(createElement(tool.Controls, { settings, patch, ctx: ctxFor('letter', 1, true) }))
}

const NASTY_TEXT = [
  '',
  '   ',
  '\n\n\n',
  'a',
  'x'.repeat(400),
  Array.from({ length: 300 }, (_, i) => `word${i}`).join('\n'),
  'é ñ ü ß 日本語 🎉 <b>html</b> & "quotes" \'single\' | = -> \t tab',
  '0\n-1\nNaN\nInfinity',
  'a | b\nc | d\ne',
  ',,,;;;|||===',
]

/** Every (setting → value) a person can pick in this tool's controls. */
function collectChoices(tool: ReadyTool, settings: object): Map<string, unknown[]> {
  const found = new Map<string, unknown[]>()
  offered.length = 0
  const patches: Record<string, unknown>[] = []
  renderControls(tool, settings, (p) => patches.push(p))
  for (const choice of [...offered]) {
    for (const value of choice.options) choice.onChange(value) // the controls turn this into patch({ key: value })
  }
  for (const p of patches) {
    for (const [key, value] of Object.entries(p)) found.set(key, [...(found.get(key) ?? []), value])
  }
  return found
}

describe.each(READY_TOOLS.map((t) => [t.id, t] as const))('tool %s', (_id, tool) => {
  it('renders with its default settings on every paper size, seed and answer-key option', () => {
    for (const paper of papers) {
      for (const includeAnswerKey of [true, false]) {
        for (let seed = 1; seed <= 6; seed++) {
          const html = renderPages(tool, tool.defaultSettings, ctxFor(paper, seed, includeAnswerKey))
          expect(html.length, `${tool.id} produced no pages`).toBeGreaterThan(0)
          for (const h of html) expect(h).not.toMatch(BAD)
        }
      }
    }
  })

  it('shows its controls without crashing', () => {
    // (buttons are replaced by a recorder in these tests, so a controls panel made only of buttons renders empty)
    expect(renderControls(tool, tool.defaultSettings)).not.toMatch(BAD)
  })

  it('survives awkward text in every text box (empty, huge, accents, emoji, symbols)', () => {
    const settings = tool.defaultSettings as Record<string, unknown>
    // Only real text boxes (a list, a name, a message). Short single words are choices, covered further down.
    const isFreeText = (k: string) =>
      typeof settings[k] === 'string' &&
      (String(settings[k]).includes('\n') || String(settings[k]).length > 14 || /words|names|pairs|items|message|text|cards/i.test(k))
    for (const key of Object.keys(settings).filter(isFreeText)) {
      for (const text of NASTY_TEXT) {
        const mutated = { ...settings, [key]: text }
        for (const paper of papers) {
          expect(() => renderPages(tool, mutated, ctxFor(paper, 3, true)), `${tool.id}.${key} = ${JSON.stringify(text.slice(0, 20))}`).not.toThrow()
        }
        expect(() => renderControls(tool, mutated)).not.toThrow()
      }
    }
  })

  it('survives every on/off switch being flipped', () => {
    const settings = tool.defaultSettings as Record<string, unknown>
    for (const key of Object.keys(settings).filter((k) => typeof settings[k] === 'boolean')) {
      const mutated = { ...settings, [key]: !settings[key] }
      for (const paper of papers) expect(() => renderPages(tool, mutated, ctxFor(paper, 2, true))).not.toThrow()
    }
  })

  it('survives a title and teacher name that are empty or very long', () => {
    for (const title of ['', 'T'.repeat(200)]) {
      for (const teacherName of ['', 'N'.repeat(120)]) {
        expect(() => renderPages(tool, tool.defaultSettings, { ...ctxFor('a4', 4, true), title, teacherName })).not.toThrow()
      }
    }
  })

  it('works with EVERY button and stepper value the controls offer, alone and in random combinations', () => {
    const base = tool.defaultSettings as Record<string, unknown>
    const choices = collectChoices(tool, base)
    // (a tool with no buttons or steppers, e.g. only text boxes, has nothing to enumerate)
    let tried = 0

    // each single choice
    for (const [key, values] of choices) {
      for (const value of values) {
        for (const paper of papers) {
          for (const includeAnswerKey of [true, false]) {
            const settings = { ...base, [key]: value }
            const html = renderPages(tool, settings, ctxFor(paper, 7, includeAnswerKey))
            for (const h of html) expect(h, `${tool.id}.${key} = ${String(value)}`).not.toMatch(BAD)
            tried++
          }
        }
      }
    }

    // random mixtures of choices (a fixed seed keeps the test repeatable)
    const rng = createRng(2026)
    for (let i = 0; i < 40; i++) {
      const settings: Record<string, unknown> = { ...base }
      for (const [key, values] of choices) settings[key] = values[Math.floor(rng() * values.length)]
      const paper = papers[i % 2]
      expect(() => renderPages(tool, settings, ctxFor(paper, i + 1, i % 3 !== 0)), `${tool.id} ${JSON.stringify(settings).slice(0, 160)}`).not.toThrow()
      expect(() => renderControls(tool, settings)).not.toThrow()
      tried++
    }
    expect(tried).toBeGreaterThan(0)
  })

  it('is repeatable: the same seed gives the same page', () => {
    const a = renderPages(tool, tool.defaultSettings, ctxFor('letter', 11, true))
    const b = renderPages(tool, tool.defaultSettings, ctxFor('letter', 11, true))
    expect(a).toEqual(b)
  })
})

describe.each(READY_TOOLS.map((t) => [t.id, t] as const))('messages for %s', (_id, tool) => {
  const settings = tool.defaultSettings as Record<string, unknown>
  const isFreeText = (k: string) =>
    typeof settings[k] === 'string' &&
    (String(settings[k]).includes('\n') || String(settings[k]).length > 14 || /words|names|pairs|items|message|text|cards/i.test(k))

  it('explains in plain words whenever the input is too poor to make a page', () => {
    for (const key of Object.keys(settings).filter(isFreeText)) {
      for (const text of ['', '   ', '\n\n', '!!!', 'a']) {
        const mutated = { ...settings, [key]: text }
        const ctx = ctxFor('letter', 3, true)
        const pages = tool.pages(mutated, ctx)
        if (pages.length === 0) {
          const issues = tool.check?.(mutated, ctx) ?? []
          const error = issues.find((i) => i.level === 'error')
          expect(error, `${tool.id}.${key} = ${JSON.stringify(text)} makes no page but gives no error message`).toBeDefined()
          expect(error!.message.length).toBeGreaterThan(25) // says what is wrong AND what to do
          expect(error!.message).not.toMatch(BAD)
        }
      }
    }
  })

  it('never shows a message with broken text, and never says "error" without a way out', () => {
    for (const key of Object.keys(settings).filter(isFreeText)) {
      for (const text of NASTY_TEXT) {
        const ctx = ctxFor('a4', 5, true)
        for (const issue of tool.check?.({ ...settings, [key]: text }, ctx) ?? []) {
          expect(issue.message).not.toMatch(BAD)
          expect(issue.message.trim().length).toBeGreaterThan(20)
          expect(issue.message.trim()).toMatch(/[.!?)]$/)
        }
      }
    }
  })

  it('stays quiet when the default settings are fine', () => {
    expect(tool.check?.(tool.defaultSettings, ctxFor('letter', 1, true)) ?? []).toEqual([])
  })
})

describe('specific messages teachers will see', () => {
  const tool = (id: string) => READY_TOOLS.find((t) => t.id === id)! as ReadyTool
  const ctx = ctxFor('letter', 1, true)
  const messages = (id: string, patch: object) => {
    const t = tool(id)
    return (t.check?.({ ...(t.defaultSettings as object), ...patch }, ctx) ?? []).map((i) => `${i.level}: ${i.message}`)
  }

  it('word search names the words that did not fit and why', () => {
    const m = messages('word-search', { words: 'EXTRAORDINARILY\ncat', size: 10 })
    expect(m.join(' ')).toMatch(/Too long for a 10×10 puzzle.*EXTRAORDINARILY \(15 letters\).*bigger puzzle size/)
  })

  it('word search says when there are too many words', () => {
    const m = messages('word-search', { words: Array.from({ length: 40 }, (_, i) => `w${'a'.repeat(i % 5)}x${i}`).join('\n') })
    expect(m.join(' ')).toMatch(/You typed 40 words, but only the first 30 fit/)
  })

  it('bingo says exactly how many more items are needed', () => {
    expect(messages('bingo', { items: 'a\nb\nc', size: 5, freeSpace: true }).join(' ')).toMatch(/error: You have 3 items, but 5×5 cards need at least 24.*Add 21 more/)
  })

  it('"I have… who has?" warns about repeated answers and names them', () => {
    expect(messages('i-have-who-has', { items: '1 + 1 | 2\n3 - 1 | 2\n2 + 2 | 4' }).join(' ')).toMatch(/Some answers appear more than once \(2\)/)
  })

  it('matching tells you which lines were skipped and why', () => {
    expect(messages('matching', { pairs: 'dog | bark\ncat meow\ncow | moo' }).join(' ')).toMatch(/1 line was skipped because it has no \|/)
  })

  it('secret code tells you the message was cut', () => {
    expect(messages('secret-code', { message: 'A'.repeat(200) }).join(' ')).toMatch(/200 characters, but only the first 120 fit/)
  })

  it('dice maker says how many faces are blank', () => {
    expect(messages('dice-maker', { mode1: 'custom', words1: 'one\ntwo' }).join(' ')).toMatch(/only 2 of 6 faces filled in, so 4 faces are blank/)
  })

  it('four numbers reports when it cannot find enough puzzles of the chosen difficulty', () => {
    // Target 12 with only the hardest level has very few exact matches among these numbers
    const m = messages('four-numbers', { target: 12, level: 'hard', count: 12 })
    for (const line of m) expect(line).toMatch(/puzzles/)
  })
})
