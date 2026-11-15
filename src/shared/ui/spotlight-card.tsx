import type { HTMLAttributes } from 'react'

/** Carte avec bordure qui passe au bleu UCAO au survol. */
export function SpotlightCard({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`group/spot relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft transition-[border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-brand-300 hover:shadow-lift dark:border-white/[0.07] dark:bg-night-900/60 dark:hover:border-brand-400/50 ${className}`}
      {...props}
    >
      <div className="relative h-full">{children}</div>
    </div>
  )
}
