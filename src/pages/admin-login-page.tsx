import { useState } from 'react'
import type { FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { motion } from 'framer-motion'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BadgeCheck, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react'
import campusVisual from '../../assets/ucao-l1.jpeg'
import { getAdminErrorMessage } from '../modules/admin-dashboard/api'
import { useAdminAuthStore } from '../modules/admin-dashboard/auth-store'
import { useAdminLoginMutation, useAdminLoginVerifyMutation } from '../modules/admin-dashboard/hooks'
import { ADMIN_PRIVATE_PATH } from '../shared/constants/routes'
import { OtpInput } from '../shared/ui/otp-input'
import { Backdrop } from '../shared/ui/backdrop'
import { Button } from '../shared/ui/Button'

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

  function goBackToCredentials(nextError: string | null = null) {
    setStep('credentials')
    setOtpSessionToken('')
    setEmailMasked('')
    setDebugOtp(undefined)
    setOtp('')
    setError(nextError)
  }

  function handleExpiredOtp(message?: string) {
    goBackToCredentials(
      message || 'Votre code a expiré. Reconnectez-vous pour en recevoir un nouveau.',
    )
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
      
      if (data.admin.needsPasswordChange) {
        navigate(`${ADMIN_PRIVATE_PATH}/profil`, { replace: true, state: { forcePasswordChange: true } })
      } else {
        navigate(ADMIN_PRIVATE_PATH, { replace: true })
      }
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 410) {
        handleExpiredOtp(getAdminErrorMessage(err, 'Votre code a expiré. Reconnectez-vous pour en recevoir un nouveau.'))
        return
      }
      setError(getAdminErrorMessage(err, 'Vérification impossible.'))
    }
  }

  const pending = loginMutation.isPending || verifyMutation.isPending

  const errorBox = error ? (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-3.5 text-sm text-rose-700 dark:text-rose-300"
    >
      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-rose-500" />
      {error}
    </motion.div>
  ) : null

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#fafbfd] dark:bg-night-950 md:grid md:grid-cols-[1.05fr_1fr]">
      {/* Panneau visuel */}
      <div className="relative isolate h-[38vh] shrink-0 overflow-hidden bg-night-950 md:sticky md:top-0 md:h-[100dvh]">
        <img
          src={campusVisual}
          alt="Campus universitaire — environnement institutionnel VoteBGDE"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-night-950/60 via-night-950/70 to-night-950" aria-hidden />
        <div className="dark">
          <Backdrop pattern="grid" particles forceDark />
        </div>

        <div className="relative flex h-full flex-col justify-end p-6 md:justify-between md:p-12">
          <div className="hidden items-center gap-2.5 md:flex">
            <span className="flex size-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur-md">
              <BadgeCheck className="size-5 text-aqua-300" strokeWidth={1.6} />
            </span>
            <span className="text-sm font-semibold tracking-tight text-white">
              Vote<span className="text-aqua-300">BGDE</span>
            </span>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-aqua-400 shadow-[0_0_8px_rgba(45,212,191,0.9)]" />
              Espace administration
            </span>
            <h1 className="mt-5 max-w-[18ch] text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-white md:text-5xl">
              Pilotage institutionnel{' '}
              <span className="bg-gradient-to-r from-brand-300 to-aqua-300 bg-clip-text text-transparent">du vote</span>
            </h1>
            <p className="mt-5 hidden max-w-[42ch] text-sm leading-relaxed text-slate-400 md:block lg:text-base">
              Accès réservé aux rôles autorisés. Les votes et la publication des résultats sont tracés et audités de bout en bout.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="relative -mt-6 flex flex-1 flex-col justify-center rounded-t-3xl bg-[#fafbfd] px-6 pb-12 pt-10 dark:bg-night-950 md:mt-0 md:rounded-none md:px-10 md:py-12 lg:px-16">
        <div className="mx-auto w-full max-w-[400px]">
          {step === 'credentials' ? (
            <motion.div key="credentials" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
              <div className="space-y-3">
                <div className="inline-flex size-11 items-center justify-center rounded-xl bg-white shadow-soft ring-1 ring-slate-200/80 dark:bg-white/[0.05] dark:ring-white/10">
                  <ShieldCheck className="size-5 text-brand-600 dark:text-aqua-300" strokeWidth={1.6} />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Administration</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Identifiez-vous pour gérer les votes en cours.</p>
              </div>

              <form onSubmit={onSubmitCredentials} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <label htmlFor="admin-email" className="tt-label">Email professionnel</label>
                  <div className="group relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-aqua-500" strokeWidth={1.6} />
                    <input
                      id="admin-email"
                      type="email"
                      autoComplete="email"
                      placeholder="nom@institution.edu"
                      value={email}
                      onChange={(ev) => setEmail(ev.target.value)}
                      className="tt-field-outline h-12 w-full rounded-xl pl-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="admin-password" className="tt-label">Mot de passe</label>
                  <div className="group relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-aqua-500" strokeWidth={1.6} />
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(ev) => setPassword(ev.target.value)}
                      className="tt-field-outline h-12 w-full rounded-xl pl-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="size-4" strokeWidth={1.6} /> : <Eye className="size-4" strokeWidth={1.6} />}
                    </button>
                  </div>
                </div>

                {errorBox}

                <Button
                  type="submit"
                  size="lg"
                  disabled={pending}
                  className="w-full"
                  trailing={loginMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                >
                  {loginMutation.isPending ? 'Connexion…' : 'Continuer'}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="otp" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
              <div className="space-y-3">
                <div className="inline-flex size-11 items-center justify-center rounded-xl bg-white shadow-soft ring-1 ring-slate-200/80 dark:bg-white/[0.05] dark:ring-white/10">
                  <KeyRound className="size-5 text-brand-600 dark:text-aqua-300" strokeWidth={1.6} />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Code de sécurité</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Saisissez le code envoyé à <span className="font-medium text-slate-900 dark:text-white">{emailMasked}</span>
                </p>
              </div>

              <form onSubmit={onSubmitOtp} className="space-y-6">
                <div className="space-y-4">
                  <label htmlFor="admin-otp" className="tt-label">Code à 6 chiffres</label>
                  <OtpInput id="admin-otp" value={otp} onChange={setOtp} disabled={pending} />

                  {debugOtp && (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-2.5 text-center font-mono text-xs text-amber-700 dark:text-amber-400">
                      DEBUG: {debugOtp}
                    </div>
                  )}
                </div>

                {errorBox}

                <Button
                  type="submit"
                  size="lg"
                  disabled={pending}
                  className="w-full"
                  trailing={verifyMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                >
                  {verifyMutation.isPending ? 'Vérification…' : 'Vérifier et accéder'}
                </Button>

                <Button variant="ghost" size="md" onClick={() => goBackToCredentials()} className="w-full" leading={<ArrowLeft className="size-4" />}>
                  Retour à l'identification
                </Button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
