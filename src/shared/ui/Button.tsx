import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Variant = 'primary' | 'ghost' | 'outline' | 'accent'
type Size = 'sm' | 'md' | 'lg'

const base = `
  group relative isolate inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full
  font-medium tracking-tight whitespace-nowrap
  transition-[transform,box-shadow,background-color,color,border-color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
  active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40
  aria-disabled:pointer-events-none aria-disabled:opacity-40
  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua-400
`

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-[15px]',
}

const variants: Record<Variant, string> = {
  primary: `
    bg-slate-950 text-white shadow-[0_1px_2px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.12)]
    hover:bg-slate-800 hover:shadow-[0_8px_24px_-8px_rgba(15,23,42,0.45),inset_0_1px_0_rgba(255,255,255,0.12)]
    dark:bg-white dark:text-night-950 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]
    dark:hover:bg-slate-100 dark:hover:shadow-[0_8px_32px_-8px_rgba(45,212,191,0.45)]
  `,
  accent: `
    bg-brand-600 text-white shadow-[0_1px_2px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.18)]
    hover:bg-brand-500 hover:shadow-[0_10px_30px_-10px_rgba(58,79,224,0.7)]
  `,
  ghost: `
    bg-slate-900/[0.04] text-slate-900 ring-1 ring-inset ring-slate-900/[0.06] hover:bg-slate-900/[0.07]
    dark:bg-white/[0.05] dark:text-slate-100 dark:ring-white/[0.08] dark:hover:bg-white/[0.09]
  `,
  outline: `
    bg-transparent text-slate-900 ring-1 ring-inset ring-slate-900/15 hover:bg-slate-900/[0.03] hover:ring-slate-900/30
    dark:text-slate-100 dark:ring-white/15 dark:hover:bg-white/[0.04] dark:hover:ring-white/30
  `,
}

type CommonProps = {
  variant?: Variant
  size?: Size
  trailing?: ReactNode
  leading?: ReactNode
  className?: string
  children?: ReactNode
}

function classes(variant: Variant, size: Size, className: string) {
  return `${base} ${sizes[size]} ${variants[variant]} ${className}`
}

function Inner({ variant, leading, trailing, children }: CommonProps & { variant: Variant }) {
  return (
    <>
      {/* Reflet au survol */}
      {(variant === 'primary' || variant === 'accent') && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full dark:via-aqua-200/40"
        />
      )}
      {leading ? <span className="inline-flex shrink-0">{leading}</span> : null}
      <span>{children}</span>
      {trailing ? (
        <span className="inline-flex shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
          {trailing}
        </span>
      ) : null}
    </>
  )
}

export function Button({
  className = '',
  variant = 'primary',
  size = 'md',
  children,
  trailing,
  leading,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & CommonProps) {
  return (
    <button type={type} className={classes(variant, size, className)} {...props}>
      <Inner variant={variant} leading={leading} trailing={trailing}>
        {children}
      </Inner>
    </button>
  )
}

/** Lien stylé comme un bouton (évite d'imbriquer <button> dans <a>). */
export function ButtonLink({
  className = '',
  variant = 'primary',
  size = 'md',
  children,
  trailing,
  leading,
  disabled,
  ...props
}: LinkProps & CommonProps & { disabled?: boolean }) {
  return (
    <Link
      className={classes(variant, size, className)}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      {...props}
    >
      <Inner variant={variant} leading={leading} trailing={trailing}>
        {children}
      </Inner>
    </Link>
  )
}

export function ButtonAnchor({
  className = '',
  variant = 'primary',
  size = 'md',
  children,
  trailing,
  leading,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & CommonProps) {
  return (
    <a className={classes(variant, size, className)} {...props}>
      <Inner variant={variant} leading={leading} trailing={trailing}>
        {children}
      </Inner>
    </a>
  )
}
