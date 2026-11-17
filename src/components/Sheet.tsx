import type { ReactNode } from 'react'
import type { Paper } from '../lib/paper'
import { contentHeight, HEADER_H } from '../lib/paper'

/** One physical sheet of paper. Fixed pixel size (96 dpi) so preview, print and PDF all match. */
export function Sheet({ paper, children, credit }: { paper: Paper; children: ReactNode; credit?: string }) {
  return (
    <div
      className="sheet"
      style={{
        width: paper.width,
        height: paper.height,
        padding: `${paper.padTop}px ${paper.padX}px 0`,
      }}
    >
      <div className="sheet-content" style={{ height: contentHeight(paper) }}>
        {children}
      </div>
      {credit ? (
        // sits in the bottom space every sheet reserves for a footer; explicit color so the PDF export keeps it
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 14, textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#a8a29e' }}>{credit}</div>
      ) : null}
    </div>
  )
}

/** Standard title + Name/Date line. Always HEADER_H tall so tools can plan their pages. */
export function WorksheetHeader({
  title, teacherName, nameLine = true,
}: { title: string; teacherName?: string; nameLine?: boolean }) {
  return (
    <div style={{ height: HEADER_H }} className="flex flex-col justify-between">
      <div className="text-center text-[30px] font-extrabold leading-tight tracking-tight text-stone-900">{title || ' '}</div>
      {nameLine ? (
        <div className="flex items-end gap-6 text-[15px] font-bold text-stone-800">
          <span className="flex flex-1 items-end gap-2">Name <span className="mb-[3px] flex-1 border-b-2 border-stone-800" /></span>
          <span className="flex w-[34%] items-end gap-2">Date <span className="mb-[3px] flex-1 border-b-2 border-stone-800" /></span>
        </div>
      ) : (
        <div />
      )}
      {teacherName ? <div className="-mb-1 text-right text-[13px] font-semibold text-stone-500">{teacherName}</div> : null}
    </div>
  )
}
