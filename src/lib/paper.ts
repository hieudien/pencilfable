export type PaperId = 'letter' | 'a4'

/** All sizes in CSS pixels at 96 dpi, so 1 inch = 96px. */
export interface Paper {
  id: PaperId
  label: string
  /** CSS @page size keyword */
  css: string
  width: number
  height: number
  /** Space reserved at the bottom of every sheet for the footer */
  footer: number
  padX: number
  padTop: number
}

const base = { footer: 40, padX: 48, padTop: 44 }

export const PAPERS: Record<PaperId, Paper> = {
  letter: { id: 'letter', label: 'US Letter', css: 'letter', width: 816, height: 1056, ...base },
  a4: { id: 'a4', label: 'A4', css: 'A4', width: 794, height: 1123, ...base },
}

export const contentWidth = (p: Paper) => p.width - p.padX * 2
export const contentHeight = (p: Paper) => p.height - p.padTop - p.footer

/** Height of the standard worksheet header (title + name/date line). */
export const HEADER_H = 92
