import { Component, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Check, Download, Link2, Loader2, Printer, Shuffle, SlidersHorizontal, Eye } from 'lucide-react'
import { APP_NAME, SITE_URL } from '../config'
import { downloadPdf, printNow, setPrintPaper } from '../lib/export'
import { PAPERS, type PaperId } from '../lib/paper'
import { randomSeed } from '../lib/rng'
import { usePageMeta } from '../lib/router'
import { encodeShare, MAX_SHARE_URL_LENGTH, readShareFromHash } from '../lib/share'
import { usePersistentState } from '../lib/storage'
import { TOOL_SEO } from '../seo/data'
import type { Issue, PageSpec, ReadyTool, WorksheetContext } from '../tools/types'
import { Sheet } from './Sheet'
import { ToolAbout } from './ToolAbout'
import { Button, Notice, Section, Segmented, TextInput, Toggle } from './ui'

interface Prefs {
  teacherName: string
  paper: PaperId
  /** Print a small "Made with …" line at the bottom of every sheet. On unless the teacher turns it off. */
  showCredit: boolean
}

const CREDIT_TEXT = `Made with ${APP_NAME} · free at ${SITE_URL.replace(/^https?:\/\//, '')}`

interface SavedTool<S> {
  settings: S
  title: string
  includeAnswerKey: boolean
}

class PreviewBoundary extends Component<{ children: ReactNode; resetKey: string }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false })
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="p-6">
          <Notice>Something went wrong while making this page. Try changing a setting, or press &ldquo;New puzzle&rdquo;.</Notice>
        </div>
      )
    }
    return this.props.children
  }
}

