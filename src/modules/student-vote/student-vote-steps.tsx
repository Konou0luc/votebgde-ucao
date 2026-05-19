import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { getStudentFlowErrorMessage } from './api'
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function MatriculeStepPage() {
  const { theme } = useSiteTheme()
  const isDark = theme === 'dark'
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
    setOtpVerified,
    setSelectedList,
  } = useStudentVoteFlowStore()

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanMatricule = matricule.trim()
    const cleanEmail = email.trim()
    if (!cleanMatricule) {
      pushToast('Veuillez renseigner votre matricule.', 'error')
      return
    }
    if (!cleanEmail) {
      pushToast('Veuillez renseigner votre adresse e-mail.', 'error')
      return
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      pushToast('Adresse e-mail invalide.', 'error')
      return
    }
    if (!activeScrutinQuery.data?.id) {
      pushToast('Aucun scrutin actif detecte pour le moment.', 'error')
      return
    }

    try {
      const response = await sendOtpMutation.mutateAsync({
        matricule: cleanMatricule,
        email: cleanEmail,
      })
      setMatricule(cleanMatricule)
      setEmail(cleanEmail)
      setScrutin(activeScrutinQuery.data.id, activeScrutinQuery.data.title)
      setSessionToken(response.sessionToken)
      setOtpVerified(false)
      setSelectedList('', '')
      pushToast(
        'E-mail envoye avec succes. Consultez votre boite mail pour recuperer le code a six chiffres, puis saisissez-le ci-dessous.',
        'success',
      )
      navigate('/vote/otp')
    } catch (error) {
      pushToast(
        `L envoi du code par e-mail a echoue. ${getStudentFlowErrorMessage(error)}`,
        'error',
      )
    }
  }

  const scrutinLoading = activeScrutinQuery.isPending || activeScrutinQuery.isFetching

  return (
    <section
      className={`rounded-3xl border p-6 shadow-[0_24px_45px_-30px_rgba(2,6,23,0.25)] ${
        isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
      }`}
    >
      <h1 className={`text-2xl font-semibold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
        Verification matricule
      </h1>
      <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        Saisissez votre matricule et l e-mail sur lequel vous recevrez le code OTP.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <label htmlFor="matricule" className={`block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
          Matricule etudiant
        </label>
        <input
          id="matricule"
          name="matricule"
          value={matricule}
          onChange={(event) => setMatricule(event.target.value)}
          placeholder="Ex: 23B12XYZ"
          autoComplete="username"
          className={`min-h-11 w-full rounded-xl border px-3 outline-none transition focus:border-blue-500 ${
            isDark
              ? 'border-slate-600 bg-slate-950 text-slate-100'
              : 'border-slate-300 bg-white text-slate-900'
          }`}
        />
        <label htmlFor="email" className={`block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
          Adresse e-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="prenom.nom@exemple.com"
          autoComplete="email"
          className={`min-h-11 w-full rounded-xl border px-3 outline-none transition focus:border-blue-500 ${
            isDark
              ? 'border-slate-600 bg-slate-950 text-slate-100'
              : 'border-slate-300 bg-white text-slate-900'
          }`}
        />
        <button
          type="submit"
          disabled={sendOtpMutation.isPending || scrutinLoading}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {sendOtpMutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Envoi OTP...
            </>
          ) : scrutinLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Chargement du scrutin...
            </>
          ) : (
            'Envoyer le code OTP'
          )}
        </button>
      </form>
    </section>
  )
}

export function OtpStepPage() {
  const { theme } = useSiteTheme()
  const isDark = theme === 'dark'
  const navigate = useNavigate()
  const verifyOtpMutation = useVerifyOtpMutation()
  const { pushToast } = useToastStore()
  const { matricule, sessionToken, setOtpVerified, setSessionToken } = useStudentVoteFlowStore()
  const [otp, setOtp] = useState('')
  const flowSessionToken = sessionToken ?? ''
  const missingSession = !matricule || !flowSessionToken

  useEffect(() => {
    if (missingSession) {
      navigate('/vote', { replace: true })
    }
  }, [navigate, missingSession])

  if (missingSession) return null

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const otpDigits = otp.replace(/\D/g, '')
    if (otpDigits.length !== 6) {
      pushToast('Le code OTP doit contenir 6 chiffres.', 'error')
      return
    }

    try {
      const response = await verifyOtpMutation.mutateAsync({
        sessionToken: flowSessionToken,
        otp: otpDigits,
      })

      if (response.otpVerified) {
        setOtpVerified(true)
        setSessionToken(response.sessionToken)
        navigate('/vote/liste')
      } else {
        pushToast('Code OTP invalide. Veuillez reessayer.', 'error')
      }
    } catch (error) {
      pushToast(getStudentFlowErrorMessage(error), 'error')
    }
  }

  return (
    <section
      className={`rounded-3xl border p-6 shadow-[0_24px_45px_-30px_rgba(2,6,23,0.25)] ${
        isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
      }`}
    >
      <h1 className={`text-2xl font-semibold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
        Verification OTP
      </h1>
      <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        Saisissez le code recu sur votre boite e-mail pour continuer.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <span className={`block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Code OTP</span>
        <OtpInput
          id="otp"
          value={otp}
          onChange={setOtp}
          isDark={isDark}
          disabled={verifyOtpMutation.isPending}
          aria-label="Code de verification a six chiffres"
        />
        <button
          type="submit"
          disabled={verifyOtpMutation.isPending}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {verifyOtpMutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Verification...
            </>
          ) : (
            'Verifier le code OTP'
          )}
        </button>
      </form>
    </section>
  )
}

export function CandidateListStepPage() {
  const { theme } = useSiteTheme()
  const isDark = theme === 'dark'
  const navigate = useNavigate()
  const activeScrutinQuery = useActiveScrutinQuery()
  const { pushToast } = useToastStore()
  const { isOtpVerified, scrutinId, selectedListId, setScrutin, setSelectedList } =
    useStudentVoteFlowStore()
  const shouldRedirectToMatricule = !isOtpVerified

  const candidateLists = activeScrutinQuery.data?.candidateLists ?? []
  const listsLoading = activeScrutinQuery.isPending || activeScrutinQuery.isFetching

  useEffect(() => {
    if (shouldRedirectToMatricule) {
      navigate('/vote', { replace: true })
    }
  }, [navigate, shouldRedirectToMatricule])

  useEffect(() => {
    if (!scrutinId && activeScrutinQuery.data?.id) {
      setScrutin(activeScrutinQuery.data.id, activeScrutinQuery.data.title)
    }
  }, [activeScrutinQuery.data?.id, activeScrutinQuery.data?.title, scrutinId, setScrutin])

  useEffect(() => {
    if (!isOtpVerified) return
    if (activeScrutinQuery.isError) {
      pushToast(getStudentFlowErrorMessage(activeScrutinQuery.error), 'error')
    }
  }, [activeScrutinQuery.error, activeScrutinQuery.isError, isOtpVerified, pushToast])

  if (shouldRedirectToMatricule) return null

  return (
    <section
      className={`rounded-3xl border p-6 shadow-[0_24px_45px_-30px_rgba(2,6,23,0.25)] ${
        isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
      }`}
    >
      <h1 className={`text-2xl font-semibold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
        Selection de liste candidate
      </h1>
      <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        Les listes proviennent du scrutin actif. Choisissez votre liste puis continuez.
      </p>

      <div className="mt-5 space-y-2">
        {listsLoading && (
          <div className="animate-pulse space-y-2">
            <div className={`h-14 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className={`h-14 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          </div>
        )}

        {!listsLoading &&
          candidateLists.map((candidateList) => {
            const isSelected = selectedListId === candidateList.id
            return (
              <button
                key={candidateList.id}
                type="button"
                onClick={() => setSelectedList(candidateList.id, candidateList.name)}
                className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                  isSelected
                    ? isDark
                      ? 'border-blue-600 bg-blue-950/30'
                      : 'border-blue-300 bg-blue-50'
                    : isDark
                      ? 'border-slate-700 bg-slate-950 hover:border-slate-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <p className={`text-sm font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {candidateList.name}
                </p>
                {candidateList.slogan ? (
                  <p className={`mt-1 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {candidateList.slogan}
                  </p>
                ) : null}
              </button>
            )
          })}

        {!listsLoading && candidateLists.length === 0 ? (
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Aucune liste candidate disponible pour ce scrutin.
          </p>
        ) : null}
      </div>

      <button
        type="button"
        disabled={!selectedListId || listsLoading || candidateLists.length === 0}
        onClick={() => navigate('/vote/confirmation')}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        Continuer
      </button>
    </section>
  )
}

export function ConfirmationStepPage() {
  const { theme } = useSiteTheme()
  const isDark = theme === 'dark'
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const voteMutation = useVoteMutation()
  const { pushToast } = useToastStore()
  const { matricule, sessionToken, selectedListId, selectedListName, resetFlow } =
    useStudentVoteFlowStore()
  const shouldRedirectToMatricule = !matricule || !selectedListId || !sessionToken

  useEffect(() => {
    if (shouldRedirectToMatricule) {
      navigate('/vote', { replace: true })
    }
  }, [navigate, shouldRedirectToMatricule])

  if (shouldRedirectToMatricule) return null
  const confirmedSelectedListId = selectedListId
  const confirmedSessionToken = sessionToken

  async function onConfirmVote() {
    try {
      const response = await voteMutation.mutateAsync({
        sessionToken: confirmedSessionToken,
        candidateListId: confirmedSelectedListId,
      })
      if (response.success) {
        pushToast('Vote enregistre avec succes.', 'success')
        resetFlow()
        await queryClient.invalidateQueries({ queryKey: ['scrutin-published-results'] })
        await queryClient.invalidateQueries({ queryKey: ['active-scrutin'] })
        navigate('/resultats', { replace: true, state: { fromVote: true } })
      } else {
        pushToast('Impossible de confirmer le vote pour le moment.', 'error')
      }
    } catch (error) {
      pushToast(getStudentFlowErrorMessage(error), 'error')
    }
  }

  return (
    <section
      className={`rounded-3xl border p-6 shadow-[0_24px_45px_-30px_rgba(2,6,23,0.25)] ${
        isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
      }`}
    >
      <h1 className={`text-2xl font-semibold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
        Confirmation du vote
      </h1>
      <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        Verifiez vos informations avant validation definitive.
      </p>

      <div
        className={`mt-5 space-y-2 rounded-xl border p-4 text-sm ${
          isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <p>
          <span className={`font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Matricule:</span>{' '}
          <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{matricule}</span>
        </p>
        <p>
          <span className={`font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Liste choisie:</span>{' '}
          <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{selectedListName ?? selectedListId}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={onConfirmVote}
        disabled={voteMutation.isPending}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {voteMutation.isPending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Confirmation...
          </>
        ) : (
          'Confirmer mon vote'
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          resetFlow()
          navigate('/vote')
        }}
        className={`mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border px-4 font-medium transition ${
          isDark
            ? 'border-slate-600 bg-slate-950 text-slate-200 hover:bg-slate-800'
            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
        }`}
      >
        Recommencer
      </button>
    </section>
  )
}
