import type { Paper } from './paper'

const PAGE_STYLE_ID = 'page-size-style'

/** Tell the browser's print dialog which paper to use (must be kept in sync with the sheets). */
export function setPrintPaper(paper: Paper) {
  let el = document.getElementById(PAGE_STYLE_ID)
  if (!el) {
    el = document.createElement('style')
    el.id = PAGE_STYLE_ID
    document.head.appendChild(el)
  }
  el.textContent = `@page { size: ${paper.css} portrait; margin: 0; }`
}

export function printNow() {
  window.print()
}

function safeFileName(name: string): string {
  const cleaned = name.replace(/[^\p{L}\p{N}\-_ ]+/gu, '').trim().replace(/\s+/g, '-')
  return (cleaned || 'worksheet').slice(0, 60)
}

/**
 * Turns every `.sheet` inside `root` into one page of a PDF.
 * Heavy libraries are loaded on demand so the app opens fast.
 */
export async function downloadPdf(root: HTMLElement, paper: Paper, title: string, onProgress?: (done: number, total: number) => void) {
  const sheets = Array.from(root.querySelectorAll<HTMLElement>('.sheet'))
  if (sheets.length === 0) return

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas-pro'), import('jspdf')])
  await document.fonts.ready

  const wIn = paper.width / 96
  const hIn = paper.height / 96
  const pdf = new jsPDF({ unit: 'in', format: [wIn, hIn], orientation: 'portrait', compress: true })

  for (let i = 0; i < sheets.length; i++) {
    const canvas = await html2canvas(sheets[i], {
      scale: 3, // ≈ 288 dpi: crisp when printed
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    })
    const img = canvas.toDataURL('image/jpeg', 0.92)
    if (i > 0) pdf.addPage([wIn, hIn], 'portrait')
    pdf.addImage(img, 'JPEG', 0, 0, wIn, hIn, undefined, 'FAST')
    onProgress?.(i + 1, sheets.length)
    // let the browser breathe between big pages
    await new Promise((r) => setTimeout(r, 0))
  }

  pdf.save(`${safeFileName(title)}.pdf`)
}
