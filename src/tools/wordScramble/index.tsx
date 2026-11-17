import { Shuffle } from 'lucide-react'
import { TextArea, Toggle } from '../../components/ui'
import { WorksheetHeader } from '../../components/Sheet'
import { contentHeight, contentWidth, HEADER_H } from '../../lib/paper'
import { chunk, parseList } from '../../lib/text'
import { skipped, tooFew, tooMany } from '../issues'
import type { PageSpec, ReadyTool } from '../types'
import { generateScramble, parseScrambleWords, type ScrambleItem } from './generate'

interface Settings {
  words: string
  firstLetterHint: boolean
  wordBank: boolean
}

const MAX_WORDS = 30
const ROW_H = 68
const INTRO_H = 34

function Row({ item, n, tile, hint }: { item: ScrambleItem; n: number; tile: number; hint: boolean }) {
  return (
    <div className="flex items-center gap-3" style={{ height: ROW_H }}>
      <span className="w-8 shrink-0 text-right text-[18px] font-black text-stone-500">{n}.</span>
      <div className="flex shrink-0 gap-1.5">
        {item.scrambled.map((ch, i) => (
          <span
            key={i}
            className="flex items-center justify-center rounded-lg border-2 border-stone-800 font-black"
            style={{ width: tile, height: tile, fontSize: tile * 0.58, background: hint && i === 0 ? '#fde68a' : '#fff' }}
          >
            {ch}
          </span>
        ))}
      </div>
      <span className="mb-[-8px] h-8 min-w-[90px] flex-1 border-b-[3px] border-stone-800" />
    </div>
  )
}

const wordScramble: ReadyTool<Settings> = {
  id: 'word-scramble',
  slug: 'word-scramble',
  number: 4,
  name: 'Word Scramble',
  category: 'literacy',
  icon: Shuffle,
  tagline: 'Kids unscramble the letters to find the word.',
  status: 'ready',
  defaultTitle: 'Word Scramble',
  defaultSettings: { words: 'SCHOOL\nPENCIL\nTEACHER\nBOOK\nDESK\nCLASS\nREADING\nLESSON', firstLetterHint: false, wordBank: false },
  usesSeed: true,
  seedLabel: 'Scramble again',
  answerKey: { label: 'Include answer key', description: 'Adds a page with the correct words.' },

  Controls({ settings, patch }) {
    return (
      <>
        <TextArea label="Your words" hint="One word per line, or separate them with commas." rows={8} value={settings.words} onChange={(v) => patch({ words: v })} />
        <Toggle label="Give a hint" description="The first letter is already in the right place (shown in yellow)." checked={settings.firstLetterHint} onChange={(v) => patch({ firstLetterHint: v })} />
        <Toggle label="Show a word bank" description="Lists the answers at the bottom so kids can choose." checked={settings.wordBank} onChange={(v) => patch({ wordBank: v })} />
      </>
    )
  },

  check(settings) {
    const words = parseScrambleWords(settings.words)
    const typed = parseList(settings.words).length
    return [
      ...tooFew(words.length, 1, 'word', 'Type one word per line, or separate words with commas. Words need at least 2 letters.'),
      ...skipped(typed - words.length, 'a word needs at least 2 letters, or it was a repeat'),
      ...tooMany(words.length, MAX_WORDS, 'word'),
    ]
  },

  pages(settings, ctx) {
    const words = parseScrambleWords(settings.words).slice(0, MAX_WORDS)
    if (words.length === 0) return []
    const items = generateScramble(words, settings.firstLetterHint, ctx.seed)
    const longest = Math.max(...items.map((i) => i.scrambled.length))
    const W = contentWidth(ctx.paper)
    const tile = Math.max(26, Math.min(48, Math.floor((W * 0.7 - 40) / longest) - 6))
    const H = contentHeight(ctx.paper)

    const firstCap = Math.floor((H - HEADER_H - INTRO_H) / ROW_H)
    const laterCap = Math.floor(H / ROW_H)
    const groups: ScrambleItem[][] = []
    const first = items.slice(0, firstCap)
    groups.push(first)
    groups.push(...chunk(items.slice(firstCap), laterCap))

    const bank = (
      <div className="mt-3 rounded-2xl border-2 border-stone-800 px-5 py-3">
        <div className="mb-1 text-center text-[15px] font-black uppercase tracking-widest">Word Bank</div>
        <ul className="grid grid-cols-3 gap-x-4 gap-y-1 text-[17px] font-bold">
          {[...words].sort().map((w) => <li key={w}>{w}</li>)}
        </ul>
      </div>
    )
    const bankH = 52 + Math.ceil(words.length / 3) * 27
    const last = groups[groups.length - 1]
    const usedLast = last.length * ROW_H + (groups.length === 1 ? HEADER_H + INTRO_H : 0)
    const bankFitsOnLast = settings.wordBank && H - usedLast >= bankH + 12

    const pages: PageSpec[] = groups.map((g, gi) => {
      let n = gi === 0 ? 0 : firstCap + (gi - 1) * laterCap
      return {
        node: (
          <div className="flex h-full flex-col">
            {gi === 0 && (
              <>
                <WorksheetHeader title={ctx.title} teacherName={ctx.teacherName} />
                <p className="mb-1 mt-2 text-center text-[16px] font-semibold text-stone-600" style={{ height: INTRO_H - 8 }}>
                  Unscramble the letters. Write each word on the line.
                </p>
              </>
            )}
            {g.map((it) => <Row key={it.answer} item={it} n={++n} tile={tile} hint={settings.firstLetterHint} />)}
            {bankFitsOnLast && gi === groups.length - 1 && bank}
          </div>
        ),
      }
    })
    if (settings.wordBank && !bankFitsOnLast) pages.push({ node: <div className="pt-6">{bank}</div> })

    if (ctx.includeAnswerKey) {
      pages.push({
        label: 'Answer Key',
        node: (
          <div className="flex h-full flex-col">
            <WorksheetHeader title={`${ctx.title} – Answer Key`} nameLine={false} />
            <ol className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-[20px] font-bold">
              {items.map((it, i) => (
                <li key={it.answer} className="flex gap-3">
                  <span className="w-8 text-right text-stone-500">{i + 1}.</span>
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

export default wordScramble
