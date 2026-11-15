import { lazy, Suspense } from 'react'

const ParticleField = lazy(() =>
  import('./particle-field').then((m) => ({ default: m.ParticleField })),
)

type BackdropProps = {
  /** Motif géométrique de fond */
  pattern?: 'grid' | 'dots' | 'none'
  particles?: boolean
  /** Conservé pour compatibilité (plus de halo dégradé) */
  glow?: boolean
  /** Particules toujours en teinte sombre (section sombre quel que soit le thème) */
  forceDark?: boolean
  className?: string
}

/**
 * Arrière-plan décoratif : grille / points masqués, halos radiaux maîtrisés
 * et particules optionnelles (chargées à la demande).
 */
export function Backdrop({ pattern = 'grid', particles = false, forceDark = false, className = '' }: BackdropProps) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {pattern === 'grid' && <div className="bg-grid mask-radial absolute inset-0" />}
      {pattern === 'dots' && <div className="bg-dots mask-radial absolute inset-0" />}
      {particles && (
        <Suspense fallback={null}>
          <div className="absolute inset-0">
            <ParticleField forceDark={forceDark} />
          </div>
        </Suspense>
      )}
    </div>
  )
}

/** Indicateur de chargement plein bloc. */
export function LoadingBlock({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-4 py-20 text-sm text-slate-500 dark:text-slate-400">
      <span className="relative flex size-10 items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-slate-200 dark:border-white/10" />
        <span className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-brand-600" />
      </span>
      {label}
    </div>
  )
}
