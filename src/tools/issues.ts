import type { Issue } from './types'

const plural = (n: number, noun: string) => `${n} ${noun}${n === 1 ? '' : 's'}`

/** "You typed 40 words, but only the first 30 fit on one page. The last 10 were left out." */
export function tooMany(count: number, max: number, noun: string, extra = ''): Issue[] {
  if (count <= max) return []
  return [{ level: 'warn', message: `You typed ${plural(count, noun)}, but only the first ${max} fit on the page. The last ${count - max} ${count - max === 1 ? 'was' : 'were'} left out.${extra ? ' ' + extra : ''}` }]
}

/** "Add at least 2 pairs (you have 1). …" – nothing can be made, so this is an error. */
export function tooFew(count: number, min: number, noun: string, how: string): Issue[] {
  if (count >= min) return []
  return [{ level: 'error', message: `Add at least ${plural(min, noun)}${count > 0 ? ` (you have ${count})` : ''}. ${how}` }]
}

/** Lines that were typed but could not be used. */
export function skipped(count: number, reason: string): Issue[] {
  if (count <= 0) return []
  return [{ level: 'warn', message: `${plural(count, 'line')} ${count === 1 ? 'was' : 'were'} skipped because ${reason}.` }]
}

/** Number of non-empty lines in a text box. */
export const nonEmptyLines = (raw: string) => raw.split('\n').filter((l) => l.trim()).length
