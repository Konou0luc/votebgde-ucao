import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  CircleNotch, 
  Fingerprint, 
  EnvelopeSimple, 
  ArrowRight, 
  CaretRight,
  ListChecks,
  WarningCircle,
  CheckCircle,
  ShieldCheck,
  UserCheck,
} from '@phosphor-icons/react'
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
import { CardShell } from '../../shared/ui/CardShell'
import { Button } from '../../shared/ui/Button'
import { motion } from 'framer-motion'
import heroCampus from '../../../assets/ucao-messe.jpeg'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
      setOtpVerified(false)
      setSelectedList('', '')
      pushToast('Code OTP envoyé ! Vérifiez vos e-mails.', 'success')
      navigate('/vote/otp')
    } catch (error) {
      pushToast(`Erreur : ${getStudentFlowErrorMessage(error)}`, 'error')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] as const }}>
      <div className="bg-white dark:bg-night-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-white/5 grid md:grid-cols-2 min-h-[600px]">
        {/* Left: Image (Hidden on mobile) */}
        <div className="hidden md:block relative overflow-hidden">
          <img 
            src={heroCampus} 
            alt="UCAO Campus" 
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-brand-950/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-12 left-12 right-12 text-white space-y-4">
            <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <ShieldCheck size={28} weight="duotone" />
            </div>
            <h2 className="font-display text-3xl font-bold leading-tight">Portail de Vote <br />Sécurisé</h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">Identifiez-vous pour participer à l'élection institutionnelle de l'UCAO.</p>
          </div>
        </div>

        {/* Right: Form */}
        <div className="p-8 sm:p-12 md:p-16 flex flex-col justify-center">
          <div className="space-y-10">
            <div>
              <h3 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Bienvenue</h3>
              <p className="mt-2 text-slate-500 dark:text-slate-400">Veuillez saisir vos identifiants.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Matricule</label>
                  <div className="relative group">
                    <Fingerprint className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" weight="light" />
                    <input
                      value={matricule}
                      onChange={(e) => setMatricule(e.target.value)}
                      placeholder="Ex: 23B12XYZ"
                      className="tt-field-outline w-full rounded-2xl pl-12 h-14"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</label>
                  <div className="relative group">
                    <EnvelopeSimple className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600 transition-colors" weight="light" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre.nom@ucao.edu"
                      className="tt-field-outline w-full rounded-2xl pl-12 h-14"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={sendOtpMutation.isPending || activeScrutinQuery.isPending}
                className="w-full !h-14 !text-base"
                trailing={sendOtpMutation.isPending ? <CircleNotch className="animate-spin" size={18} /> : <ArrowRight size={18} weight="bold" />}
              >
                Continuer
              </Button>
            </form>

            <p className="text-[10px] text-center text-slate-400 leading-relaxed">
              Vos données sont protégées par le protocole de chiffrement RSA-4096.
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
  const { matricule, sessionToken, setOtpVerified, setSessionToken } = useStudentVoteFlowStore()
  const [otp, setOtp] = useState('')
  const { theme } = useSiteTheme()

  useEffect(() => {
    if (!matricule || !sessionToken) navigate('/vote')
  }, [matricule, sessionToken, navigate])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (otp.length !== 6) return

    try {
      const response = await verifyOtpMutation.mutateAsync({
        sessionToken: sessionToken!,
        otp,
      })
      if (response.otpVerified) {
        setOtpVerified(true)
        setSessionToken(response.sessionToken)
        navigate('/vote/liste')
      } else {
        pushToast('Code OTP invalide.', 'error')
      }
    } catch (error) {
      pushToast(getStudentFlowErrorMessage(error), 'error')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] as const }}>
      <CardShell className="max-w-md mx-auto text-center">
        <div className="space-y-10">
          <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-brand-600 text-white shadow-xl shadow-brand-500/20">
            <UserCheck size={40} weight="duotone" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Validation</h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400">Un code de vérification à 6 chiffres a été envoyé à votre email institutionnel.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-10">
            <div className="flex justify-center">
              <OtpInput value={otp} onChange={setOtp} isDark={theme === 'dark'} disabled={verifyOtpMutation.isPending} />
            </div>

            <Button
              type="submit"
              disabled={verifyOtpMutation.isPending || otp.length !== 6}
              className="w-full !py-4"
              trailing={verifyOtpMutation.isPending ? <CircleNotch className="animate-spin" size={18} /> : null}
            >
              Confirmer l'identité
            </Button>

            <div className="pt-6 border-t border-slate-100 dark:border-white/5">
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Vous n'avez pas reçu le code ? <button type="button" className="font-bold text-brand-600 hover:text-brand-700 transition-colors">Renvoyer le code</button>
              </p>
            </div>
          </form>
        </div>
      </CardShell>
    </motion.div>
  )
}

