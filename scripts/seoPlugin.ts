import type { Plugin } from 'vite'
import { buildRobots, buildSeoPages, buildSitemap, renderPage } from '../src/seo/pages.ts'

/**
 * After the normal build, writes one static HTML file per address (dist/word-search/index.html, …)
 * plus sitemap.xml and robots.txt, so search engines and link previews see real titles and text
 * without having to run the app first. The app itself is unchanged: it still takes over in the browser.
 */
export function seoPlugin(opts: { siteUrl: string; appName: string }): Plugin {
  return {
    name: 'pencilfable-seo',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const index = bundle['index.html']
      if (!index || index.type !== 'asset' || typeof index.source !== 'string') {
        this.error('seoPlugin: could not find the built index.html')
      }
      const template = index.source as string
      const pages = buildSeoPages(opts.siteUrl, opts.appName)

      for (const page of pages) {
        const html = renderPage(template, page, opts.siteUrl, opts.appName)
        if (page.path === '/') index.source = html
        else this.emitFile({ type: 'asset', fileName: `${page.path.slice(1)}/index.html`, source: html })
      }
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemap(opts.siteUrl, pages, new Date().toISOString().slice(0, 10)) })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: buildRobots(opts.siteUrl) })
    },
  }
}
