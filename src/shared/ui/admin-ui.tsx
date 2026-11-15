import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, ChevronLeft, ChevronRight, Inbox, Loader2, type LucideIcon } from 'lucide-react'
import { electionStatusLabelFr } from '../utils/election-status-fr'
import { STATUS_TONES } from './admin-ui-classes'

const EASE = [0.16, 1, 0.3, 1] as const

/* ─────────────── Boutons ─────────────── */

type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type BtnSize = 'sm' | 'md'

const btnBase =
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50'

const btnSizes: Record<BtnSize, string> = {
  sm: 'h-9 px-3.5 text-[14px]',
  md: 'h-11 px-4 text-[15px]',
}

const btnVariants: Record<BtnVariant, string> = {
  primary:
    'bg-slate-950 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-slate-800 dark:bg-white dark:text-night-950 dark:hover:bg-slate-200',
  secondary:
    'border border-slate-200 bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.07] dark:hover:text-white',
  danger:
    'border border-rose-200 bg-white text-rose-600 hover:border-rose-300 hover:bg-rose-50 dark:border-rose-500/25 dark:bg-rose-500/[0.06] dark:text-rose-400 dark:hover:bg-rose-500/15',
  ghost:
    'text-slate-600 hover:bg-slate-900/[0.05] hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white',
}

type BtnProps = {
  variant?: BtnVariant
  size?: BtnSize
  icon?: LucideIcon
  loading?: boolean
  className?: string
  children?: ReactNode
}

function BtnInner({ icon: Icon, loading, children }: Pick<BtnProps, 'icon' | 'loading' | 'children'>) {
  return (
    <>
      {loading ? <Loader2 className="size-4 animate-spin" /> : Icon ? <Icon className="size-4" strokeWidth={1.75} /> : null}
      {children}
    </>
  )
}

export function AdminButton({
  variant = 'secondary',
  size = 'md',
  icon,
  loading,
  className = '',
  children,
  type = 'button',
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & BtnProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${btnBase} ${btnSizes[size]} ${btnVariants[variant]} ${className}`}
      {...props}
    >
      <BtnInner icon={icon} loading={loading}>
        {children}
      </BtnInner>
    </button>
  )
}

export function AdminButtonLink({
  variant = 'secondary',
  size = 'md',
  icon,
  className = '',
  children,
  ...props
}: LinkProps & BtnProps) {
  return (
    <Link className={`${btnBase} ${btnSizes[size]} ${btnVariants[variant]} ${className}`} {...props}>
      <BtnInner icon={icon}>{children}</BtnInner>
    </Link>
  )
}

export function IconButton({
  label,
  icon: Icon,
  tone = 'default',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; icon: LucideIcon; tone?: 'default' | 'danger' }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`inline-flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors disabled:opacity-40 ${
        tone === 'danger'
          ? 'hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400'
          : 'hover:bg-slate-900/[0.06] hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-white'
      } ${className}`}
      {...props}
    >
      <Icon className="size-4" strokeWidth={1.75} />
    </button>
  )
}

export function IconLink({
  label,
  icon: Icon,
  className = '',
  ...props
}: LinkProps & { label: string; icon: LucideIcon }) {
  return (
    <Link
      title={label}
      aria-label={label}
      className={`inline-flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-900/[0.06] hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-white ${className}`}
      {...props}
    >
      <Icon className="size-4" strokeWidth={1.75} />
    </Link>
  )
}

/* ─────────────── Structure de page ─────────────── */

export function PageHeader({
  back,
  eyebrow,
  title,
  description,
  meta,
  actions,
}: {
  back?: { to: string; label: string }
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="mb-8">
      {back && (
        <Link
          to={back.to}
          className="group mb-5 inline-flex items-center gap-1.5 text-[15px] text-slate-500 transition-colors hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.75} />
          {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="mb-2 text-[15px] font-medium text-brand-600 dark:text-brand-300">{eyebrow}</p>}
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-[2rem]">{title}</h1>
          {description && (
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
          )}
          {meta && <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-slate-500">{meta}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}

export function Panel({
  title,
  description,
  icon: Icon,
  actions,
  children,
  footer,
  className = '',
  bodyClassName = '',
  delay = 0,
}: {
  title?: ReactNode
  description?: ReactNode
  icon?: LucideIcon
  actions?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
  bodyClassName?: string
  delay?: number
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE, delay }}
      className={`overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-white/[0.07] dark:bg-night-900/60 dark:shadow-none ${className}`}
    >
      {(title || actions) && (
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-white/[0.06]">
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/[0.05] dark:text-slate-300">
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
            )}
            <div className="min-w-0">
              {typeof title === 'string' ? (
                <h2 className="truncate text-[17px] font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h2>
              ) : (
                title
              )}
              {description && <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={`px-5 py-5 sm:px-6 ${bodyClassName}`}>{children}</div>
      {footer && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6 dark:border-white/[0.06] dark:bg-white/[0.015]">
          {footer}
        </div>
      )}
    </motion.section>
  )
}

/* ─────────────── Indicateurs ─────────────── */

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'brand',
  delay = 0,
  children,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: LucideIcon
  accent?: 'brand' | 'crimson' | 'amber' | 'emerald' | 'slate'
  delay?: number
  children?: ReactNode
}) {
  const accents = {
    brand: 'bg-brand-500/10 text-brand-600 dark:text-brand-300',
    crimson: 'bg-crimson-700 text-white',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE, delay }}
      className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-white/[0.07] dark:bg-night-900/60 dark:shadow-none"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[15px] text-slate-500 dark:text-slate-400">{label}</p>
        {Icon && (
          <span className={`flex size-8 items-center justify-center rounded-lg ${accents[accent]}`}>
            <Icon className="size-4" strokeWidth={1.75} />
          </span>
        )}
      </div>
      <p className="mt-3 text-[2rem] font-semibold leading-none tracking-tight tabular-nums text-slate-950 dark:text-white">
        {value}
      </p>
      {hint && <p className="mt-2 text-[13px] text-slate-500 dark:text-slate-400">{hint}</p>}
      {children}
    </motion.div>
  )
}

export function ProgressBar({
  value,
  tone = 'brand',
  className = '',
  delay = 0,
}: {
  value: number
  tone?: 'brand' | 'crimson' | 'slate'
  className?: string
  delay?: number
}) {
  const pct = Math.max(0, Math.min(100, value))
  const tones = {
    brand: 'bg-brand-600 dark:bg-brand-400',
    crimson: 'bg-crimson-500',
    slate: 'bg-slate-300 dark:bg-white/25',
  }
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06] ${className}`}>
      <motion.div
        className={`h-full rounded-full ${tones[tone]}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: EASE, delay }}
      />
    </div>
  )
}

/* ─────────────── Badges ─────────────── */

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONES[status.toUpperCase()] ?? STATUS_TONES.DRAFT
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[13px] font-medium ring-1 ring-inset ${tone.badge}`}
    >
      <span className={`size-1.5 rounded-full ${tone.dot}`} />
      {electionStatusLabelFr(status)}
    </span>
  )
}

