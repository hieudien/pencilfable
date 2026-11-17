import { useEffect, useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react'
import { applyMeta } from '../seo/meta'

/**
 * A tiny router: the site has a handful of pages and each tool has its own address,
 * so we don't need a library. Works with the "send every path to index.html" rule in public/_redirects.
 */

export type Page =
  | { name: 'landing' }
  | { name: 'donate' }
  | { name: 'legal'; kind: 'privacy' | 'terms' }
  | { name: 'tool'; slug: string }

export function parsePath(pathname: string): Page {
  const clean = pathname.replace(/^\/+|\/+$/g, '').toLowerCase()
  if (clean === '') return { name: 'landing' }
  if (clean === 'donate') return { name: 'donate' }
  if (clean === 'privacy' || clean === 'terms') return { name: 'legal', kind: clean }
  if (clean === 'tools') return { name: 'tool', slug: '' } // "the tools" → the app picks the default tool
  return { name: 'tool', slug: clean }
}

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
if (typeof window !== 'undefined') window.addEventListener('popstate', emit)

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function usePath(): string {
  return useSyncExternalStore(subscribe, () => window.location.pathname, () => '/')
}

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  const [path] = to.split('#')
  const hash = to.includes('#') ? '#' + to.split('#')[1] : ''
  const same = path === window.location.pathname
  if (opts.replace) window.history.replaceState(null, '', to)
  else if (!(same && hash === window.location.hash)) window.history.pushState(null, '', to)
  emit()
  if (hash) {
    // let the new page render first, then scroll to the section
    requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  } else if (!opts.replace) window.scrollTo(0, 0)
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string }

/** A normal link that switches page without reloading. Ctrl/⌘-click and "open in new tab" still work. */
export function Link({ to, onClick, children, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigate(to)
  }
  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  )
}

/** Sets the browser tab title and the search-engine description for a page. */
export function usePageMeta(title: string, description?: string) {
  const path = usePath()
  useEffect(() => {
    applyMeta(title, description, path)
  }, [title, description, path])
}
