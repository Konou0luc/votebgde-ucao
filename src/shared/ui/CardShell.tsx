import { type HTMLAttributes, type ReactNode } from 'react'

export function CardShell({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`
        h-full rounded-[2rem] bg-white p-6 
        border border-slate-100 dark:border-white/5 
        dark:bg-night-900/50 backdrop-blur-sm
        shadow-sm transition-all duration-500
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
