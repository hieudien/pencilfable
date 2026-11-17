import { DONATE_SEO, LANDING_SEO, TOOL_NAMES, TOOL_SEO } from './data.ts'

/**
 * Builds the static, search-engine-friendly HTML for every address. No React and no Node imports,
 * so it runs inside the build (scripts/seoPlugin.ts) and inside the tests.
 *
 * Each page is the normal app shell plus: the right <title>, description, canonical link, share-preview tags,
 * structured data, and a plain-HTML copy of the page's main text inside #root (React replaces it once it starts).
 */

export const DEFAULT_TOOL_SLUG = 'word-search'

export interface SeoPage {
  /** Address the file is served at, e.g. "/word-search". */
  path: string
  /** The address search engines should treat as the real one (differs only for /tools). */
  canonicalPath: string
  title: string
  description: string
  bodyHtml: string
  jsonLd: object[]
  inSitemap: boolean
}

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const toolSlugs = () => Object.keys(TOOL_SEO)

function links(slugs: string[]): string {
  return `<ul>${slugs.map((s) => `<li><a href="/${s}">${esc(TOOL_NAMES[s])}</a></li>`).join('')}</ul>`
}

function shell(appName: string, inner: string): string {
  return (
    '<div style="max-width:720px;margin:0 auto;padding:24px 16px;font-family:system-ui,sans-serif;line-height:1.6;color:#1c1917">' +
    `<p><a href="/"><b>${esc(appName)}</b></a></p>${inner}` +
    `<p><a href="/donate">Donate</a> · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></p></div>`
  )
}

export function buildSeoPages(siteUrl: string, appName: string): SeoPage[] {
  const slugs = toolSlugs()
  const pages: SeoPage[] = []

  pages.push({
    path: '/',
    canonicalPath: '/',
    title: LANDING_SEO.title.replace('{APP}', appName),
    description: LANDING_SEO.description,
    bodyHtml: shell(
      appName,
      `<h1>Free printable games and worksheets, made in seconds</h1><p>${esc(LANDING_SEO.description)}</p><h2>${slugs.length} free tools</h2>${links(slugs)}`,
    ),
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: appName, url: siteUrl + '/', description: LANDING_SEO.description }],
    inSitemap: true,
  })

  for (const slug of slugs) {
    const seo = TOOL_SEO[slug]
    const name = TOOL_NAMES[slug]
    const url = `${siteUrl}/${slug}`
    pages.push({
      path: '/' + slug,
      canonicalPath: '/' + slug,
      title: `${seo.title} | ${appName}`,
      description: seo.description,
      bodyHtml: shell(
        appName,
        `<h1>${esc(seo.title)}</h1><p>${esc(seo.intro)}</p><h2>Tips</h2><ul>${seo.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` +
          `<h2>More free tools</h2>${links(slugs.filter((s) => s !== slug))}`,
      ),
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name,
          url,
          description: seo.description,
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'Any',
          browserRequirements: 'Requires JavaScript',
          inLanguage: 'en',
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: appName, item: siteUrl + '/' },
            { '@type': 'ListItem', position: 2, name, item: url },
          ],
        },
      ],
      inSitemap: true,
    })
  }

  // "/tools" opens the default tool, so it repeats that page and points search engines at the real address.
  const def = pages.find((p) => p.path === '/' + DEFAULT_TOOL_SLUG)!
  pages.push({ ...def, path: '/tools', canonicalPath: def.canonicalPath, inSitemap: false })

  pages.push({
    path: DONATE_SEO.path,
    canonicalPath: DONATE_SEO.path,
    title: DONATE_SEO.title.replace('{APP}', appName),
    description: DONATE_SEO.description.replace('{APP}', appName),
    bodyHtml: shell(appName, `<h1>Keep ${esc(appName)} free</h1><p>${esc(DONATE_SEO.description.replace('{APP}', appName))}</p>`),
    jsonLd: [],
    inSitemap: true,
  })

  for (const kind of ['privacy', 'terms'] as const) {
    const label = kind === 'privacy' ? 'Privacy' : 'Terms of use'
    pages.push({
      path: '/' + kind,
      canonicalPath: '/' + kind,
      title: `${label} – ${appName}`,
      description: `${label} for ${appName}, the free printable games and worksheets site.`,
      bodyHtml: shell(appName, `<h1>${label}</h1>`),
      jsonLd: [],
      inSitemap: false,
    })
  }

  return pages
}

/** Puts one page's tags and text into the built index.html. */
export function renderPage(template: string, page: SeoPage, siteUrl: string, appName: string): string {
  const url = siteUrl + (page.canonicalPath === '/' ? '/' : page.canonicalPath)
  const image = `${siteUrl}/og.png`
  const head = [
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(appName)}" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(page.title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    ...page.jsonLd.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`),
  ].join('\n    ')

  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`)
    .replace(/<meta\s+name="description"[^>]*>/, `<meta name="description" content="${esc(page.description)}" />`)
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${page.bodyHtml}</div>`)
}

export function buildSitemap(siteUrl: string, pages: SeoPage[], date: string): string {
  const urls = pages
    .filter((p) => p.inSitemap)
    .map((p) => `  <url><loc>${esc(siteUrl + (p.path === '/' ? '/' : p.path))}</loc><lastmod>${date}</lastmod></url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export function buildRobots(siteUrl: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
}
