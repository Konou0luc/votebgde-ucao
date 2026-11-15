import type { Variants } from 'framer-motion'

export const EASE_OUT = [0.16, 1, 0.3, 1] as const
export const EASE_PREMIUM = [0.32, 0.72, 0, 1] as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: EASE_OUT } },
}

export const stagger = (step = 0.07, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
})

