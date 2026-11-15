import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  CircleNotch, 
  Fingerprint, 
  EnvelopeSimple, 
  ArrowRight, 
  ListChecks,
  Users,
  ArrowLeft,
  WarningCircle,
  CheckCircle,
  ShieldCheck,
  UserCheck,
} from '@phosphor-icons/react'
import { getStudentFlowErrorMessage, isOtpExpiredError } from './api'
import {
  useActiveScrutinQuery,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useVoteMutation,
} from './hooks'
import { useStudentVoteFlowStore } from './flow-store'
import { useToastStore } from '../../shared/ui/toast-store'
import { OtpInput } from '../../shared/ui/otp-input'
import { useSiteTheme } from '../../shared/ui/site-theme'
import { CardShell } from '../../shared/ui/CardShell'
import { Button, ButtonLink } from '../../shared/ui/Button'
import { motion } from 'framer-motion'
import heroCampus from '../../../assets/ucao-messe.jpeg'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const OTP_EXPIRED_TOAST = 'Votre code a expiré. Demandez un nouveau code pour continuer.'

export function MatriculeStepPage() {
  const navigate = useNavigate()
  const activeScrutinQuery = useActiveScrutinQuery()
  const sendOtpMutation = useSendOtpMutation()
  const { pushToast } = useToastStore()
  const {
    matricule,
    email,
    setMatricule,
    setEmail,
    setScrutin,
    setSessionToken,
    setOtpExpiresAt,
    setOtpVerified,
    setSelectedList,
  } = useStudentVoteFlowStore()

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanMatricule = matricule.trim()
    const cleanEmail = email.trim()
    
    if (!cleanMatricule || !cleanEmail || !EMAIL_RE.test(cleanEmail)) {
      pushToast('Veuillez remplir correctement tous les champs.', 'error')
      return
    }

    try {
      const response = await sendOtpMutation.mutateAsync({
        matricule: cleanMatricule,
        email: cleanEmail,
      })
      setMatricule(cleanMatricule)
      setEmail(cleanEmail)
      setScrutin(activeScrutinQuery.data?.id || '', activeScrutinQuery.data?.title || '')
      setSessionToken(response.sessionToken)
      setOtpExpiresAt(Date.now() + response.expiresInMinutes * 60 * 1000)
      setOtpVerified(false)
      setSelectedList('', '')
      pushToast('Code envoyé ! Vérifiez votre e-mail.', 'success')
      navigate('/vote/otp')
    } catch (error) {
      pushToast(`Erreur : ${getStudentFlowErrorMessage(error)}`, 'error')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
    >
      <div className="grid overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-1.5 shadow-lift dark:border-white/[0.08] dark:bg-night-900/70 md:grid-cols-[1fr_1.05fr]">
        {/* Visuel (masqué sur mobile) */}
        <div className="relative hidden overflow-hidden rounded-[1.25rem] md:block">
          <img src={heroCampus} alt="Campus de l'UCAO" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-night-950/90 via-night-950/40 to-brand-950/30" />
          <div className="bg-grid absolute inset-0 opacity-30 [--grid-color:rgba(255,255,255,0.08)]" />
          <div className="absolute inset-x-8 bottom-8 space-y-4 text-white">
            <div className="flex size-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md">
              <ShieldCheck size={22} weight="duotone" className="text-aqua-300" />
            </div>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight">
              Votez en toute
              <br />
              sécurité
            </h2>
            <p className="max-w-xs text-sm leading-relaxed text-white/70">Identifiez-vous pour participer au vote de l’UCAO.</p>
          </div>
        </div>

        {/* Formulaire */}
        <div className="flex flex-col justify-center px-5 py-10 sm:px-10 md:px-12 md:py-16">
          <div className="mx-auto w-full max-w-sm space-y-8">
            <div>
              {activeScrutinQuery.data?.title && (
                <p className="tt-overline mb-3 truncate">{activeScrutinQuery.data.title}</p>
              )}
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Bienvenue</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Saisissez votre matricule et votre e-mail.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <label htmlFor="vote-matricule" className="tt-label">Matricule</label>
                <div className="group relative">
                  <Fingerprint className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-aqua-500" />
                  <input
                    id="vote-matricule"
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                    placeholder="Ex: 23B12XYZ"
                    autoComplete="username"
                    autoCapitalize="characters"
                    spellCheck={false}
                    className="tt-field-outline h-12 w-full rounded-xl pl-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="vote-email" className="tt-label">E-mail</label>
                <div className="group relative">
                  <EnvelopeSimple className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-aqua-500" />
                  <input
                    id="vote-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.nom@ucao.edu"
                    className="tt-field-outline h-12 w-full rounded-xl pl-11"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={sendOtpMutation.isPending || activeScrutinQuery.isPending}
                className="mt-2 w-full"
                trailing={
                  sendOtpMutation.isPending ? (
                    <CircleNotch className="animate-spin" size={16} />
                  ) : (
                    <ArrowRight size={16} weight="bold" />
                  )
                }
              >
                {sendOtpMutation.isPending ? 'Envoi du code…' : 'Continuer'}
              </Button>
            </form>

            <p className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={14} className="text-aqua-500" />
              Vos informations restent confidentielles et sécurisées.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function OtpStepPage() {
  const navigate = useNavigate()
  const verifyOtpMutation = useVerifyOtpMutation()
  const { pushToast } = useToastStore()
  const {
    matricule,
    sessionToken,
    otpExpiresAt,
    setOtpVerified,
    setSessionToken,
    setOtpExpiresAt,
    clearOtpSession,
  } = useStudentVoteFlowStore()
  const [otp, setOtp] = useState('')
  const { theme } = useSiteTheme()

  const handleOtpExpired = useCallback(
    (message = OTP_EXPIRED_TOAST) => {
      clearOtpSession()
      pushToast(message, 'error')
      navigate('/vote', { replace: true })
    },
    [clearOtpSession, pushToast, navigate],
  )

  useEffect(() => {
    if (!matricule || !sessionToken) navigate('/vote', { replace: true })
  }, [matricule, sessionToken, navigate])

  useEffect(() => {
    if (!otpExpiresAt || !sessionToken) return

    const remainingMs = otpExpiresAt - Date.now()
    if (remainingMs <= 0) {
      handleOtpExpired()
      return
    }

    const timerId = window.setTimeout(() => {
      handleOtpExpired()
    }, remainingMs)

    return () => window.clearTimeout(timerId)
  }, [otpExpiresAt, sessionToken, handleOtpExpired])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (otp.length !== 6) return

    if (otpExpiresAt && Date.now() >= otpExpiresAt) {
      handleOtpExpired()
      return
    }

    try {
      const response = await verifyOtpMutation.mutateAsync({
        sessionToken: sessionToken!,
        otp,
      })
      if (response.otpVerified) {
        setOtpVerified(true)
        setSessionToken(response.sessionToken)
        setOtpExpiresAt(undefined)
        navigate('/vote/liste')
      } else {
        pushToast('Code incorrect.', 'error')
      }
    } catch (error) {
      if (isOtpExpiredError(error)) {
        handleOtpExpired(getStudentFlowErrorMessage(error))
        return
      }
      pushToast(getStudentFlowErrorMessage(error), 'error')
    }
  }

  return (
    <CardShell className="edge-highlight mx-auto max-w-md !rounded-3xl !p-8 text-center sm:!p-10">
      <div className="space-y-8">
        <div className="relative mx-auto flex size-14 items-center justify-center">
          <span className="absolute inset-0 animate-pulse-ring rounded-2xl bg-aqua-400/30" aria-hidden />
          <span className="relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 text-aqua-300 shadow-lift ring-1 ring-white/10">
            <UserCheck size={26} weight="duotone" />
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Vérification</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Un code à 6 chiffres a été envoyé à votre e-mail.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          <div className="flex justify-center">
            <OtpInput value={otp} onChange={setOtp} isDark={theme === 'dark'} disabled={verifyOtpMutation.isPending} />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={verifyOtpMutation.isPending || otp.length !== 6}
            className="w-full"
            trailing={verifyOtpMutation.isPending ? <CircleNotch className="animate-spin" size={16} /> : null}
          >
            {verifyOtpMutation.isPending ? 'Vérification…' : 'Valider le code'}
          </Button>

          <div className="border-t border-slate-200/70 pt-6 dark:border-white/[0.06]">
            <p className="text-sm text-slate-500">
              Vous n’avez pas reçu le code ?{' '}
              <button
                type="button"
                onClick={() => {
                  clearOtpSession()
                  navigate('/vote', { replace: true })
                }}
                className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 transition-colors hover:decoration-aqua-500 dark:text-white dark:decoration-white/20"
              >
                Revenir en arrière
              </button>
            </p>
          </div>
        </form>
      </div>
    </CardShell>
  )
}

export function CandidateListStepPage() {
  const navigate = useNavigate()
  const activeScrutinQuery = useActiveScrutinQuery()
  const { isOtpVerified, selectedListId, setSelectedList } = useStudentVoteFlowStore()

  useEffect(() => {
    if (!isOtpVerified) navigate('/vote', { replace: true })
  }, [isOtpVerified, navigate])

  const candidateLists = activeScrutinQuery.data?.candidateLists ?? []

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-4xl">Choisissez votre liste</h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">Sélectionnez la liste pour laquelle vous souhaitez voter.</p>
      </div>

      {activeScrutinQuery.isLoading && (
        <div className="grid gap-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>
      )}

      <div role="radiogroup" aria-label="Listes candidates" className="grid gap-3">
        {candidateLists.map((list, i) => {
          const selected = selectedListId === list.id
          return (
            <motion.button
              key={list.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setSelectedList(list.id, list.name)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] as const }}
              className={`group relative flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left transition-[border-color,box-shadow,background-color] duration-300 sm:gap-5 sm:p-5 dark:bg-night-900/60 ${
                selected
                  ? 'border-aqua-500/70 shadow-glow dark:border-aqua-400/60'
                  : 'border-slate-200/80 shadow-soft hover:border-slate-300 dark:border-white/[0.07] dark:hover:border-white/15'
              }`}
            >
              <div
                className={`relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl transition-colors duration-300 ${
                  selected ? 'bg-aqua-500/10 text-aqua-600 dark:text-aqua-300' : 'bg-slate-100 text-slate-400 dark:bg-white/[0.04]'
                }`}
              >
                {list.imageUrl ? (
                  <img src={list.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Users size={24} weight={selected ? 'duotone' : 'light'} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold tracking-tight text-slate-950 dark:text-white sm:text-lg">{list.name}</p>
                {list.slogan && <p className="mt-0.5 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">« {list.slogan} »</p>}
              </div>
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                  selected ? 'border-aqua-500 bg-aqua-500 text-white' : 'border-slate-300 dark:border-white/20'
                }`}
                aria-hidden
              >
                {selected && <CheckCircle size={24} weight="fill" className="text-white" />}
              </span>
            </motion.button>
          )
        })}
      </div>

      {!activeScrutinQuery.isLoading && candidateLists.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-white/10">
          <ListChecks size={28} className="mx-auto mb-3 text-slate-400" />
          Aucune liste n’est disponible pour ce scrutin.
        </div>
      )}

      <div className="sticky bottom-4 z-10 mt-8 flex justify-end">
        <ButtonLink
          to="/vote/confirmation"
          size="lg"
          disabled={!selectedListId}
          className="w-full shadow-lift sm:w-auto"
          trailing={<ArrowRight size={16} weight="bold" />}
        >
          Continuer
        </ButtonLink>
      </div>
    </div>
  )
}

export function ConfirmationStepPage() {
  const navigate = useNavigate()
  const voteMutation = useVoteMutation()
  const { pushToast } = useToastStore()
  const {
    isOtpVerified,
    selectedListId,
    selectedListName,
    sessionToken,
    clearOtpSession,
    resetFlow,
  } = useStudentVoteFlowStore()

  useEffect(() => {
    if (!isOtpVerified || !selectedListId) navigate('/vote', { replace: true })
  }, [isOtpVerified, selectedListId, navigate])

  async function onVote() {
    if (!sessionToken || !selectedListId) return

    try {
      await voteMutation.mutateAsync({
        sessionToken,
        candidateListId: selectedListId,
      })
      pushToast('Votre vote a été enregistré !', 'success')
      resetFlow()
      navigate('/', { state: { fromVote: true } })
    } catch (error) {
      if (isOtpExpiredError(error)) {
        clearOtpSession()
        pushToast(getStudentFlowErrorMessage(error), 'error')
        navigate('/vote', { replace: true })
        return
      }
      pushToast(`Erreur lors du vote : ${getStudentFlowErrorMessage(error)}`, 'error')
    }
  }

  return (
    <CardShell className="edge-highlight mx-auto max-w-lg !rounded-3xl !p-8 text-center sm:!p-10">
      <div className="space-y-8">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 ring-1 ring-inset ring-amber-500/20 dark:text-amber-400">
          <WarningCircle size={26} weight="duotone" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Confirmer votre vote</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Vérifiez votre choix. Une fois validé, vous ne pourrez plus le modifier.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6 dark:border-white/[0.07] dark:bg-white/[0.03]">
          <div className="bg-dots mask-radial pointer-events-none absolute inset-0" aria-hidden />
          <p className="tt-overline relative">Votre choix</p>
          <p className="relative mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            {selectedListName}
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onVote}
            size="lg"
            variant="accent"
            disabled={voteMutation.isPending}
            className="w-full"
            trailing={
              voteMutation.isPending ? <CircleNotch className="animate-spin" size={16} /> : <CheckCircle size={16} weight="bold" />
            }
          >
            {voteMutation.isPending ? 'Enregistrement…' : 'Confirmer mon vote'}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate('/vote/liste')}
            disabled={voteMutation.isPending}
            className="w-full"
            leading={<ArrowLeft size={16} />}
          >
            Modifier mon choix
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-slate-200/70 pt-6 text-xs text-slate-500 dark:border-white/[0.06]">
          <ShieldCheck size={16} weight="duotone" className="text-aqua-500" />
          Votre vote reste secret
        </div>
      </div>
    </CardShell>
  )
}