export function Workspace({ tool }: { tool: ReadyTool }) {
  const [prefs, patchPrefs] = usePersistentState<Prefs>('el:prefs', { teacherName: '', paper: 'letter', showCredit: true })
  const [saved, patchSaved] = usePersistentState<SavedTool<object>>(`el:tool:${tool.id}`, {
    settings: tool.defaultSettings,
    title: tool.defaultTitle,
    includeAnswerKey: true,
  })
  // A shared link ("…/word-search#share=…") opens with the sender's words and settings.
  const [incoming] = useState(() => readShareFromHash(window.location.hash, tool.defaultSettings, tool.defaultTitle))
  const [seed, setSeed] = useState(() => incoming?.seed ?? randomSeed())
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'long'>('idle')
  useEffect(() => {
    if (!incoming) return
    patchSaved({ settings: incoming.settings, title: incoming.title })
    window.history.replaceState(null, '', window.location.pathname)
  }, [incoming, patchSaved])
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [exporting, setExporting] = useState<{ done: number; total: number } | null>(null)
  const [exportError, setExportError] = useState(false)

  const paper = PAPERS[prefs.paper] ?? PAPERS.letter
  const settings = useMemo(() => ({ ...tool.defaultSettings, ...saved.settings }), [tool.defaultSettings, saved.settings])
  const ctx: WorksheetContext = useMemo(
    () => ({ paper, title: saved.title, teacherName: prefs.teacherName, includeAnswerKey: saved.includeAnswerKey, seed }),
    [paper, saved.title, prefs.teacherName, saved.includeAnswerKey, seed],
  )

  const { pages, crashed } = useMemo(() => {
    try {
      return { pages: tool.pages(settings, ctx), crashed: false }
    } catch (err) {
      console.error(err)
      return { pages: [] as PageSpec[], crashed: true }
    }
  }, [tool, settings, ctx])

  // What the teacher should know: input that cannot make a game, or that had to be trimmed.
  const issues: Issue[] = useMemo(() => {
    let found: Issue[] = []
    try {
      found = tool.check?.(settings, ctx) ?? []
    } catch (err) {
      console.error(err)
    }
    if (crashed) {
      found = [...found, { level: 'error', message: 'Something unexpected went wrong while making this page. Try changing a setting, or press the "New" button. If it keeps happening, please contact us.' }]
    } else if (pages.length === 0 && !found.some((i) => i.level === 'error')) {
      found = [...found, { level: 'error', message: 'There is not enough to make a page yet. Fill in the boxes on the left.' }]
    }
    return found
  }, [tool, settings, ctx, crashed, pages.length])

  const patchSettings = (p: Partial<typeof settings>) => patchSaved({ settings: { ...settings, ...p } })

  useEffect(() => setPrintPaper(paper), [paper])
  const seo = TOOL_SEO[tool.slug]
  usePageMeta(seo ? `${seo.title} | ${APP_NAME}` : `${tool.name} – ${APP_NAME}`, seo?.description ?? tool.tagline)

  async function onShare() {
    const code = encodeShare({ settings, title: saved.title, seed: tool.usesSeed ? seed : undefined })
    const url = `${window.location.origin}/${tool.slug}#share=${code}`
    if (url.length > MAX_SHARE_URL_LENGTH) {
      setShareState('long')
      return
    }
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt('Copy this link:', url) // clipboard blocked: let the person copy it by hand
    }
    setShareState('copied')
    setTimeout(() => setShareState('idle'), 2500)
  }

  const [printRoot] = useState(() => {
    const d = document.createElement('div')
    d.className = 'print-root'
    return d
  })
  useEffect(() => {
    document.body.appendChild(printRoot)
    return () => {
      document.body.removeChild(printRoot)
    }
  }, [printRoot])

  async function onDownload() {
    setExportError(false)
    setExporting({ done: 0, total: pages.length })
    try {
      await downloadPdf(printRoot, paper, saved.title || tool.name, (done, total) => setExporting({ done, total }))
    } catch (err) {
      console.error(err)
      setExportError(true)
    } finally {
      setExporting(null)
    }
  }

  const sheets = pages.map((p, i) => (
    <Sheet key={i} paper={paper} credit={prefs.showCredit === false ? undefined : CREDIT_TEXT}>
      {p.node}
    </Sheet>
  ))

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      {/* phone/tablet: switch between settings and paper */}
      <div className="flex gap-2 border-b border-stone-200 bg-white p-2 lg:hidden">
        <TabButton active={tab === 'edit'} onClick={() => setTab('edit')} icon={<SlidersHorizontal size={18} />}>Settings</TabButton>
        <TabButton active={tab === 'preview'} onClick={() => setTab('preview')} icon={<Eye size={18} />}>Preview</TabButton>
      </div>

      {/* ---- Controls ---- */}
      <section className={`${tab === 'edit' ? 'flex' : 'hidden'} min-h-0 flex-1 flex-col lg:w-[390px] lg:flex-none lg:border-r lg:border-stone-200 lg:flex`}>
        <div className="soft-scroll flex-1 space-y-4 overflow-y-auto p-4">
          <div>
            <h2 className="text-2xl font-black text-stone-900">{tool.name}</h2>
            <p className="text-[15px] text-stone-600">{tool.tagline}</p>
          </div>

          <Section title="1 · Your content">
            <tool.Controls settings={settings} patch={patchSettings} ctx={ctx} />
          </Section>

          <Section title="2 · Page">
            {!tool.hideTitle && <TextInput label="Worksheet title" value={saved.title} onChange={(v) => patchSaved({ title: v })} maxLength={60} />}
            <TextInput
              label="Teacher or class name"
              hint="Optional. Printed in the corner."
              value={prefs.teacherName}
              onChange={(v) => patchPrefs({ teacherName: v })}
              maxLength={40}
              placeholder="e.g. Ms. Rivera's Class"
            />
            <Segmented
              label="Paper size"
              value={prefs.paper}
              onChange={(v) => patchPrefs({ paper: v })}
              options={[{ value: 'letter', label: 'US Letter' }, { value: 'a4', label: 'A4' }]}
            />
            {tool.answerKey && (
              <Toggle
                label={tool.answerKey.label}
                description={tool.answerKey.description}
                checked={saved.includeAnswerKey}
                onChange={(v) => patchSaved({ includeAnswerKey: v })}
              />
            )}
            <Toggle
              label="Small credit line at the bottom"
              description={`Prints “${CREDIT_TEXT}”. It helps other teachers find this free tool. Turn it off any time.`}
              checked={prefs.showCredit !== false}
              onChange={(v) => patchPrefs({ showCredit: v })}
            />
          </Section>
          <ToolAbout slug={tool.slug} name={tool.name} />
          <div className="h-2" />
        </div>
      </section>

      {/* ---- Preview ---- */}
      <section className={`${tab === 'preview' ? 'flex' : 'hidden'} min-h-0 min-w-0 flex-1 flex-col bg-stone-200/70 lg:flex`}>
        <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 bg-white px-4 py-3">
          {tool.usesSeed && (
            <Button variant="secondary" icon={<Shuffle size={18} />} onClick={() => setSeed(randomSeed())}>
              {tool.seedLabel ?? 'New puzzle'}
            </Button>
          )}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {!tool.noShare && (
              <Button variant="secondary" icon={shareState === 'copied' ? <Check size={18} /> : <Link2 size={18} />} onClick={onShare}>
                {shareState === 'copied' ? 'Link copied!' : 'Copy link'}
              </Button>
            )}
            <Button variant="accent" icon={<Printer size={18} />} onClick={printNow} disabled={pages.length === 0}>
              Print Now
            </Button>
            <Button
              variant="primary"
              disabled={pages.length === 0 || exporting !== null}
              onClick={onDownload}
              icon={exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            >
              {exporting ? `Making PDF… ${exporting.done}/${exporting.total}` : 'Download PDF'}
            </Button>
          </div>
          {shareState === 'long' && (
            <div className="w-full">
              <Notice>This worksheet has too much text to fit in a link. Shorten your word list a little and try again.</Notice>
            </div>
          )}
          {exportError && (
            <div className="w-full">
              <Notice>We couldn&apos;t make the PDF. Please try &ldquo;Print Now&rdquo; and choose &ldquo;Save as PDF&rdquo; instead.</Notice>
            </div>
          )}
        </div>
        <PreviewBoundary resetKey={`${tool.id}-${seed}-${JSON.stringify(settings).length}`}>
          <PreviewPages pages={pages} sheets={sheets} paperWidth={paper.width} paperHeight={paper.height} issues={issues} />
        </PreviewBoundary>
      </section>

      {createPortal(sheets, printRoot)}
    </div>
  )
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: ReactNode; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={'flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[15px] font-extrabold ' + (active ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700')}
    >
      {icon}
      {children}
    </button>
  )
}

