import { Check, Eye, Gamepad2, Heart, Keyboard, ListChecks, Lock, MousePointerClick, Printer, Sparkles, Zap } from 'lucide-react'
import { APP_NAME } from '../config'
import { Link, usePageMeta } from '../lib/router'
import { PageShell } from '../components/SiteChrome'
import { SheetThumb } from '../components/SheetThumb'
import { findToolBySlug, READY_TOOLS } from '../tools/registry'
import { CATEGORIES, type ReadyTool } from '../tools/types'

const HERO_TOOLS = ['word-search', 'four-numbers-challenge', 'maze']
  .map((s) => findToolBySlug(s))
  .filter((t): t is ReadyTool => t?.status === 'ready')

const FEATURES = [
  { icon: Zap, title: 'A fresh page in one click', text: 'Every puzzle is made on the spot. Press “New puzzle” as often as you like and never run out of worksheets.' },
  { icon: Gamepad2, title: 'Games, not just worksheets', text: 'Sea Battle, Four Numbers Challenge, Bingo, “I Have… Who Has?”, mystery pictures and more. Kids learn while they play.' },
  { icon: ListChecks, title: 'Answer keys included', text: 'One switch adds a page with every answer, so checking takes seconds.' },
  { icon: Printer, title: 'Print-ready, Letter or A4', text: 'The preview is exactly what comes out of your printer. Print it, or download a crisp PDF.' },
  { icon: Lock, title: 'Student names stay private', text: 'Class lists are saved only in your browser. Nothing is uploaded, and there is no account to create.' },
  { icon: MousePointerClick, title: 'Made for busy teachers', text: 'Big buttons, plain words and live preview. If you can type a list, you can make a worksheet.' },
]

const FAQ = [
  { q: 'Is it really free?', a: `Yes. All ${READY_TOOLS.length} tools are free for everyone, with no account, no ads and no limits.` },
  { q: 'Do I need to create an account?', a: 'No. Open a tool and start. There is nothing to sign up for.' },
  { q: 'How is it paid for, then?', a: `${APP_NAME} runs on voluntary donations. If it saves you time, you can leave a small donation, but you never have to.` },
  { q: 'Where is my class list stored?', a: 'Only in your own browser, on your own computer. We never receive it.' },
  { q: 'Which paper sizes work?', a: 'US Letter and A4. Switch in one click and the preview updates.' },
  { q: 'Can I use the pages in my classroom?', a: 'Yes. Print as many as you like for your classroom or your own children.' },
]

function ToolCard({ tool }: { tool: ReadyTool }) {
  const Icon = tool.icon
  return (
    <Link
      to={`/${tool.slug}`}
      className="group flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
        <Icon size={22} />
      </span>
      <span className="min-w-0">
        <span className="block text-[16px] font-extrabold leading-tight text-stone-900">{tool.name}</span>
        <span className="mt-0.5 block text-[14px] leading-snug text-stone-600">{tool.tagline}</span>
      </span>
    </Link>
  )
}

