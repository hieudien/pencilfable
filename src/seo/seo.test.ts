import { describe, expect, it } from 'vitest'
import { READY_TOOLS } from '../tools/registry'
import { TOOL_NAMES, TOOL_SEO } from './data'
import { buildRobots, buildSeoPages, buildSitemap, renderPage } from './pages'

const SITE = 'https://example.com'
const TEMPLATE = '<html><head><title>x</title><meta name="description" content="y" /></head><body><div id="root"></div></body></html>'

describe('search-engine copy', () => {
  it('has copy for exactly the tools that exist, with matching names', () => {
    const slugs = READY_TOOLS.map((t) => t.slug).sort()
    expect(Object.keys(TOOL_SEO).sort()).toEqual(slugs)
    expect(Object.keys(TOOL_NAMES).sort()).toEqual(slugs)
    for (const t of READY_TOOLS) expect(TOOL_NAMES[t.slug]).toBe(t.name)
  })

  it('keeps titles and descriptions a search result can show in full', () => {
    for (const [slug, s] of Object.entries(TOOL_SEO)) {
      expect(s.title.length, `${slug} title`).toBeLessThanOrEqual(48)
      expect(s.description.length, `${slug} description`).toBeGreaterThanOrEqual(80)
      expect(s.description.length, `${slug} description`).toBeLessThanOrEqual(175)
      expect(s.intro.length, `${slug} intro`).toBeGreaterThan(60)
    }
    expect(new Set(Object.values(TOOL_SEO).map((s) => s.title)).size).toBe(Object.keys(TOOL_SEO).length)
    expect(new Set(Object.values(TOOL_SEO).map((s) => s.description)).size).toBe(Object.keys(TOOL_SEO).length)
  })
})

describe('static pages', () => {
  const pages = buildSeoPages(SITE, 'Pencilfable')

  it('makes one page per tool plus landing, /tools and the site pages', () => {
    const paths = pages.map((p) => p.path)
    expect(new Set(paths).size).toBe(paths.length)
    for (const t of READY_TOOLS) expect(paths).toContain('/' + t.slug)
    for (const p of ['/', '/tools', '/donate', '/privacy', '/terms']) expect(paths).toContain(p)
  })

  it('fills the template with the right tags and text', () => {
    const page = pages.find((p) => p.path === '/maze')!
    const html = renderPage(TEMPLATE, page, SITE, 'Pencilfable')
    expect(html).toContain(`<title>${TOOL_SEO.maze.title} | Pencilfable</title>`)
    expect(html).toContain(`content="${TOOL_SEO.maze.description}"`)
    expect(html).toContain('<link rel="canonical" href="https://example.com/maze" />')
    expect(html).toContain('property="og:image" content="https://example.com/og.png"')
    expect(html).toContain('"@type":"WebApplication"')
    expect(html).toMatch(/<div id="root">.*<h1>Free Printable Maze Maker<\/h1>/)
    expect(html.match(/<title>/g)).toHaveLength(1)
  })

  it('points /tools at the default tool and keeps it out of the sitemap', () => {
    const tools = pages.find((p) => p.path === '/tools')!
    expect(tools.canonicalPath).toBe('/word-search')
    const sitemap = buildSitemap(SITE, pages, '2026-01-01')
    expect(sitemap).not.toContain('/tools<')
    expect(sitemap).toContain('<loc>https://example.com/</loc>')
    expect(sitemap).toContain('<loc>https://example.com/word-search</loc>')
    expect(sitemap.match(/<url>/g)).toHaveLength(READY_TOOLS.length + 2) // tools + landing + donate
  })

  it('escapes anything that could break out of an attribute or script', () => {
    const evil = buildSeoPages(SITE, 'A"><script>alert(1)</script>')
    const html = renderPage(TEMPLATE, evil[1], SITE, 'A"><script>alert(1)</script>')
    expect(html).not.toContain('<script>alert(1)')
  })

  it('lists the sitemap in robots.txt', () => {
    expect(buildRobots(SITE)).toContain('Sitemap: https://example.com/sitemap.xml')
  })
})
