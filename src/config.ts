import { DEFAULT_SITE_URL } from './seo/data'

const env = import.meta.env

export const APP_NAME: string = env.VITE_APP_NAME || 'Pencilfable'
/** The public address of the site, without a trailing slash. Used for canonical links, the sitemap and share previews. */
export const SITE_URL: string = (/^https?:\/\//.test(env.VITE_SITE_URL ?? '') ? String(env.VITE_SITE_URL) : DEFAULT_SITE_URL).replace(/\/+$/, '')
/** Optional. Shown in the footer and on the legal pages when set. */
export const SUPPORT_EMAIL: string = env.VITE_SUPPORT_EMAIL || ''

// ---- Donations (everything in the app is free) ----
const asUrl = (v: unknown): string => (typeof v === 'string' && /^https?:\/\//.test(v) ? v : '')
/** Link to your donation page (Ko-fi, Buy Me a Coffee, PayPal.me, GitHub Sponsors…). */
export const DONATE_URL: string = asUrl(env.VITE_DONATE_URL) || 'https://ko-fi.com/hieudien'
/** What the donation service is called, shown on the donate page, e.g. "Ko-fi". */
export const DONATE_PROVIDER: string = env.VITE_DONATE_PROVIDER || 'Ko-fi'

/** Who runs the site, shown on the legal pages (name or organisation). Add your real name or business name. */
export const OPERATOR_NAME: string = env.VITE_OPERATOR_NAME || ''
/** Country the site is run from, shown on the legal pages. */
export const OPERATOR_COUNTRY: string = env.VITE_OPERATOR_COUNTRY || 'Vietnam'
/** Optional: a short personal note shown on the donate page ("Hi, I'm … I built this because …"). */
export const OPERATOR_BIO: string = env.VITE_OPERATOR_BIO || ''
