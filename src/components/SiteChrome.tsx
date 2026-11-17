import type { ReactNode } from 'react'
import { Heart } from 'lucide-react'
import { APP_NAME, SUPPORT_EMAIL } from '../config'
import { Link } from '../lib/router'

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg font-black text-white">{APP_NAME.charAt(0)}</span>
      <span className="text-xl font-black leading-none text-stone-900">{APP_NAME}</span>
    </span>
  )
}

const navLink = 'rounded-lg px-3 py-2 text-[15px] font-bold text-stone-700 hover:bg-stone-100'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
        <Link to="/" aria-label={`${APP_NAME} home`} className="mr-2 shrink-0">
          <Logo />
        </Link>
        <nav className="ml-auto flex items-center gap-1" aria-label="Main">
          <Link to="/#tools" className={`${navLink} hidden sm:block`}>Tools</Link>
          <Link to="/donate" className={`${navLink} flex items-center gap-1.5`}>
            <Heart size={16} className="text-orange-500" fill="currentColor" /> Donate
          </Link>
          <Link to="/tools" className="ml-1 whitespace-nowrap rounded-xl bg-emerald-600 px-4 py-2.5 text-[15px] font-extrabold text-white shadow-sm hover:bg-emerald-700">
            <span className="sm:hidden">Tools</span>
            <span className="hidden sm:inline">Open the tools</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  const col = 'space-y-2 text-[15px]'
  const a = 'text-stone-600 hover:text-emerald-700 hover:underline'
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-[15px] text-stone-600">Free printable games and worksheets for teachers and homeschool families. Made in your browser, nothing uploaded.</p>
        </div>
        <ul className={col}>
          <li className="font-extrabold text-stone-900">Tools</li>
          <li><Link to="/#tools" className={a}>All tools</Link></li>
          <li><Link to="/word-search" className={a}>Word Search</Link></li>
          <li><Link to="/four-numbers-challenge" className={a}>Four Numbers Challenge</Link></li>
        </ul>
        <ul className={col}>
          <li className="font-extrabold text-stone-900">Support</li>
          <li><Link to="/donate" className={a}>Donate</Link></li>
          {SUPPORT_EMAIL && <li><a href={`mailto:${SUPPORT_EMAIL}`} className={a}>{SUPPORT_EMAIL}</a></li>}
        </ul>
        <ul className={col}>
          <li className="font-extrabold text-stone-900">Legal</li>
          <li><Link to="/privacy" className={a}>Privacy</Link></li>
          <li><Link to="/terms" className={a}>Terms</Link></li>
        </ul>
      </div>
      <div className="border-t border-stone-100 py-4 text-center text-sm text-stone-500">© {new Date().getFullYear()} {APP_NAME}</div>
    </footer>
  )
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-[#fbf8f3]">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  )
}
