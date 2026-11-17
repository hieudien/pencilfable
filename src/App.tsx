import { useCallback, useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { APP_NAME } from './config'
import { Sidebar } from './components/Sidebar'
import { Workspace } from './components/Workspace'
import { Link, navigate, parsePath, usePath } from './lib/router'
import Donate from './pages/Donate'
import Landing from './pages/Landing'
import Legal from './pages/Legal'
import { DEFAULT_SLUG, findToolBySlug } from './tools/registry'
import type { ReadyTool, ToolEntry } from './tools/types'

/** The tool workspace: sidebar + settings + live preview. */
function ToolApp({ slug }: { slug: string }) {
  const [drawer, setDrawer] = useState(false)

  const entry = findToolBySlug(slug)
  const ready: ReadyTool | null = entry && entry.status === 'ready' ? entry : null
  const tool = ready ?? (findToolBySlug(DEFAULT_SLUG) as ReadyTool)

  useEffect(() => {
    // "/tools", an unknown address, or a tool that no longer exists
    if (!ready && slug !== DEFAULT_SLUG) navigate('/' + DEFAULT_SLUG, { replace: true })
  }, [ready, slug])

  const select = useCallback((t: ToolEntry) => {
    if (t.status !== 'ready') return
    setDrawer(false)
    navigate('/' + t.slug)
  }, [])

  return (
    <div className="flex h-full">
      {/* sidebar – always visible on large screens, drawer on small ones */}
      <aside className="hidden w-72 shrink-0 border-r border-stone-200 lg:block">
        <Sidebar activeSlug={tool.slug} onSelect={select} />
      </aside>
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-stone-900/50" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-80 max-w-[85%] shadow-2xl">
            <Sidebar activeSlug={tool.slug} onSelect={select} />
            <button type="button" aria-label="Close menu" onClick={() => setDrawer(false)} className="absolute right-2 top-3 rounded-full p-2 text-stone-500 hover:bg-stone-100">
              <X size={20} />
            </button>
          </aside>
        </div>
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-stone-200 bg-white px-3 py-2 lg:hidden">
          <button type="button" aria-label="Open tool menu" onClick={() => setDrawer(true)} className="rounded-xl p-2 text-stone-700 hover:bg-stone-100">
            <Menu size={24} />
          </button>
          <Link to="/" className="text-lg font-black">{APP_NAME}</Link>
          <div className="ml-auto truncate text-sm font-bold text-stone-500">{tool.name}</div>
        </header>
        <div className="min-h-0 flex-1">
          <Workspace key={tool.id} tool={tool} />
        </div>
      </main>
    </div>
  )
}

export default function App() {
  const page = parsePath(usePath())
  switch (page.name) {
    case 'landing':
      return <Landing />
    case 'donate':
      return <Donate />
    case 'legal':
      return <Legal kind={page.kind} />
    case 'tool':
      return <ToolApp slug={page.slug} />
  }
}
