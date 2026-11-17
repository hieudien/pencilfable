import { SITE_URL } from '../config'

function setTag(selector: string, create: () => HTMLElement, attr: 'content' | 'href', value: string) {
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

const meta = (key: 'name' | 'property', name: string) => () => {
  const m = document.createElement('meta')
  m.setAttribute(key, name)
  return m
}

/** "/word-search/" and "/word-search" are the same page; "/" stays "/". */
export function canonicalPath(pathname: string): string {
  const clean = pathname.replace(/\/+$/, '').toLowerCase()
  return clean === '' ? '/' : clean
}

/** Keeps the browser tab, search-engine and link-preview tags in step with the page being shown. */
export function applyMeta(title: string, description: string | undefined, pathname: string) {
  document.title = title
  const url = SITE_URL + (canonicalPath(pathname) === '/' ? '/' : canonicalPath(pathname))
  setTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', url)
  setTag('meta[property="og:title"]', meta('property', 'og:title'), 'content', title)
  setTag('meta[property="og:url"]', meta('property', 'og:url'), 'content', url)
  setTag('meta[name="twitter:title"]', meta('name', 'twitter:title'), 'content', title)
  if (description !== undefined) {
    setTag('meta[name="description"]', meta('name', 'description'), 'content', description)
    setTag('meta[property="og:description"]', meta('property', 'og:description'), 'content', description)
    setTag('meta[name="twitter:description"]', meta('name', 'twitter:description'), 'content', description)
  }
}
