import { type ReactNode } from 'react'
import { Backdrop } from './backdrop'

/**
 * Section d'en-tête plein écran : grille masquée, halos radiaux,
 * particules interactives et fondu vers la section suivante.
 */
export function HeroSection({
  children,
  className = '',
  particles = true,
}: {
  children: ReactNode
  className?: string
  particles?: boolean
}) {
  return (
    <section className={`relative isolate overflow-hidden ${className}`}>
      <Backdrop pattern="grid" particles={particles} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#fafbfd] dark:to-night-950"
      />
      <div className="relative z-10">{children}</div>
    </section>
  )
}
