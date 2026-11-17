import { Heart, ExternalLink, Share2, Coffee } from 'lucide-react'
import { APP_NAME, DONATE_PROVIDER, DONATE_URL, OPERATOR_BIO, OPERATOR_COUNTRY, OPERATOR_NAME } from '../config'
import { Link, usePageMeta } from '../lib/router'
import { PageShell } from '../components/SiteChrome'
import { READY_TOOLS } from '../tools/registry'

export default function Donate() {
  usePageMeta(`Support ${APP_NAME}`, `${APP_NAME} is free for everyone. If it saves you time, you can help keep it running with a donation.`)
  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
          <Heart size={32} fill="currentColor" />
        </span>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-stone-900 sm:text-5xl">Keep {APP_NAME} free</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-stone-600">
          All {READY_TOOLS.length} tools are free for everyone: no account, no ads, no limits. If {APP_NAME} saves you time, a small donation helps cover the costs of keeping it online and lets us build more tools.
        </p>

        <div className="mt-8">
          {DONATE_URL ? (
            <a
              href={DONATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 py-4 text-xl font-extrabold text-white shadow-lg shadow-orange-900/20 hover:bg-orange-600"
            >
              <Coffee size={22} /> Donate on {DONATE_PROVIDER === 'our donation page' ? 'our donation page' : DONATE_PROVIDER} <ExternalLink size={18} />
            </a>
          ) : (
            <div className="mx-auto max-w-md rounded-2xl border-2 border-dashed border-stone-300 bg-white p-5 text-[15px] text-stone-600">
              Donations are not open yet. Thank you for thinking of us! You can still help by sharing {APP_NAME} with a teacher friend.
              {import.meta.env.DEV && (
                <p className="mt-3 rounded-lg bg-amber-50 p-2 text-left text-sm text-amber-900">
                  <b>Developer note:</b> set <code className="rounded bg-white px-1">VITE_DONATE_URL</code> (and optionally <code className="rounded bg-white px-1">VITE_DONATE_PROVIDER</code>) in <code className="rounded bg-white px-1">.env.local</code>. See the README.
                </p>
              )}
            </div>
          )}
          {DONATE_URL && <p className="mt-3 text-sm text-stone-500">You will leave this site to donate. Donations are voluntary and handled by {DONATE_PROVIDER}.</p>}
        </div>

        <div className="mx-auto mt-12 grid max-w-2xl gap-4 text-left sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-stone-900"><Heart size={18} className="text-orange-500" /> Where it goes</h2>
            <p className="mt-1.5 text-[15px] text-stone-600">Hosting and the domain name, and time to make new tools and fix problems.</p>
          </div>
          <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-stone-900"><Share2 size={18} className="text-emerald-600" /> Cannot donate?</h2>
            <p className="mt-1.5 text-[15px] text-stone-600">That is completely fine. Telling one colleague about {APP_NAME} helps just as much.</p>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-2xl items-start gap-4 rounded-2xl bg-white p-5 text-left ring-1 ring-black/5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-2xl font-black text-white" aria-hidden>
            {(OPERATOR_NAME || APP_NAME).charAt(0).toUpperCase()}
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-stone-900">Who is behind {APP_NAME}?</h2>
            <p className="mt-1 text-[15px] leading-relaxed text-stone-600">
              {OPERATOR_BIO || `Hi, I'm ${OPERATOR_NAME || 'the maker'} from ${OPERATOR_COUNTRY}. I built ${APP_NAME} to save teachers and parents time, and I keep it free for everyone. Thank you for being here.`}
            </p>
          </div>
        </div>

        <p className="mt-10">
          <Link to="/tools" className="font-extrabold text-emerald-700 underline">Back to the tools</Link>
        </p>
      </section>
    </PageShell>
  )
}
