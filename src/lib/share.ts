/**
 * "Copy link" support: a worksheet's settings are packed into the part of the address after "#".
 * That part never leaves the browser (it is not sent to any server), and nothing is stored on our side.
 * A link can come from anyone, so everything read from it is checked against the tool's own defaults.
 */

export const SHARE_PARAM = 'share'
/** Longer links break in chat apps and email; past this we ask the teacher to shorten the content. */
export const MAX_SHARE_URL_LENGTH = 6000

export interface SharedWorksheet {
  settings: object
  title: string
  seed: number | null
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string): string {
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

export function encodeShare(data: { settings: object; title: string; seed?: number }): string {
  return toBase64Url(JSON.stringify({ v: 1, s: data.settings, t: data.title, r: data.seed }))
}

const MAX_TEXT = 8000
const MAX_ITEMS = 200

/** Keep `value` only if it has the same shape as `template`; otherwise fall back to the template. */
export function matchShape(value: unknown, template: unknown): unknown {
  if (Array.isArray(template)) {
    if (!Array.isArray(value)) return template
    const out: unknown[] = []
    for (const item of value.slice(0, MAX_ITEMS)) {
      if (template.length === 0) {
        if (typeof item === 'string' || (typeof item === 'number' && Number.isFinite(item))) out.push(typeof item === 'string' ? item.slice(0, MAX_TEXT) : item)
      } else {
        const fixed = matchShape(item, template[0])
        // an item that had to be replaced entirely by the template is dropped, not invented
        if (fixed !== template[0] || item === template[0]) out.push(fixed)
      }
    }
    return out
  }
  if (template !== null && typeof template === 'object') {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return template
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(template)) {
      out[key] = matchShape((value as Record<string, unknown>)[key], (template as Record<string, unknown>)[key])
    }
    return out
  }
  if (typeof template === 'string') return typeof value === 'string' ? value.slice(0, MAX_TEXT) : template
  if (typeof template === 'number') return typeof value === 'number' && Number.isFinite(value) ? value : template
  if (typeof template === 'boolean') return typeof value === 'boolean' ? value : template
  return template
}

/** Returns null when the text is not a valid share link payload. */
export function decodeShare(encoded: string, defaults: object, defaultTitle: string): SharedWorksheet | null {
  try {
    const raw = JSON.parse(fromBase64Url(encoded)) as { v?: unknown; s?: unknown; t?: unknown; r?: unknown }
    if (raw === null || typeof raw !== 'object' || raw.v !== 1) return null
    const settings = matchShape(raw.s, defaults) as object
    const title = typeof raw.t === 'string' ? raw.t.slice(0, 60) : defaultTitle
    const seed = typeof raw.r === 'number' && Number.isInteger(raw.r) && raw.r >= 0 && raw.r <= 0xffffffff ? raw.r : null
    return { settings, title, seed }
  } catch {
    return null
  }
}

/** The shared worksheet in an address hash such as "#share=abc", or null. */
export function readShareFromHash(hash: string, defaults: object, defaultTitle: string): SharedWorksheet | null {
  const m = /^#share=([A-Za-z0-9_-]+)$/.exec(hash)
  return m ? decodeShare(m[1], defaults, defaultTitle) : null
}