function PreviewPages({
  pages, sheets, paperWidth, paperHeight, issues,
}: { pages: PageSpec[]; sheets: ReactNode[]; paperWidth: number; paperHeight: number; issues: Issue[] }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // Safety net: the pane can change from hidden to visible (phone tabs) without the observer noticing.
  useLayoutEffect(() => {
    const w = boxRef.current?.clientWidth ?? 0
    if (w !== width) setWidth(w)
  })

  const scale = Math.min(1, Math.max(0.25, (width - 32) / paperWidth))

  return (
    <div ref={boxRef} className="soft-scroll min-h-0 flex-1 overflow-y-auto p-4">
      {issues.length > 0 && (
        <div role="status" className="mx-auto mb-4 max-w-[640px] space-y-2">
          {issues.map((it, i) => (
            <div
              key={i}
              className={`flex gap-2.5 rounded-xl border-2 p-3.5 text-[15px] font-semibold leading-snug ${
                it.level === 'error' ? 'border-rose-300 bg-rose-50 text-rose-900' : 'border-amber-300 bg-amber-50 text-amber-900'
              }`}
            >
              <AlertTriangle size={20} className="mt-0.5 shrink-0" />
              <span>{it.message}</span>
            </div>
          ))}
          {pages.length > 0 && <p className="text-center text-[13px] font-semibold text-stone-500">Notes like these are only for you. They are not printed.</p>}
        </div>
      )}
      {pages.length === 0 && issues.length === 0 && (
        <div className="mx-auto mt-10 max-w-sm rounded-2xl bg-white p-6 text-center text-stone-600 shadow">
          Add some content on the left and your worksheet will appear here.
        </div>
      )}
      <div className="flex flex-col items-center gap-6">
        {sheets.map((sheet, i) => (
          <figure key={i} className="m-0">
            <figcaption className="mb-1.5 text-sm font-bold text-stone-500">
              Page {i + 1} of {sheets.length}
              {pages[i]?.label ? ` · ${pages[i].label}` : ''}
            </figcaption>
            <div style={{ width: paperWidth * scale, height: paperHeight * scale }} className="shadow-xl ring-1 ring-black/10">
              <div style={{ width: paperWidth, height: paperHeight, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{sheet}</div>
            </div>
          </figure>
        ))}
      </div>
    </div>
  )
}
