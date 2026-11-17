import { useMemo } from 'react'
import { PAPERS } from '../lib/paper'
import type { ReadyTool } from '../tools/types'
import { Sheet } from './Sheet'

/** A real, live first page of a tool, shrunk to thumbnail size (used on the landing page). */
export function SheetThumb({ tool, width, className = '' }: { tool: ReadyTool; width: number; className?: string }) {
  const paper = PAPERS.letter
  const node = useMemo(() => {
    try {
      const pages = tool.pages(tool.defaultSettings, {
        paper,
        title: tool.defaultTitle,
        teacherName: '',
        includeAnswerKey: false,
        seed: 7,
      })
      return pages[0]?.node ?? null
    } catch {
      return null
    }
  }, [tool, paper])

  const scale = width / paper.width
  return (
    <div
      aria-hidden
      className={`overflow-hidden rounded-md bg-white shadow-xl ring-1 ring-black/10 ${className}`}
      style={{ width, height: paper.height * scale }}
    >
      <div style={{ width: paper.width, height: paper.height, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
        <Sheet paper={paper}>
          {node}
        </Sheet>
      </div>
    </div>
  )
}
