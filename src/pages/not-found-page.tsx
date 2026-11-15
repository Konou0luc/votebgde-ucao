import { motion } from 'framer-motion'
import { House, ArrowLeft } from '@phosphor-icons/react'
import { Backdrop } from '../shared/ui/backdrop'
import { Button, ButtonLink } from '../shared/ui/Button'
import { EASE_OUT } from '../shared/ui/motion-presets'

export function NotFoundPage() {
  return (
    <div className="relative isolate flex min-h-[80dvh] w-full flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
      <Backdrop pattern="grid" particles />

      <div className="relative z-10 flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="block bg-gradient-to-b from-slate-950 to-slate-400 bg-clip-text font-mono text-[8rem] font-medium leading-none tracking-tighter text-transparent dark:from-white dark:to-white/20 sm:text-[11rem]"
        >
          404
        </motion.span>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT }}
          className="mt-4 space-y-3"
        >
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Page introuvable</h1>
          <p className="mx-auto max-w-[46ch] text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Le lien que vous avez suivi est peut-être rompu ou la page a été retirée. Pas d'inquiétude, vous pouvez
            facilement retrouver votre chemin.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: EASE_OUT }}
          className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
        >
          <ButtonLink to="/" size="lg" leading={<House size={16} />}>
            Retour à l'accueil
          </ButtonLink>
          <Button variant="ghost" size="lg" onClick={() => window.history.back()} leading={<ArrowLeft size={16} />}>
            Page précédente
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
