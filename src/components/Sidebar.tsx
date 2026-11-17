import { Heart } from 'lucide-react'
import { Link } from '../lib/router'
import { APP_NAME } from '../config'
import { CATEGORIES, type ToolEntry } from '../tools/types'
import { TOOLS } from '../tools/registry'

export function Sidebar({ activeSlug, onSelect }: { activeSlug: string; onSelect: (tool: ToolEntry) => void }) {
  return (
    <nav className="flex h-full flex-col bg-white" aria-label="Worksheet tools">
      <Link to="/" className="flex items-center gap-2.5 px-5 pb-3 pt-5" aria-label={`${APP_NAME} home`}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg font-black text-white">{APP_NAME.charAt(0)}</div>
        <div>
          <div className="text-xl font-black leading-none text-stone-900">{APP_NAME}</div>
          <div className="mt-0.5 text-xs font-semibold text-stone-500">Printable worksheets</div>
        </div>
      </Link>

      <div className="soft-scroll flex-1 overflow-y-auto px-3 pb-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.id} className="mt-4">
            <div className="px-2 pb-1 text-[11px] font-extrabold uppercase tracking-wider text-stone-400">{cat.label}</div>
            <ul className="space-y-0.5">
              {TOOLS.filter((t) => t.category === cat.id).map((tool) => {
                const active = tool.slug === activeSlug
                const ready = tool.status === 'ready'
                const Icon = tool.icon
                return (
                  <li key={tool.id}>
                    <button
                      type="button"
                      disabled={!ready}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => onSelect(tool)}
                      className={
                        'flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-[15px] font-bold transition ' +
                        (active
                          ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                          : ready
                            ? 'text-stone-700 hover:bg-stone-100'
                            : 'cursor-not-allowed text-stone-400')
                      }
                    >
                      <Icon size={20} className={active ? 'text-emerald-600' : ready ? 'text-stone-500' : 'text-stone-300'} />
                      <span className="flex-1 leading-tight">{tool.name}</span>
                      {!ready && <span className="rounded-md bg-stone-200 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-stone-600">Soon</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-stone-200 p-3">
        <Link
          to="/donate"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-base font-extrabold text-white shadow-sm hover:bg-orange-600"
        >
          <Heart size={18} fill="currentColor" /> Support this site
        </Link>
        <p className="mt-2 text-center text-xs font-semibold text-stone-500">Every tool is free, forever.</p>
      </div>
    </nav>
  )
}
