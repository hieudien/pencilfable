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
and update the text if you ever add analytics, ads or accounts.

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

## Known limitations

- A plain React single-page app is weak for SEO: the landing page and tool content only exist after JavaScript runs. Every page already has its own address,
  title and description, so it can be pre-rendered later (vite-ssg or Astro) without changing the structure.
- There is no sitemap, social sharing image (og:image) or analytics yet.
- Not yet verified: native printing on A4, and Safari and Firefox.