const badgeTones = {
  neutral: 'bg-slate-500/[0.08] text-slate-600 ring-slate-500/15 dark:text-slate-300',
  brand: 'bg-brand-500/10 text-brand-700 ring-brand-500/20 dark:text-brand-300',
  crimson: 'bg-crimson-700 text-white ring-crimson-800',
  success: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
  warning: 'bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300',
  danger: 'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300',
}

export function Badge({
  tone = 'neutral',
  icon: Icon,
  children,
  className = '',
}: {
  tone?: keyof typeof badgeTones
  icon?: LucideIcon
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[13px] font-medium ring-1 ring-inset ${badgeTones[tone]} ${className}`}
    >
      {Icon && <Icon className="size-3" strokeWidth={2} />}
      {children}
    </span>
  )
}

/* ─────────────── États ─────────────── */

export function LoadingState({ label = 'Chargement…', compact = false }: { label?: string; compact?: boolean }) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center gap-3 text-[15px] text-slate-500 dark:text-slate-400 ${
        compact ? 'py-10' : 'min-h-[40dvh]'
      }`}
    >
      <Loader2 className="size-5 animate-spin text-slate-400" />
      {label}
    </div>
  )
}

export function ErrorState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-4 text-[15px] text-rose-700 sm:flex-row sm:items-center sm:justify-between dark:text-rose-300"
    >
      <span className="flex items-center gap-2.5">
        <AlertCircle className="size-4 shrink-0" />
        {children}
      </span>
      {action}
    </div>
  )
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon
  title: string
  description?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="flex size-11 items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400 dark:border-white/15">
        <Icon className="size-5" strokeWidth={1.5} />
      </span>
      <p className="mt-4 text-[15px] font-medium text-slate-900 dark:text-white">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[15px] text-slate-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* ─────────────── Formulaires ─────────────── */

export function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
  className = '',
}: {
  label: string
  htmlFor?: string
  hint?: ReactNode
  required?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="block text-[15px] font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-[13px] text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  )
}

export function FormError({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2.5 text-[15px] text-rose-700 dark:text-rose-300"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      {children}
    </div>
  )
}

/* ─────────────── Pagination ─────────────── */

export function Pagination({
  page,
  totalPages,
  onChange,
  from,
  to,
  total,
  unit = 'éléments',
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
  from: number
  to: number
  total: number
  unit?: string
}) {
  return (
    <div className="flex flex-col gap-3 text-[15px] sm:flex-row sm:items-center sm:justify-between">
      <p className="text-slate-500 dark:text-slate-400">
        <span className="font-medium text-slate-900 tabular-nums dark:text-white">
          {from}–{to}
        </span>{' '}
        sur <span className="font-medium text-slate-900 tabular-nums dark:text-white">{total}</span> {unit}
      </p>
      <div className="flex items-center gap-1">
        <AdminButton size="sm" variant="ghost" icon={ChevronLeft} onClick={() => onChange(page - 1)} disabled={page <= 1}>
          Précédent
        </AdminButton>
        <span className="px-2 text-[13px] tabular-nums text-slate-500">
          {page} / {totalPages}
        </span>
        <AdminButton size="sm" variant="ghost" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
          Suivant
          <ChevronRight className="size-4" strokeWidth={1.75} />
        </AdminButton>
      </div>
    </div>
  )
}
