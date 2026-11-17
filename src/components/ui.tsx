import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { AlertTriangle, Minus, Plus } from 'lucide-react'

export function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <h3 className="text-[13px] font-extrabold uppercase tracking-wider text-stone-500">{title}</h3>
      {hint && <p className="mt-1 text-sm text-stone-500">{hint}</p>}
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  )
}

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <div className="text-[15px] font-bold text-stone-800">{children}</div>
      {hint && <div className="text-sm text-stone-500">{hint}</div>}
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border-2 border-stone-300 bg-white px-3 py-2.5 text-base text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100'

export function TextInput({
  label, hint, value, onChange, placeholder, maxLength,
}: { label: string; hint?: string; value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number }) {
  return (
    <label className="block">
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <input className={inputCls} value={value} placeholder={placeholder} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

export function TextArea({
  label, hint, value, onChange, rows = 6, placeholder,
}: { label: string; hint?: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <label className="block">
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <textarea className={inputCls + ' resize-y leading-relaxed'} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

export function Segmented<T extends string | number>({
  label, hint, value, options, onChange,
}: { label: string; hint?: string; value: T; options: { value: T; label: ReactNode }[]; onChange: (v: T) => void }) {
  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div className="flex flex-wrap gap-1.5 rounded-xl bg-stone-100 p-1.5" role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={String(o.value)}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={
                'min-w-[3rem] flex-1 rounded-lg px-3 py-2 text-[15px] font-bold transition ' +
                (active ? 'bg-white text-emerald-700 shadow ring-1 ring-emerald-200' : 'text-stone-600 hover:bg-white/60')
              }
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Stepper({
  label, hint, value, min, max, step = 1, onChange,
}: { label: string; hint?: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, v)))
  const btn =
    'flex h-11 w-11 items-center justify-center rounded-xl border-2 border-stone-300 bg-white text-stone-700 hover:border-emerald-400 hover:text-emerald-700 disabled:opacity-40'
  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} aria-label={`Less ${label}`} disabled={value <= min} onClick={() => set(value - step)}>
          <Minus size={18} />
        </button>
        <input
          className={inputCls + ' w-20 text-center font-bold'}
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            const n = parseInt(e.target.value.replace(/\D/g, ''), 10)
            if (Number.isFinite(n)) set(n)
          }}
        />
        <button type="button" className={btn} aria-label={`More ${label}`} disabled={value >= max} onClick={() => set(value + step)}>
          <Plus size={18} />
        </button>
      </div>
    </div>
  )
}

export function Toggle({
  label, description, checked, onChange,
}: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-3 rounded-xl text-left">
      <span>
        <span className="block text-[15px] font-bold text-stone-800">{label}</span>
        {description && <span className="block text-sm text-stone-500">{description}</span>}
      </span>
      <span className={'relative h-7 w-12 shrink-0 rounded-full transition ' + (checked ? 'bg-emerald-500' : 'bg-stone-300')}>
        <span className={'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ' + (checked ? 'left-[1.375rem]' : 'left-0.5')} />
      </span>
    </button>
  )
}

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost'
const variants: Record<Variant, string> = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-900/20',
  accent: 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm shadow-orange-900/20',
  secondary: 'bg-white text-stone-800 border-2 border-stone-300 hover:border-emerald-400 hover:text-emerald-700',
  ghost: 'text-stone-600 hover:bg-stone-100',
}

export function Button({
  variant = 'secondary', icon, children, className = '', ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; icon?: ReactNode }) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-base font-extrabold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {icon}
      {children}
    </button>
  )
}

export function Notice({ children, tone = 'warn' }: { children: ReactNode; tone?: 'warn' | 'info' }) {
  const cls = tone === 'warn' ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-sky-200 bg-sky-50 text-sky-900'
  return (
    <div className={`flex gap-2 rounded-xl border p-3 text-sm ${cls}`}>
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  )
}
