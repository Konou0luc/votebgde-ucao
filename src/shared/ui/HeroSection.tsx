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
      <div className="relative z-10">{children}</div>
    </section>
  )
}
