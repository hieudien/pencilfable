# Pencilfable – Free Printable Games & Worksheets

A web app that runs 100% in the browser (Vite + React + TypeScript + Tailwind). No backend, no database, no accounts.
Teachers and homeschool parents type a word list, question list or class list, see the page update live, then print it or download a PDF.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests + a smoke test of every tool (src/tools/smoke.test.ts)
npm run check      # type check + all tests + production build; run before every deploy
npm run build      # outputs dist/, ready for Cloudflare Pages or any static host
```

## Pages

| Address | Page |
|---------|------|
| `/` | Landing page: intro, list of tools, donate call to action, FAQ. The preview images are real, live pages from the tools |
| `/donate` | Support page (the button leads to your donation page) |
| `/privacy`, `/terms` | Plain-language privacy policy and terms (templates, see below) |
| `/tools`, `/<tool-slug>` | The worksheet app itself, for example `/word-search` |

## Model: completely free, supported by donations

Every tool is free: no account, no ads, no watermark. There is no license, paid plan or payment code in the project.

To turn on the donate button:

1. Create a donation page (Ko-fi, Buy Me a Coffee, PayPal.me, GitHub Sponsors…).
2. Copy `.env.example` to `.env.local` and set `VITE_DONATE_URL` (the link) and `VITE_DONATE_PROVIDER` (the service name, e.g. Ko-fi).
   You can also set the app name, your name, country and support email there (see the variables in `.env.example`).
3. If no link is set, the `/donate` page says "Donations are not open yet", so visitors never see a broken button.
   The project currently ships with a default Ko-fi link in `src/config.ts`.

Settings are read **at build time**. On a host such as Cloudflare Pages, set the `VITE_...` variables in the project settings and redeploy.

**Before going public:** have a lawyer in your country review `/privacy` and `/terms` (the text lives in `src/pages/Legal.tsx`;
it describes how the app really works, but it is not legal advice). Add your name or organisation and a contact address,
and update the text if you ever add ads, accounts or analytics other than Cloudflare Web Analytics (already described there).

## The 20 tools

| Group | Tools |
|-------|-------|
| Reading & Writing | Word Search, Spelling Practice, Word Scramble, Matching Pairs, Missing Letters, Snowman Word Game |
| Math & Logic | Four Numbers Challenge, Math Drill Sheets, Kids Sudoku, Secret Code Breaker, Clock Worksheets, Mystery Picture Math |
| Games & Puzzles | Maze Maker, Sea Battle Game, Bingo Cards, "I Have… Who Has?", Dice Maker |
| Classroom Helpers | Calendar Maker, Student Picker & Groups, Visual Daily Schedule |

Removed on purpose: Handwriting Practice, Bubble Letters, Roll & Color Math, Seating Chart, Reward Stickers, Weekly Lesson Plan,
Board Game Maker, Memory Match Cards.

## Adding a new tool

1. Create `src/tools/<toolName>/index.tsx` that exports a `ReadyTool` (see `src/tools/types.ts`):
   `Controls` (the input panel on the left) and `pages(settings, ctx)` (returns the list of paper pages).
2. Everything random **must** come from `ctx.seed` via `createRng` (`src/lib/rng.ts`). That keeps puzzles and answer keys consistent
   and stops the preview flickering on every keystroke. The "New puzzle" button is the only thing that changes the seed.
3. Put pure logic (no React) in `generate.ts` and write `generate.test.ts` for it.
4. Add the tool to the list in `src/tools/registry.ts`. A tool that is not finished can be declared as `{ status: 'soon', ... }`.

Paper sizes are fixed in pixels at 96 dpi (`src/lib/paper.ts`): Letter 816×1056, A4 794×1123.
Use `contentWidth`, `contentHeight` and `HEADER_H` to lay out pages instead of guessing numbers.

## Printing and PDF

- **Print Now** prints straight from the browser with CSS `@page` + `@media print` (text and drawings stay vector, so it is the sharpest option).
  Checked with headless Chrome: correct page count, correct Letter size, no blank pages.
- **Download PDF** captures each page at about 288 dpi and assembles a PDF (`html2canvas-pro` + `jsPDF`). It prints well but is an image,
  so files are larger (about 0.3 MB per page) and text cannot be selected or copied. For a true vector PDF later, render pages as SVG
  or use `pdf-lib`.
- Why `html2canvas-pro`: Tailwind v4 uses `oklch` colors, which the original `html2canvas` cannot read.
- Rules for paper pages: pass icon colors explicitly (`color="#hex"`, never `currentColor`), do not use `<text>` inside SVG
  (fonts do not apply there), and avoid `repeating-linear-gradient` (it renders as a solid gray block in the PDF). Draw ruled lines with real `div` elements.
- The off-screen copy of the pages used for printing is `position: fixed` on purpose. With `absolute` it made the whole page scrollable into blank space.

## Messages for teachers (invalid or trimmed input)

A tool can export `check(settings, ctx)`, which returns a list of `Issue` objects (`src/tools/types.ts`, helpers in `src/tools/issues.ts`).
`error` means no page could be made (red box, Print and Download PDF are disabled); `warn` means a page was made but something was left out
or the game will not work properly (yellow box). The box appears above the preview and is **never printed**.
Every message must say *what is wrong* and *what to do about it*. `src/tools/smoke.test.ts` enforces this for every tool:
if some input produces no page without a specific `error` message, the test fails.

## Deploying to Cloudflare

`wrangler.jsonc` tells Cloudflare to serve `dist/` as static assets and to answer unknown addresses (like `/word-search`) with `index.html`
(`not_found_handling: single-page-application`). Do **not** add a `public/_redirects` file with `/* /index.html 200`: Cloudflare rejects it
as an infinite redirect loop. Build command: `npm run build`. Deploy command: `npx wrangler deploy`.

## SEO and sharing

- **Copy for search engines** lives in `src/seo/data.ts`: a title, description, intro and three tips for every tool. A test fails if a tool is added without it, or if a title or description is too long.
- **Static pages:** `scripts/seoPlugin.ts` runs at the end of `npm run build` and writes `dist/<slug>/index.html` for every tool and page (title, description, canonical link, Open Graph and Twitter tags, JSON-LD, and a plain-HTML copy of the text), plus `sitemap.xml` and `robots.txt`.
  The builder is `src/seo/pages.ts` (tested in `src/seo/seo.test.ts`). Set `VITE_SITE_URL` to the real address before deploying.
- **Share picture:** `public/og.png` (1200×630) is made from `scripts/og.html`; the command to regenerate it is in that file.
- **Copy link:** the toolbar button puts the worksheet (words, settings, seed) after `#share=` in the address. That part of an address is never sent to a server.
  Everything read back is checked against the tool's defaults (`src/lib/share.ts`). Tools that hold private data set `noShare: true` (the student picker).
- **Credit line:** every sheet prints "Made with … free at <address>" in the footer space. Teachers can switch it off under Page settings (saved in their browser).
- **After deploying:** add the site to Google Search Console and Bing Webmaster Tools and submit `/sitemap.xml`.

## Known limitations

- The app is still a client-side single-page app, but `npm run build` also writes static HTML for every address (see "SEO and sharing"). Only the page title, description, main text and links are static; the tool itself needs JavaScript.
- Traffic is measured with Cloudflare Web Analytics, which is switched on for the Pages site in the Cloudflare dashboard (Web Analytics). It needs no code in this repo and shows visits, page views, referrer, country, path and browser. It is described in `/privacy`. Whether it separates visits by `utm_` tags is not verified, so check the Referer tab for traffic from Pinterest or X. Use Google Search Console for Google search data (also no code).
- Not yet verified: native printing on A4, and Safari and Firefox.
