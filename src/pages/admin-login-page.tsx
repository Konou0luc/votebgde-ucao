import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Navigate, useNavigate } from 'react-router-dom'
import { BadgeCheck, KeyRound, Loader2, Lock, Mail } from 'lucide-react'
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

  const shellOuter =
    'rounded-[2rem] border border-slate-200/90 bg-white p-1.5 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.18)]'
  const shellInner =
    'rounded-[calc(2rem-6px)] border border-slate-100 bg-white px-8 py-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]'

  const pending = loginMutation.isPending || verifyMutation.isPending

  return (
    <div className="grid min-h-[100dvh] grid-cols-1 md:grid-cols-2">
      <div className="relative h-52 shrink-0 md:h-auto md:min-h-[100dvh]">
        <img
          src={campusVisual}
          alt="Campus universitaire — environnement institutionnel VoteBGDE"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-950/75 via-slate-900/35 to-blue-950/50 md:from-slate-950/65 md:via-slate-900/25"
          aria-hidden
        />
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/75">Console administration</p>
          <p className="mt-3 max-w-[36ch] text-2xl font-semibold leading-tight tracking-tight text-white md:text-3xl">
            Pilotage institutionnel du vote étudiant et des élections numériques.
          </p>
          <p className="mt-4 max-w-[42ch] text-sm leading-relaxed text-white/85">
            Accès réservé aux rôles autorisés. Les votes et la publication des résultats sont tracés et audités.
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center bg-slate-50 px-5 py-12 md:px-10 lg:px-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="mx-auto w-full max-w-[440px]"
        >
          <div className={shellOuter}>
            <div className={shellInner}>
              {step === 'credentials' ? (
                <>
                  <div className="mb-8 text-center md:text-left">
                    <div className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-blue-600/10 ring-1 ring-blue-600/20">
                      <BadgeCheck className="size-8 text-blue-600" strokeWidth={1.25} />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Espace sécurisé</p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      Administration VoteBGDE
                    </h1>
                    <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-slate-600">
                      Connectez-vous pour piloter les élections et la publication des résultats.
                    </p>
                  </div>

                  <form onSubmit={onSubmitCredentials} className="space-y-4">
                    <div>
                      <label
                        htmlFor="admin-email"
                        className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-600"
                      >
                        Email
                      </label>
                      <div className="relative">
                        <Mail
                          className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-slate-400"
                          strokeWidth={1.25}
                        />
                        <input
                          id="admin-email"
                          name="email"
                          type="email"
                          autoComplete="username"
                          value={email}
                          onChange={(ev) => setEmail(ev.target.value)}
                          className="min-h-12 w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-3 text-sm text-slate-900 outline-none ring-blue-500/0 transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="admin-password"
                        className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-600"
                      >
                        Mot de passe
                      </label>
                      <div className="relative">
                        <Lock
                          className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-slate-400"
                          strokeWidth={1.25}
                        />
                        <input
                          id="admin-password"
                          name="password"
                          type="password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(ev) => setPassword(ev.target.value)}
                          className="min-h-12 w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    {error ? (
                      <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={pending}
                      className="group mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60"
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="size-4 animate-spin" strokeWidth={2} />
                          Envoi du code...
                        </>
                      ) : (
                        <>
                          Continuer
                          <span className="inline-flex size-8 items-center justify-center rounded-full bg-white/20 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                            <span className="text-xs">&#8594;</span>
                          </span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="mb-8 text-center md:text-left">
                    <div className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-blue-600/10 ring-1 ring-blue-600/20">
                      <KeyRound className="size-8 text-blue-600" strokeWidth={1.25} />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Vérification OTP</p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Code de connexion</h1>
                    <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-slate-600">
                      Un code à 6 chiffres a été envoyé à <span className="font-medium text-slate-800">{emailMasked}</span>.
                      Saisissez-le ci-dessous pour accéder au tableau de bord.
                    </p>
                    {debugOtp ? (
                      <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 font-mono text-sm text-amber-950">
                        Dev — code OTP : {debugOtp}
                      </p>
                    ) : null}
                  </div>

                  <form onSubmit={onSubmitOtp} className="space-y-4">
                    <div>
                      <label htmlFor="admin-otp" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-600">
                        Code OTP
                      </label>
                      <input
                        id="admin-otp"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={otp}
                        onChange={(ev) => setOtp(ev.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        className="min-h-12 w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-center font-mono text-lg tracking-[0.35em] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {error ? (
                      <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={pending}
                      className="group mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60"
                    >
                      {verifyMutation.isPending ? (
                        <>
                          <Loader2 className="size-4 animate-spin" strokeWidth={2} />
                          Vérification...
                        </>
                      ) : (
                        <>
                          Accéder au tableau de bord
                          <span className="inline-flex size-8 items-center justify-center rounded-full bg-white/20 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                            <span className="text-xs">&#8594;</span>
                          </span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={goBackToCredentials}
                      disabled={pending}
                      className="w-full text-center text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline disabled:opacity-50"
                    >
                      Modifier l’email ou le mot de passe
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
