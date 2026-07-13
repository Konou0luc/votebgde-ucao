import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

export function HeroSection({
  children,
  className = '',
  imageSrc,
}: {
  children: ReactNode
  className?: string
  imageSrc?: string
}) {
  return (
    <div className={`relative min-h-[min(100dvh,900px)] overflow-hidden bg-white dark:bg-night-950 ${className}`}>
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {imageSrc ? (
          <>
            <div 
              className="absolute inset-0 h-full w-full bg-cover bg-center transition-transform duration-[10s] scale-105"
              style={{ backgroundImage: `url(${imageSrc})` }}
            />
            {/* Overlay bleu foncé semi-transparent sans flou */}
            <div className="absolute inset-0 bg-brand-950/65 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-b from-brand-950/40 via-transparent to-brand-950/80" />
          </>
        ) : (
          <>
            <motion.div
              className="absolute -left-24 -top-24 h-[500px] w-[500px] rounded-full bg-brand-500/5 blur-[120px] dark:bg-brand-600/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
            />
            <motion.div
              className="absolute -right-24 bottom-1/4 h-[600px] w-[600px] rounded-full bg-brand-400/5 blur-[140px] dark:bg-brand-500/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, delay: 0.5 }}
            />
          </>
        )}
      </div>

      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}
