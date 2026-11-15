import { lazy, Suspense } from 'react'

const ParticleField = lazy(() =>
  import('./particle-field').then((m) => ({ default: m.ParticleField })),
)

type BackdropProps = {
  /** Motif géométrique de fond */
  pattern?: 'grid' | 'dots' | 'none'
  particles?: boolean
  /** Halo lumineux (dégradés radiaux) */
  glow?: boolean
  /** Particules toujours en teinte sombre (section sombre quel que soit le thème) */
  forceDark?: boolean
  className?: string
}

/**
 * Arrière-plan décoratif : grille / points masqués, halos radiaux maîtrisés
 * et particules optionnelles (chargées à la demande).
 */
export function Backdrop({ pattern = 'grid', particles = false, glow = true, forceDark = false, className = '' }: BackdropProps) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {glow && (
        <>
          <div className="absolute left-1/2 top-[-18rem] h-[36rem] w-[60rem] max-w-[140vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(76,103,242,0.16),transparent)] dark:bg-[radial-gradient(closest-side,rgba(76,103,242,0.22),transparent)]" />
          <div className="absolute right-[-10rem] top-[8rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,rgba(45,212,191,0.12),transparent)] dark:bg-[radial-gradient(closest-side,rgba(45,212,191,0.14),transparent)]" />
        </>
      )}
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
        <span className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-aqua-500" />
      </span>
      {label}
    </div>
  )
}
