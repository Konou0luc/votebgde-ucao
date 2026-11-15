import { useRef, type HTMLAttributes, type PointerEvent } from 'react'

/**
 * Carte avec halo qui suit le curseur. Les coordonnées sont posées en
 * variables CSS (pas de re-rendu React).
 */
export function SpotlightCard({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null)

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={`group/spot relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft transition-[border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-slate-300 hover:shadow-lift dark:border-white/[0.07] dark:bg-night-900/60 dark:hover:border-white/15 ${className}`}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          background:
            'radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(45,212,191,0.10), transparent 45%)',
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  )
}
