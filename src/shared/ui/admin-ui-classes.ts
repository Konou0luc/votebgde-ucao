/** Classes partagées de la console d'administration. */

export const adminInput =
  'tt-field-outline h-11 w-full rounded-lg px-3.5 py-0 text-[15px] disabled:cursor-not-allowed disabled:opacity-60'

export const adminTextarea = 'tt-field-outline w-full rounded-lg px-3 py-2.5 text-[15px] leading-relaxed'

export const adminSelect = `${adminInput} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2394a3b8' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9`

export const tableWrap = '-mx-5 overflow-x-auto sm:-mx-6'
export const table = 'w-full min-w-[640px] border-separate border-spacing-0 text-[15px]'
export const th =
  'border-b border-slate-200/80 bg-slate-50/80 px-5 py-3 text-left text-[13px] font-medium text-slate-500 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6 dark:border-white/[0.07] dark:bg-white/[0.02] dark:text-slate-400'
export const td =
  'border-b border-slate-100 px-5 py-4 align-middle text-slate-700 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6 dark:border-white/[0.05] dark:text-slate-300'
export const tr = '[&:last-child>td]:border-b-0'
/** Ligne cliquable (ouvre une page) : seule à réagir au survol. */
export const trClickable = `${tr} cursor-pointer transition-colors hover:bg-slate-50/70 dark:hover:bg-white/[0.02]`

export const STATUS_TONES: Record<string, { dot: string; badge: string }> = {
  OPEN: {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
  },
  SCHEDULED: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300',
  },
  CLOSED: {
    dot: 'bg-brand-500',
    badge: 'bg-brand-500/10 text-brand-700 ring-brand-500/20 dark:text-brand-300',
  },
  DRAFT: {
    dot: 'bg-slate-400',
    badge: 'bg-slate-500/10 text-slate-600 ring-slate-500/20 dark:text-slate-300',
  },
  ARCHIVED: {
    dot: 'bg-slate-300 dark:bg-slate-600',
    badge: 'bg-slate-500/[0.06] text-slate-500 ring-slate-500/15 dark:text-slate-400',
  },
}

const dateTimeFmt = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

export function formatDateTime(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : dateTimeFmt.format(d)
}

export function formatDate(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : dateFmt.format(d)
}

export function formatNumber(n: number, digits = 0) {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: digits, minimumFractionDigits: digits })
}
