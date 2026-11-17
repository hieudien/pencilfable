import {
  Anchor, Apple, Bell, Bird, Bug, Cat, Cloud, Crown, Dog, Fish, Flower2, Gem, Gift, Heart, KeyRound, Leaf,
  Moon, Music, Rabbit, Rocket, Smile, Snowflake, Star, Sun, Umbrella, Zap, type LucideIcon,
} from 'lucide-react'
import { Segmented, TextArea } from '../../components/ui'
import { WorksheetHeader } from '../../components/Sheet'
import { contentHeight, contentWidth, HEADER_H } from '../../lib/paper'
import type { Issue, PageSpec, ReadyTool } from '../types'
import { ALPHABET, layoutMessage, makeCipher, MAX_MESSAGE, normalizeMessage, type CodeStyle } from './generate'

interface Settings {
  message: string
  style: CodeStyle
}

const ICONS: LucideIcon[] = [
  Star, Heart, Moon, Sun, Cloud, Flower2, Leaf, Bell, KeyRound, Gift, Anchor, Apple, Bird,
  Bug, Cat, Dog, Fish, Rabbit, Snowflake, Umbrella, Zap, Crown, Gem, Music, Smile, Rocket,
]
const COLORS = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#0891b2']

function Glyph({ style, code, size }: { style: CodeStyle; code: number; size: number }) {
  if (style === 'symbols') {
    const Icon = ICONS[code]
    return <Icon size={size} color={COLORS[code % COLORS.length]} strokeWidth={2.4} />
  }
  return <span className="font-black leading-none text-stone-900" style={{ fontSize: size * 0.85 }}>{code}</span>
}

function Key({ code, style, width }: { code: number[]; style: CodeStyle; width: number }) {
  const cols = 13
  const cell = Math.floor(width / cols)
  return (
    <div className="grid rounded-2xl border-[3px] border-stone-800 bg-amber-50 p-1.5" style={{ gridTemplateColumns: `repeat(${cols}, ${cell - 1}px)`, width: width + 14 }}>
      {ALPHABET.map((letter, i) => (
        <div key={letter} className="flex flex-col items-center gap-0.5 py-1.5">
          <div className="flex items-center justify-center" style={{ height: 30 }}>
            <Glyph style={style} code={code[i]} size={26} />
          </div>
          <div className="w-[70%] border-t-2 border-stone-400 pt-0.5 text-center text-[17px] font-black text-stone-900">{letter}</div>
        </div>
      ))}
    </div>
  )
}

const secretCode: ReadyTool<Settings> = {
  id: 'secret-code',
  slug: 'secret-code',
  number: 10,
  name: 'Secret Code Breaker',
  category: 'math',
  icon: KeyRound,
  tagline: 'Kids use a code key to crack a hidden message.',
  status: 'ready',
  defaultTitle: 'Secret Code Breaker',
  defaultSettings: { message: 'GREAT JOB DETECTIVE! YOU CRACKED THE CODE', style: 'symbols' },
  usesSeed: true,
  seedLabel: 'New code',
  answerKey: { label: 'Include answer key', description: 'Adds a page with the decoded message.' },

  Controls({ settings, patch }) {
    return (
      <>
        <TextArea
          label="Secret message"
          hint={`Up to ${MAX_MESSAGE} characters. Letters get a code; numbers and punctuation stay as they are.`}
          rows={4}
          value={settings.message}
          onChange={(v) => patch({ message: v })}
        />
        <Segmented
          label="Code style"
          hint={{ symbols: 'Every letter is a little picture.', shuffled: 'Every letter is a mixed-up number.', ordered: 'A=1, B=2, C=3… Easiest for beginners.' }[settings.style]}
          value={settings.style}
          onChange={(v) => patch({ style: v })}
          options={[{ value: 'symbols', label: 'Pictures' }, { value: 'shuffled', label: 'Mixed numbers' }, { value: 'ordered', label: 'A=1' }]}
        />
      </>
    )
  },

  check(settings) {
    const typed = settings.message.trim().replace(/\s+/g, ' ')
    const clean = normalizeMessage(settings.message)
    if (clean.length === 0) return [{ level: 'error', message: 'Type a secret message for kids to decode.' }]
    const issues: Issue[] = []
    if (typed.length > MAX_MESSAGE) {
      issues.push({ level: 'warn', message: `Your message has ${typed.length} characters, but only the first ${MAX_MESSAGE} fit. The rest was cut off. Shorten the message to keep all of it.` })
    }
    if (!/[A-Z]/.test(clean)) issues.push({ level: 'warn', message: 'Your message has no letters, so there is nothing to decode. Numbers and punctuation are printed as they are.' })
    return issues
  },

  pages(settings, ctx) {
    const message = normalizeMessage(settings.message)
    if (!message) return []
    const code = makeCipher(settings.style, ctx.seed)
    const W = contentWidth(ctx.paper)
    const H = contentHeight(ctx.paper)
    const boxW = 44
    const perLine = Math.floor((W - 8) / (boxW + 4))
    const lines = layoutMessage(message, code, perLine)
    const keyW = Math.floor(W / 13) * 13 - 14
    const lineH = Math.min(96, Math.floor((H - HEADER_H - 170 - 70) / Math.max(1, lines.length)))

    const cell = (t: (typeof lines)[number][number], i: number) => {
      if (t.kind === 'space') return <div key={i} style={{ width: boxW * 0.6 }} />
      return (
        <div key={i} className="flex flex-col items-center justify-end" style={{ width: boxW, height: lineH - 10 }}>
          {t.kind === 'letter' ? (
            <>
              <div className="flex items-center justify-center" style={{ height: 34 }}>
                <Glyph style={settings.style} code={t.code} size={30} />
              </div>
              <div className="mt-1 w-full border-b-[3px] border-stone-800" style={{ height: 26 }} />
            </>
          ) : (
            <div className="text-[28px] font-black text-stone-900">{t.ch}</div>
          )}
        </div>
      )
    }

    const pages: PageSpec[] = [
      {
        node: (
          <div className="flex h-full flex-col">
            <WorksheetHeader title={ctx.title} teacherName={ctx.teacherName} />
            <p className="mb-2 mt-2 text-center text-[16px] font-semibold text-stone-600">Use the code key to find each letter. Write it on the line!</p>
            <div className="flex justify-center"><Key code={code} style={settings.style} width={keyW} /></div>
            <div className="mt-6 flex flex-col gap-0">
              {lines.map((line, li) => (
                <div key={li} className="flex items-end justify-center gap-1" style={{ height: lineH }}>
                  {line.map(cell)}
                </div>
              ))}
            </div>
          </div>
        ),
      },
    ]
    if (ctx.includeAnswerKey) {
      pages.push({
        label: 'Answer Key',
        node: (
          <div className="flex h-full flex-col">
            <WorksheetHeader title={`${ctx.title} – Answer Key`} nameLine={false} />
            <p className="mx-auto mt-6 max-w-[600px] text-center text-[30px] font-black leading-snug tracking-wide text-emerald-800">{message}</p>
            <div className="mt-8 flex justify-center"><Key code={code} style={settings.style} width={keyW} /></div>
          </div>
        ),
      })
    }
    return pages
  },
}

export default secretCode
