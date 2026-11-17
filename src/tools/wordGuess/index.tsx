import { Snowflake } from 'lucide-react'
import { Segmented, TextArea } from '../../components/ui'
import { WorksheetHeader } from '../../components/Sheet'
import { contentHeight, contentWidth, HEADER_H } from '../../lib/paper'
import { chunk } from '../../lib/text'
import { nonEmptyLines, skipped, tooFew, tooMany } from '../issues'
import type { PageSpec, ReadyTool } from '../types'
import { letterCount, MAX_WORD_LENGTH, parseWords, type GuessWord } from './generate'

interface Settings {
  words: string
  perPage: 2 | 4
}

const MAX_WORDS = 16
const DEFAULT_WORDS = ['elephant | a very big animal', 'pencil | you write with it', 'rainbow | colors in the sky', 'ice cream | a cold, sweet treat', 'teacher | works at a school', 'bicycle | it has two wheels', 'giraffe | it has a long neck', 'birthday | a day with cake'].join('\n')
const ALPHABET = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ')

/** A snowman to build: kids draw one part for every wrong guess, tracing the dotted guides. */
function SnowmanGuide({ size }: { size: number }) {
  const guide = { fill: 'none', stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '4 4' }
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" className="block">
      <line x1="8" y1="114" x2="92" y2="114" stroke="#1c1917" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="88" r="25" {...guide} />
      <circle cx="50" cy="53" r="19" {...guide} />
      <circle cx="50" cy="26" r="14" {...guide} />
    </svg>
  )
}

function Board({ word, n, w, h }: { word: GuessWord; n: number; w: number; h: number }) {
  const inner = w - 28
  const count = word.chars.length
  const gap = 5
  const box = Math.max(14, Math.min(32, Math.floor((inner - gap * (count - 1)) / count)))
  const guideSize = Math.min(h * 0.46, w * 0.46)
  return (
    <div className="flex flex-col rounded-2xl p-3.5" style={{ width: w, height: h, border: '3px solid #1c1917' }}>
      <div className="flex items-start gap-3">
        <SnowmanGuide size={guideSize} />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-black uppercase tracking-widest text-stone-400">Game {n}</div>
          <div className="text-[18px] font-black text-stone-900">{letterCount(word)} letters</div>
          {word.hint && <div className="mt-1 text-[15px] font-semibold leading-snug text-stone-600">Clue: {word.hint}</div>}
        </div>
      </div>
      <div className="mt-auto flex justify-center" style={{ gap }}>
        {word.chars.map((c, i) =>
          c === ' ' ? <span key={i} style={{ width: box * 0.6 }} /> : <span key={i} className="border-b-[4px] border-stone-900" style={{ width: box, height: box + 8 }} />,
        )}
      </div>
      <div className="mt-4 grid grid-cols-13 gap-y-1 text-center text-[15px] font-black text-stone-700" style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}>
        {ALPHABET.map((l) => <span key={l}>{l}</span>)}
      </div>
    </div>
  )
}

const wordGuess: ReadyTool<Settings> = {
  id: 'word-guess',
  slug: 'snowman-word-game',
  number: 6,
  name: 'Snowman Word Game',
  category: 'puzzles',
  icon: Snowflake,
  tagline: 'Printable word-guessing boards with a clue for each word.',
  status: 'ready',
  defaultTitle: 'Build the Snowman!',
  defaultSettings: { words: DEFAULT_WORDS, perPage: 4 },
  answerKey: { label: "Include teacher's word list", description: 'A page showing every word and clue, so you can host the game.' },

  Controls({ settings, patch }) {
    return (
      <>
        <TextArea
          label="Words to guess"
          hint={`One per line. Add a clue after a |, like: pencil | you write with it. Up to ${MAX_WORD_LENGTH} letters.`}
          rows={9}
          value={settings.words}
          onChange={(v) => patch({ words: v })}
        />
        <Segmented
          label="Boards per page"
          value={settings.perPage}
          onChange={(v) => patch({ perPage: v })}
          options={[{ value: 4, label: '4' }, { value: 2, label: '2 (bigger)' }]}
        />
        <p className="text-sm text-stone-500">How to play: one player picks a word from the list and secretly counts the blanks. The others guess letters. Each wrong guess adds a part to the snowman: bottom, middle, head, hat, face, arms. Guess the word before the snowman is finished!</p>
      </>
    )
  },

  check(settings) {
    const words = parseWords(settings.words)
    return [
      ...tooFew(words.length, 1, 'word', `Type one word per line, up to ${MAX_WORD_LENGTH} letters. Add a clue after a |, like: pencil | you write with it.`),
      ...skipped(nonEmptyLines(settings.words) - words.length, `it has no letters, or is longer than ${MAX_WORD_LENGTH} letters`),
      ...tooMany(words.length, MAX_WORDS, 'word'),
    ]
  },

  pages(settings, ctx) {
    const words = parseWords(settings.words).slice(0, MAX_WORDS)
    if (words.length === 0) return []
    const W = contentWidth(ctx.paper)
    const H = contentHeight(ctx.paper)
    const per = settings.perPage
    const cols = per === 4 ? 2 : 1
    const rows = per === 4 ? 2 : 2
    const gap = 14
    const w = Math.floor((W - gap * (cols - 1)) / cols)
    const h = Math.floor((H - HEADER_H - gap * (rows - 1) - 10) / rows)

    const pages: PageSpec[] = chunk(words, per).map((group, pi) => ({
      label: `Games ${pi * per + 1}–${pi * per + group.length}`,
      node: (
        <div className="flex h-full flex-col">
          <WorksheetHeader title={ctx.title} teacherName={ctx.teacherName} nameLine={false} />
          <div className="grid content-start" style={{ gridTemplateColumns: `repeat(${cols}, ${w}px)`, gap }}>
            {group.map((word, i) => <Board key={i} word={word} n={pi * per + i + 1} w={w} h={h} />)}
          </div>
        </div>
      ),
    }))

    if (ctx.includeAnswerKey) {
      pages.push({
        label: "Teacher's word list",
        node: (
          <div className="flex h-full flex-col">
            <WorksheetHeader title="Teacher's Word List" nameLine={false} />
            <ol className="mt-3 grid grid-cols-2 gap-x-8 gap-y-2 text-[20px] font-bold">
              {words.map((wd, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-8 text-right text-stone-400">{i + 1}.</span>
                  <span>
                    {wd.chars.join('')}
                    {wd.hint && <span className="block text-[14px] font-semibold text-stone-500">{wd.hint}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ),
      })
    }
    return pages
  },
}

export default wordGuess
