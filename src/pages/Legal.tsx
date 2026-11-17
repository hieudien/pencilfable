import type { ReactNode } from 'react'
import { APP_NAME, OPERATOR_COUNTRY, OPERATOR_NAME, SUPPORT_EMAIL } from '../config'
import { usePageMeta } from '../lib/router'
import { PageShell } from '../components/SiteChrome'

/*
 * Plain-language starting points that describe how this app really works today.
 * They are NOT legal advice. Before you launch: have a lawyer in your country review them, add your name (or
 * organisation) and a contact address, and update them if you add analytics, ads, accounts or cookies.
 */

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mt-8">
    <h2 className="text-xl font-extrabold text-stone-900">{title}</h2>
    <div className="mt-2 space-y-3 text-[16px] leading-relaxed text-stone-700">{children}</div>
  </section>
)

const contact = SUPPORT_EMAIL ? (
  <>
    Write to <a className="font-bold text-emerald-700 underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
  </>
) : (
  <>Use the contact details on our website.</>
)

const operator = (
  <>
    {APP_NAME} is operated{OPERATOR_NAME ? <> by {OPERATOR_NAME}</> : null} from {OPERATOR_COUNTRY}.
  </>
)

function Privacy() {
  return (
    <>
      <h1 className="text-4xl font-black tracking-tight text-stone-900">Privacy</h1>
      <p className="mt-3 text-lg text-stone-600">The short version: {APP_NAME} runs in your browser. The names and words you type stay on your computer.</p>

      <Section title="What stays on your computer">
        <p>Everything you type into a tool (word lists, class names, questions) is used only inside your browser to make the page. We do not receive it, and it is not stored on a server.</p>
        <p>To save you typing again, the app remembers your settings and your last lists in your browser&apos;s local storage. This is only used to make the tools work the way you left them. You can clear it any time by clearing your browser&apos;s site data.</p>
      </Section>

      <Section title="What we do not do">
        <p>We do not ask you to create an account, we do not show advertising, and we do not use advertising trackers or profiling. We do not collect, store or sell the content you type into the tools.</p>
      </Section>

      <Section title="Technical data from our hosting provider">
        <p>Like any website, the company that hosts this site may process technical data, such as your IP address and the pages requested, to deliver the site, keep it secure and measure overall traffic. We do not use this to identify you. This is covered by that provider&apos;s own privacy policy.</p>
      </Section>

      <Section title="Donations and other sites">
        <p>If you choose to donate, you leave this site and pay through a third-party donation service. That service collects your payment and contact details under its own privacy policy. We never see your card number. Links to other sites are provided for convenience; we are not responsible for their content or privacy practices.</p>
      </Section>

      <Section title="Children">
        <p>{APP_NAME} is a tool for adults who teach or parent. It is not directed at children, and it does not ask anyone for personal information. Student names you type are never sent to us.</p>
      </Section>

      <Section title="Changes">
        <p>If we ever change how data is handled (for example by adding analytics), we will update this page before the change takes effect.</p>
      </Section>

      <Section title="Who we are">
        <p>{operator} {contact}</p>
      </Section>
    </>
  )
}

function Terms() {
  return (
    <>
      <h1 className="text-4xl font-black tracking-tight text-stone-900">Terms of use</h1>
      <p className="mt-3 text-lg text-stone-600">Plain-language terms for using {APP_NAME}. By using the site you agree to them.</p>

      <Section title="Using the tools">
        <p>{APP_NAME} is free to use. You may make and print pages for your classroom, your homeschool or your own children. The pages you make with your own words and questions are yours to use.</p>
        <p>Please do not copy, resell or redistribute the {APP_NAME} software itself, and do not use the tools to make content that is unlawful or harmful.</p>
      </Section>

      <Section title="Provided as is (disclaimer)">
        <p>{APP_NAME} is provided free of charge, “as is” and “as available”, without warranties of any kind, express or implied, including any warranty of accuracy, fitness for a particular purpose, availability or non-infringement.</p>
        <p>We work hard to make every puzzle, answer key and printout correct, but mistakes can happen. Always check answer keys, puzzles and printouts yourself before giving them to students or children. The tools are teaching aids, not a substitute for your professional judgment, and we make no promise about learning results.</p>
        <p>We may change, pause or remove any tool or feature at any time, and the site may be unavailable from time to time.</p>
      </Section>

      <Section title="Limitation of liability">
        <p>To the fullest extent permitted by law, {APP_NAME} and the people who run it are not liable for any loss or damage arising from the use of, or inability to use, the site or the pages you make with it, including indirect or consequential loss, lost data or lost time.</p>
        <p>Nothing in these terms excludes or limits liability that cannot be excluded by law, and nothing affects any consumer rights you have that cannot be waived.</p>
      </Section>

      <Section title="Safety">
        <p>Some activities (such as the dice you cut and fold) use scissors or glue. Children should be supervised by an adult. You are responsible for the safe use of any printed material and activity.</p>
      </Section>

      <Section title="Donations">
        <p>Donations are voluntary gifts to help keep the site running. They do not buy extra features, support or special rights, because every tool is already free. Donations are not tax-deductible and are not charitable donations unless we clearly say otherwise. Payment terms and refunds are handled by the donation service you choose.</p>
      </Section>

      <Section title="Names and trademarks">
        <p>Game names mentioned on this site are used only to describe common games and activities. All trademarks belong to their respective owners, and {APP_NAME} is not affiliated with or endorsed by them.</p>
      </Section>

      <Section title="Governing law">
        <p>These terms are governed by the laws of {OPERATOR_COUNTRY}, without affecting any mandatory consumer rights you have under the laws of the place where you live.</p>
      </Section>

      <Section title="Changes and contact">
        <p>We may update these terms; the version on this page is the one that applies. {operator} {contact}</p>
      </Section>
    </>
  )
}

export default function Legal({ kind }: { kind: 'privacy' | 'terms' }) {
  usePageMeta(`${kind === 'privacy' ? 'Privacy' : 'Terms of use'} – ${APP_NAME}`)
  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">{kind === 'privacy' ? <Privacy /> : <Terms />}</article>
    </PageShell>
  )
}
