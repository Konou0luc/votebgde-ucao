import { motion, type HTMLMotionProps } from 'framer-motion'
import { EASE_OUT, fadeUp, stagger } from './motion-presets'

type RevealProps = HTMLMotionProps<'div'> & {
  delay?: number
  /** Animer au chargement plutôt qu'à l'entrée dans le viewport */
  immediate?: boolean
}

/** Apparition progressive (fondu + léger déplacement), une seule fois. */
export function Reveal({ delay = 0, immediate = false, children, ...props }: RevealProps) {
  const trigger = immediate
    ? { animate: 'show' as const }
    : { whileInView: 'show' as const, viewport: { once: true, margin: '0px 0px -10% 0px' } }
  return (
    <motion.div
      initial="hidden"
      {...trigger}
      variants={{
        hidden: fadeUp.hidden,
        show: { ...(fadeUp.show as object), transition: { duration: 0.7, ease: EASE_OUT, delay } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/** Conteneur qui échelonne l'apparition de ses enfants `RevealItem`. */
export function RevealGroup({
  step = 0.07,
  delay = 0,
  immediate = false,
  children,
  ...props
}: HTMLMotionProps<'div'> & { step?: number; delay?: number; immediate?: boolean }) {
  const trigger = immediate
    ? { animate: 'show' as const }
    : { whileInView: 'show' as const, viewport: { once: true, margin: '0px 0px -10% 0px' } }
  return (
    <motion.div initial="hidden" {...trigger} variants={stagger(step, delay)} {...props}>
      {children}
    </motion.div>
  )
}

export function RevealItem({ children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div variants={fadeUp} {...props}>
      {children}
    </motion.div>
  )
}