export function CandidateListStepPage() {
  const navigate = useNavigate()
  const activeScrutinQuery = useActiveScrutinQuery()
  const { isOtpVerified, selectedListId, setSelectedList } = useStudentVoteFlowStore()

  useEffect(() => {
    if (!isOtpVerified) navigate('/vote')
  }, [isOtpVerified, navigate])

  const candidateLists = activeScrutinQuery.data?.candidateLists ?? []

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] as const }} className="space-y-10">
      <div className="mb-10 border-b border-slate-100 pb-8 dark:border-white/5">
        <h2 className="font-display text-3xl font-semibold text-slate-900 dark:text-white">Bulletins de Vote</h2>
        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">Sélectionnez la liste candidate pour laquelle vous souhaitez voter.</p>
      </div>

      <div className="grid gap-6">
        {candidateLists.map((list) => (
          <button
            key={list.id}
            onClick={() => setSelectedList(list.id, list.name)}
            className="block text-left group w-full outline-none"
          >
            <CardShell className={`transition-all duration-500 ${
              selectedListId === list.id
                ? 'ring-2 ring-brand-600 bg-brand-50/50 dark:bg-brand-900/10'
                : 'hover:ring-brand-600/30'
            }`}>
              <div className="flex items-center gap-6">
                <div className={`flex size-16 items-center justify-center rounded-2xl transition-all duration-500 ${
                  selectedListId === list.id ? 'bg-brand-600 text-white shadow-xl shadow-brand-500/20' : 'bg-slate-50 text-slate-400 dark:bg-white/5'
                }`}>
                  <ListChecks size={32} weight={selectedListId === list.id ? "fill" : "light"} />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">{list.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 italic font-display">« {list.slogan} »</p>
                </div>
                <div className={`size-8 rounded-full border-2 transition-all duration-500 flex items-center justify-center ${
                  selectedListId === list.id ? 'border-brand-600 bg-brand-600' : 'border-slate-200 dark:border-white/10'
                }`}>
                  {selectedListId === list.id && <CheckCircle size={20} weight="bold" className="text-white" />}
                </div>
              </div>
            </CardShell>
          </button>
        ))}
      </div>

      <div className="flex justify-end pt-10">
        <Link to="/vote/confirmation" className={!selectedListId ? 'pointer-events-none opacity-50' : ''}>
          <Button disabled={!selectedListId} trailing={<CaretRight size={18} weight="bold" />}>
            Continuer vers la confirmation
          </Button>
        </Link>
      </div>
    </motion.div>
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
    resetFlow,
  } = useStudentVoteFlowStore()

  useEffect(() => {
    if (!isOtpVerified || !selectedListId) navigate('/vote')
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
      pushToast(`Erreur lors du vote : ${getStudentFlowErrorMessage(error)}`, 'error')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] as const }}>
      <CardShell className="max-w-xl mx-auto text-center">
        <div className="space-y-10">
          <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30">
            <WarningCircle size={40} weight="duotone" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Confirmation Finale</h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400">Veuillez confirmer votre choix. Une fois validé, votre vote ne pourra plus être modifié.</p>
          </div>

          <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
            <p className="tt-overline mb-4">Votre sélection</p>
            <p className="font-display text-3xl font-semibold text-brand-600">{selectedListName}</p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={onVote}
              disabled={voteMutation.isPending}
              className="w-full !py-4"
              trailing={voteMutation.isPending ? <CircleNotch className="animate-spin" size={18} /> : <CheckCircle size={18} weight="bold" />}
            >
              Confirmer et Déposer mon bulletin
            </Button>
            <button
              onClick={() => navigate('/vote/liste')}
              disabled={voteMutation.isPending}
              className="text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Modifier mon choix
            </button>
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <ShieldCheck size={18} weight="duotone" className="text-brand-600/50" />
            Vote Anonyme & Sécurisé
          </div>
        </div>
      </CardShell>
    </motion.div>
  )
}
