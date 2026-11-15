import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from '@phosphor-icons/react'
import { Backdrop } from '../shared/ui/backdrop'
import { EASE_OUT } from '../shared/ui/motion-presets'

const STEPS = [
  { path: '/vote', label: 'Identification' },
  { path: '/vote/otp', label: 'Vérification' },
  { path: '/vote/liste', label: 'Choix' },
  { path: '/vote/confirmation', label: 'Confirmation' },
]

function currentStepIndex(pathname: string) {
  const clean = pathname.replace(/\/+$/, '') || '/vote'
  const idx = STEPS.findIndex((s) => s.path === clean)
  return idx === -1 ? 0 : idx
}

function Stepper({ current }: { current: number }) {
  return (
    <nav aria-label="Étapes du vote" className="mx-auto mb-8 w-full max-w-xl md:mb-10">
      <ol className="flex items-center">
        {STEPS.map((step, i) => {
          const done = i < current
          const active = i === current
          return (
            <li key={step.path} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <span
                  aria-current={active ? 'step' : undefined}
                  className={`flex size-8 items-center justify-center rounded-full text-xs font-medium transition-all duration-500 ${
                    done
                      ? 'bg-brand-600 text-white'
                      : active
                        ? 'bg-white text-brand-700 ring-2 ring-brand-600 dark:bg-night-900 dark:text-white dark:ring-brand-400'
                        : 'bg-white text-slate-400 ring-1 ring-inset ring-slate-200 dark:bg-night-900 dark:ring-white/10'
                  }`}
                >
                  {done ? <Check size={14} weight="bold" /> : i + 1}
                </span>
                <span
                  className={`hidden text-xs sm:block ${
                    active ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="relative mx-2 mb-0 h-px flex-1 bg-slate-200 dark:bg-white/10 sm:mb-6">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-brand-600"
                    initial={false}
                    animate={{ width: done ? '100%' : '0%' }}
                    transition={{ duration: 0.6, ease: EASE_OUT }}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>
      <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400 sm:sr-only" aria-live="polite">
        Étape {current + 1} sur {STEPS.length} :{' '}
        <span className="font-medium text-slate-900 dark:text-white">{STEPS[current].label}</span>
      </p>
    </nav>
  )
}

export function StudentVotePage() {
  const location = useLocation()
  const current = currentStepIndex(location.pathname)

  return (
    <div className="relative isolate flex min-h-[calc(100dvh-6rem)] justify-center px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <Backdrop pattern="dots" />

      <div className="relative z-10 w-full max-w-5xl">
        <Stepper current={current} />
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
          className="w-full"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  )
}
