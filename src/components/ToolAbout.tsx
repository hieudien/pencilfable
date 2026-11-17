import { Link } from '../lib/router'
import { TOOL_NAMES, TOOL_SEO } from '../seo/data'

/** A short "about" block under the settings: helps new visitors, and gives search engines real text for the page. */
export function ToolAbout({ slug, name }: { slug: string; name: string }) {
  const seo = TOOL_SEO[slug]
  if (!seo) return null
  const others = Object.keys(TOOL_NAMES).filter((s) => s !== slug).slice(0, 6)
  return (
    <section aria-labelledby="about-tool" className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <h2 id="about-tool" className="text-[13px] font-extrabold uppercase tracking-wider text-stone-500">About {name}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-stone-700">{seo.intro}</p>
      <h3 className="mt-3 text-[15px] font-extrabold text-stone-900">Tips</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-stone-700">
        {seo.tips.map((t) => <li key={t}>{t}</li>)}
      </ul>
      <h3 className="mt-3 text-[15px] font-extrabold text-stone-900">More free tools</h3>
      <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[15px]">
        {others.map((s) => (
          <li key={s}><Link to={`/${s}`} className="font-bold text-emerald-700 hover:underline">{TOOL_NAMES[s]}</Link></li>
        ))}
      </ul>
    </section>
  )
}
