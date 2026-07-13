import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'

export function StudentVotePage() {
  return (
    <main className="relative min-h-[calc(100dvh-64px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-white dark:bg-night-950 transition-colors duration-500">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-brand-500/5 blur-[120px] dark:bg-brand-600/10 rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] as const }}
          className="w-full"
        >
          <Outlet />
        </motion.div>
      </div>
    </main>
  )
}
