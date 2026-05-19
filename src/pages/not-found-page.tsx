import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { useSiteTheme } from '../shared/ui/site-theme'

export function NotFoundPage() {
  const { theme } = useSiteTheme()
  const isDark = theme === 'dark'

  return (
    <main className="relative flex min-h-[80dvh] w-full flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Background Decorative Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full blur-[120px] ${isDark ? 'bg-blue-600/10' : 'bg-blue-50'}`} />
        <div className={`absolute -right-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full blur-[120px] ${isDark ? 'bg-indigo-600/10' : 'bg-indigo-50'}`} />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-12"
        >
          {/* Main 404 Display */}
          <div className="relative">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`block text-[10rem] font-black leading-none tracking-tighter sm:text-[14rem] ${
                isDark 
                  ? 'bg-gradient-to-b from-blue-400 to-blue-600 bg-clip-text text-transparent' 
                  : 'bg-gradient-to-b from-blue-600 to-blue-800 bg-clip-text text-transparent'
              }`}
            >
              404
            </motion.span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="space-y-4"
        >
          <h1 className={`text-4xl font-bold tracking-tight sm:text-5xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Page introuvable
          </h1>
          <p className={`mx-auto max-w-[46ch] text-lg leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Le lien que vous avez suivi est peut-être rompu ou la page a été retirée. 
            Pas d'inquiétude, vous pouvez facilement retrouver votre chemin.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          <Link
            to="/"
            className="group relative inline-flex min-h-[3.5rem] items-center justify-center gap-3 overflow-hidden rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/20 active:scale-[0.98]"
          >
            <Home size={20} className="transition-transform group-hover:-translate-y-0.5" />
            Retour à l'accueil
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className={`group inline-flex min-h-[3.5rem] items-center justify-center gap-3 rounded-2xl border px-8 py-4 text-base font-bold transition-all active:scale-[0.98] ${
              isDark
                ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500 hover:bg-slate-800'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
            Page précédente
          </button>
        </motion.div>

        {/* Support link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className={`mt-16 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
        >
          Besoin d'aide ? <Link to="/contact" className="text-blue-500 hover:underline">Contactez le support</Link>
        </motion.p>
      </div>
    </main>
  )
}
