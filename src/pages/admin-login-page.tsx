import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Navigate, useNavigate } from 'react-router-dom'
import { BadgeCheck, Eye, EyeOff, KeyRound, Loader2, Lock, Mail } from 'lucide-react'
import campusVisual from '../../assets/ucao-l1.jpeg'
import { getAdminErrorMessage } from '../modules/admin-dashboard/api'
import { useAdminAuthStore } from '../modules/admin-dashboard/auth-store'
import { useAdminLoginMutation, useAdminLoginVerifyMutation } from '../modules/admin-dashboard/hooks'
import { ADMIN_PRIVATE_PATH } from '../shared/constants/routes'

type LoginStep = 'credentials' | 'otp'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const token = useAdminAuthStore((s) => s.accessToken)
  const setSession = useAdminAuthStore((s) => s.setSession)
  const loginMutation = useAdminLoginMutation()
  const verifyMutation = useAdminLoginVerifyMutation()

  const [step, setStep] = useState<LoginStep>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otpSessionToken, setOtpSessionToken] = useState('')
  const [emailMasked, setEmailMasked] = useState('')
  const [debugOtp, setDebugOtp] = useState<string | undefined>()
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (token) {
    return <Navigate replace to={ADMIN_PRIVATE_PATH} />
  }

  function goBackToCredentials() {
    setStep('credentials')
    setOtpSessionToken('')
    setEmailMasked('')
    setDebugOtp(undefined)
    setOtp('')
    setError(null)
  }

  async function onSubmitCredentials(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const cleanEmail = email.trim()
    if (!cleanEmail || !password) {
      setError('Renseignez l’email et le mot de passe.')
      return
    }
    try {
      const data = await loginMutation.mutateAsync({
        email: cleanEmail,
        password,
      })
      setOtpSessionToken(data.otpSessionToken)
      setEmailMasked(data.emailMasked)
      setDebugOtp(data.debugOtp)
      setOtp('')
      setStep('otp')
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Connexion impossible.'))
    }
  }

  async function onSubmitOtp(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const clean = otp.replace(/\D/g, '').slice(0, 6)
    if (clean.length !== 6) {
      setError('Saisissez le code à 6 chiffres reçu par email.')
      return
    }
    try {
      const data = await verifyMutation.mutateAsync({
        otpSessionToken,
        otp: clean,
      })
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        admin: data.admin,
      })
      navigate(ADMIN_PRIVATE_PATH, { replace: true })
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Vérification impossible.'))
    }
  }

  const pending = loginMutation.isPending || verifyMutation.isPending

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white dark:bg-slate-950 md:grid md:grid-cols-2">
      {/* Header Image Section */}
      <div className="relative h-[42vh] shrink-0 md:h-auto md:min-h-[100dvh]">
        <img
          src={campusVisual}
          alt="Campus universitaire — environnement institutionnel VoteBGDE"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/90 md:bg-gradient-to-br md:from-slate-950/80 md:via-slate-900/40 md:to-blue-950/60"
          aria-hidden
        />
        
        {/* Mobile Header Overlay Content */}
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium tracking-widest text-white/90 backdrop-blur-md ring-1 ring-white/20">
              ESPACE ADMINISTRATION
            </span>
            <h1 className="mt-4 max-w-[18ch] text-3xl font-bold leading-[1.1] tracking-tight text-white md:max-w-[36ch] md:text-4xl lg:text-5xl">
              Pilotage institutionnel <span className="text-blue-400">du vote</span>
            </h1>
            <p className="mt-4 hidden max-w-[42ch] text-sm leading-relaxed text-white/70 md:block lg:text-base">
              Accès réservé aux rôles autorisés. Les votes et la publication des résultats sont tracés et audités de bout en bout.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Form Section */}
      <div className="relative -mt-6 flex flex-1 flex-col justify-center rounded-t-[2.5rem] bg-white px-6 pt-10 pb-12 dark:bg-slate-950 md:mt-0 md:rounded-none md:px-10 md:py-12 lg:px-16">
        <div className="mx-auto w-full max-w-[420px]">
          {step === 'credentials' ? (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-blue-600/5 ring-1 ring-blue-600/10">
                  <BadgeCheck className="size-6 text-blue-600" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                  Administration
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Identifiez-vous pour gérer les scrutins en cours.
                </p>
              </div>

              <form onSubmit={onSubmitCredentials} className="space-y-6">
                <div className="space-y-4">
                  <div className="group space-y-2">
                    <label
                      htmlFor="admin-email"
                      className="ml-1 text-[11px] font-bold uppercase tracking-widest text-slate-400 transition-colors group-focus-within:text-blue-600"
                    >
                      Email professionnel
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                      <input
                        id="admin-email"
                        type="email"
                        placeholder="nom@institution.edu"
                        value={email}
                        onChange={(ev) => setEmail(ev.target.value)}
                        className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900"
                      />
                    </div>
                  </div>

                  <div className="group space-y-2">
                    <label
                      htmlFor="admin-password"
                      className="ml-1 text-[11px] font-bold uppercase tracking-widest text-slate-400 transition-colors group-focus-within:text-blue-600"
                    >
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                      <input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(ev) => setPassword(ev.target.value)}
                        className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50/50 pl-12 pr-12 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none dark:hover:text-slate-200"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="size-5" strokeWidth={1.5} />
                        ) : (
                          <Eye className="size-5" strokeWidth={1.5} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-sm text-rose-600 dark:border-rose-900/30 dark:bg-rose-950/30 dark:text-rose-400"
                  >
                    <div className="size-1.5 shrink-0 rounded-full bg-rose-500" />
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="group relative h-14 w-full overflow-hidden rounded-2xl bg-slate-950 text-sm font-bold text-white transition-all hover:bg-slate-900 active:scale-[0.98] disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <div className="relative flex items-center justify-center gap-2">
                    {loginMutation.isPending ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <>
                        Continuer
                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-white/10 transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </>
                    )}
                  </div>
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-blue-600/5 ring-1 ring-blue-600/10">
                  <KeyRound className="size-6 text-blue-600" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                  Code de sécurité
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Saisissez le code envoyé à <span className="font-semibold text-slate-900 dark:text-white">{emailMasked}</span>
                </p>
              </div>

              <form onSubmit={onSubmitOtp} className="space-y-6">
                <div className="space-y-4">
                  <div className="group space-y-2">
                    <label
                      htmlFor="admin-otp"
                      className="ml-1 text-[11px] font-bold uppercase tracking-widest text-slate-400 transition-colors group-focus-within:text-blue-600"
                    >
                      Code à 6 chiffres
                    </label>
                    <input
                      id="admin-otp"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={otp}
                      onChange={(ev) => setOtp(ev.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000 000"
                      className="h-16 w-full rounded-2xl border border-slate-100 bg-slate-50/50 text-center font-mono text-3xl tracking-[0.5em] font-bold outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900"
                    />
                  </div>

                  {debugOtp && (
                    <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-center font-mono text-xs text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/30 dark:text-amber-400">
                      DEBUG: {debugOtp}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-sm text-rose-600 dark:border-rose-900/30 dark:bg-rose-950/30 dark:text-rose-400">
                    <div className="size-1.5 shrink-0 rounded-full bg-rose-500" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="group relative h-14 w-full overflow-hidden rounded-2xl bg-slate-950 text-sm font-bold text-white transition-all hover:bg-slate-900 active:scale-[0.98] disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <div className="relative flex items-center justify-center gap-2">
                    {verifyMutation.isPending ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <>
                        Vérifier et accéder
                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-white/10 transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={goBackToCredentials}
                  className="w-full text-center text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-blue-600"
                >
                  Retour à l'identification
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