export default function Landing() {
  usePageMeta(
    `${APP_NAME} – Free printable games and worksheets for teachers and homeschool`,
    'Make word searches, mazes, math games, bingo cards and more in seconds. Print or download a clean PDF. Free for everyone, no account, nothing uploaded.',
  )

  return (
    <PageShell>
      {/* ---------- Hero ---------- */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 md:pt-16 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-extrabold text-emerald-800">
            <Sparkles size={16} /> {READY_TOOLS.length} tools · all free
          </p>
          <h1 className="mt-4 text-4xl font-black leading-[1.1] tracking-tight text-stone-900 sm:text-5xl lg:text-[3.4rem]">
            Free printable games and worksheets, <span className="text-emerald-600">made in seconds</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone-600">
            Word searches, mazes, math games, bingo and more for teachers and homeschool parents. Type your words, watch the page appear, then print it or save a PDF.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/tools" className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3.5 text-lg font-extrabold text-white shadow-md shadow-orange-900/20 hover:bg-orange-600">
              Start making worksheets
            </Link>
            <Link to="/#tools" className="inline-flex items-center justify-center rounded-xl border-2 border-stone-300 bg-white px-6 py-3.5 text-lg font-extrabold text-stone-800 hover:border-emerald-400 hover:text-emerald-700">
              Browse all tools
            </Link>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[15px] font-bold text-stone-600">
            {['No sign-up', 'No ads', 'Nothing uploaded', 'US Letter & A4'].map((t) => (
              <li key={t} className="flex items-center gap-1.5"><Check size={18} className="text-emerald-600" /> {t}</li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto h-[360px] w-full max-w-[520px] sm:h-[440px]" aria-hidden>
          {HERO_TOOLS[0] && <SheetThumb tool={HERO_TOOLS[0]} width={230} className="absolute left-0 top-6 -rotate-6" />}
          {HERO_TOOLS[2] && <SheetThumb tool={HERO_TOOLS[2]} width={230} className="absolute right-0 top-0 rotate-6" />}
          {HERO_TOOLS[1] && <SheetThumb tool={HERO_TOOLS[1]} width={250} className="absolute left-1/2 top-16 -translate-x-1/2 sm:top-20" />}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-center text-3xl font-black text-stone-900">Three steps. No learning curve.</h2>
          <ol className="mt-9 grid gap-6 md:grid-cols-3">
            {[
              { icon: Keyboard, t: '1. Type your content', d: 'Your spelling words, questions or class list. One per line is all it takes.' },
              { icon: Eye, t: '2. Watch the page appear', d: 'The sheet updates live as you type. Not happy? Press “New puzzle”.' },
              { icon: Printer, t: '3. Print or download', d: 'One click gives you a clean PDF or sends it straight to your printer.' },
            ].map(({ icon: Icon, t, d }) => (
              <li key={t} className="rounded-2xl bg-stone-50 p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white"><Icon size={24} /></span>
                <h3 className="mt-4 text-xl font-extrabold text-stone-900">{t}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Tools ---------- */}
      <section id="tools" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-black text-stone-900">{READY_TOOLS.length} free tools, ready to print</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-lg text-stone-600">Pick one and start. No account needed.</p>
        {CATEGORIES.map((cat) => {
          const tools = READY_TOOLS.filter((t) => t.category === cat.id)
          if (tools.length === 0) return null
          return (
            <div key={cat.id} className="mt-10">
              <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-stone-500">{cat.label}</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((t) => <ToolCard key={t.id} tool={t} />)}
              </div>
            </div>
          )
        })}
      </section>

      {/* ---------- Why ---------- */}
      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-3xl font-black text-stone-900">Why teachers and parents like it</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-stone-200 p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700"><Icon size={22} /></span>
                <h3 className="mt-3 text-lg font-extrabold text-stone-900">{title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-stone-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Donate ---------- */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 p-8 text-center ring-1 ring-orange-200 sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600"><Heart size={28} fill="currentColor" /></span>
          <h2 className="mt-4 text-3xl font-black text-stone-900">Free for everyone, powered by donations</h2>
          <p className="mx-auto mt-3 max-w-xl text-[17px] leading-relaxed text-stone-600">
            {APP_NAME} has no ads and no paywall. If it saves you time, a small donation helps keep it online and lets us build more tools.
          </p>
          <Link to="/donate" className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 py-3.5 text-lg font-extrabold text-white shadow-md shadow-orange-900/20 hover:bg-orange-600">
            <Heart size={18} fill="currentColor" /> Support this site
          </Link>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-3xl font-black text-stone-900">Questions</h2>
          <div className="mt-8 divide-y divide-stone-200 rounded-2xl border border-stone-200">
            {FAQ.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-extrabold text-stone-900">
                  {f.q}
                  <span className="text-2xl font-black text-emerald-600 transition group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-2 text-[16px] leading-relaxed text-stone-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Final call ---------- */}
      <section className="bg-emerald-700">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6">
          <h2 className="text-3xl font-black text-white sm:text-4xl">Your next worksheet is a minute away</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/tools" className="rounded-xl bg-orange-500 px-6 py-3.5 text-lg font-extrabold text-white hover:bg-orange-600">Start making worksheets</Link>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
