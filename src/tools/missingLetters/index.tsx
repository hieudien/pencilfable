import { Type } from 'lucide-react'
import { Segmented, TextArea, Toggle } from '../../components/ui'
import { WorksheetHeader } from '../../components/Sheet'
import { contentHeight, contentWidth, HEADER_H } from '../../lib/paper'
import { chunk, parseList } from '../../lib/text'
import { skipped, tooFew, tooMany } from '../issues'
import type { PageSpec, ReadyTool } from '../types'
import { generateMissing, parseMissingWords, type Amount, type MissingWord } from './generate'

interface Settings {
  words: string
  amount: Amount
  vowelsOnly: boolean
  wordBank: boolean
}

const MAX_WORDS = 30
const ROW_H = 64
const INTRO_H = 34

function WordRow({ w, n, tile, rowH }: { w: MissingWord; n: number; tile: number; rowH: number }) {
  return (
    <div className="flex items-center gap-2" style={{ height: rowH }}>
      <span className="w-7 shrink-0 text-right text-[16px] font-black text-stone-500">{n}.</span>
      <div className="flex gap-1">
        {w.letters.map((ch, i) =>
          w.hidden[i] ? (
            <span key={i} className="inline-block rounded-md border-b-[4px] border-stone-800 bg-stone-100" style={{ width: tile, height: tile }} />
          ) : (
            <span key={i} className="flex items-center justify-center font-black" style={{ width: tile, height: tile, fontSize: tile * 0.7 }}>
              {ch}
            </span>
          ),
        )}
      </div>
    </div>
  )
}

const missingLetters: ReadyTool<Settings> = {
  id: 'missing-letters',
  slug: 'missing-letters',
  number: 6,
  name: 'Missing Letters',
  category: 'literacy',
  icon: Type,
  tagline: 'Kids fill in the letters that are hiding.',
  status: 'ready',
  defaultTitle: 'Find the Missing Letters',
  defaultSettings: { words: 'APPLE\nBANANA\nCHERRY\nGRAPE\nLEMON\nMANGO\nORANGE\nPEACH\nPEAR\nPLUM\nMELON\nBERRY', amount: 'some', vowelsOnly: false, wordBank: true },
  usesSeed: true,
  seedLabel: 'Hide different letters',
  answerKey: { label: 'Include answer key', description: 'Adds a page with the complete words.' },

  Controls({ settings, patch }) {
    return (
      <>
        <TextArea label="Your words" hint="One word per line, or separate them with commas." rows={8} value={settings.words} onChange={(v) => patch({ words: v })} />
        <Segmented
          label="How many letters are missing?"
          value={settings.amount}
          onChange={(v) => patch({ amount: v })}
          options={[{ value: 'one', label: 'Just one' }, { value: 'some', label: 'Some' }, { value: 'many', label: 'Lots' }]}
        />
        <Toggle label="Hide only vowels" description="A, E, I, O, U – a good start for beginners." checked={settings.vowelsOnly} onChange={(v) => patch({ vowelsOnly: v })} />
        <Toggle label="Show a word bank" description="Lists the full words at the bottom." checked={settings.wordBank} onChange={(v) => patch({ wordBank: v })} />
      </>
    )
  },

  check(settings) {
    const words = parseMissingWords(settings.words)
    const typed = parseList(settings.words).length
    return [
      ...tooFew(words.length, 1, 'word', 'Type one word per line, or separate words with commas. Words need at least 2 letters.'),
      ...skipped(typed - words.length, 'a word needs at least 2 letters, or it was a repeat'),
      ...tooMany(words.length, MAX_WORDS, 'word'),
    ]
  },

  pages(settings, ctx) {
    const words = parseMissingWords(settings.words).slice(0, MAX_WORDS)
    if (words.length === 0) return []
    const items = generateMissing(words, settings.amount, settings.vowelsOnly, ctx.seed)
    const W = contentWidth(ctx.paper)
    const H = contentHeight(ctx.paper)
    const longest = Math.max(...items.map((i) => i.letters.length))
    const tile = Math.max(22, Math.min(52, Math.floor((W / 2 - 60) / longest) - 4))

    const bankH = settings.wordBank ? 52 + Math.ceil(words.length / 4) * 28 : 0
    // Short lists get roomier rows so the page does not look empty.
    const fitRow = Math.floor((H - HEADER_H - INTRO_H - bankH - 8) / Math.ceil(items.length / 2))
    const rowH = fitRow >= ROW_H ? Math.min(100, fitRow) : ROW_H
    const firstRows = Math.floor((H - HEADER_H - INTRO_H - bankH) / rowH) * 2
    const laterRows = Math.floor(H / rowH) * 2
    const first = items.slice(0, Math.max(2, firstRows))
    const rest = items.slice(first.length)
    const groups = [first, ...chunk(rest, laterRows)]

    const bank = (
      <div className="mt-auto rounded-2xl border-2 border-stone-800 px-5 py-3">
        <div className="mb-1 text-center text-[15px] font-black uppercase tracking-widest">Word Bank</div>
        <ul className="grid grid-cols-4 gap-x-3 gap-y-1 text-[16px] font-bold">
          {[...words].sort().map((w) => <li key={w}>{w}</li>)}
        </ul>
      </div>
    )

    let n = 0
    const pages: PageSpec[] = groups.map((g, gi) => {
      const half = Math.ceil(g.length / 2)
      const cols = [g.slice(0, half), g.slice(half)]
      const start = n
      n += g.length
      return {
        node: (
          <div className="flex h-full flex-col">
            {gi === 0 && (
              <>
                <WorksheetHeader title={ctx.title} teacherName={ctx.teacherName} />
                <p className="mb-1 mt-2 text-center text-[16px] font-semibold text-stone-600" style={{ height: INTRO_H - 8 }}>
                  Write the missing letters to finish each word.
                </p>
              </>
            )}
            <div className="grid grid-cols-2 gap-x-4" style={{ width: W }}>
              {cols.map((col, ci) => (
                <div key={ci}>
                  {col.map((w, i) => <WordRow key={w.answer} w={w} n={start + ci * half + i + 1} tile={tile} rowH={rowH} />)}
                </div>
              ))}
            </div>
            {gi === 0 && settings.wordBank && bank}
          </div>
        ),
      }
    })

    if (ctx.includeAnswerKey) {
      pages.push({
        label: 'Answer Key',
        node: (
          <div className="flex h-full flex-col">
            <WorksheetHeader title={`${ctx.title} – Answer Key`} nameLine={false} />
            <ol className="mt-4 grid grid-cols-3 gap-x-6 gap-y-2 text-[19px] font-bold">
              {items.map((it, i) => (
                <li key={it.answer} className="flex gap-2">
                  <span className="w-7 text-right text-stone-500">{i + 1}.</span>
                  <span>{it.answer}</span>
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

export default missingLetters
