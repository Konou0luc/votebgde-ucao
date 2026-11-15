import { type HTMLAttributes, type ReactNode } from 'react'

export function CardShell({
  children,
  className = '',
  interactive = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; interactive?: boolean }) {
  return (
    <div
      className={`
        relative h-full rounded-2xl border border-slate-200/80 bg-white p-6
        shadow-soft
        dark:border-white/[0.07] dark:bg-night-900/60 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
        ${interactive ? 'surface-interactive' : 'transition-colors duration-500'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
