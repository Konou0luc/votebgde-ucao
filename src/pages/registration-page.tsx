import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  ArrowRight,
  Buildings,
  CheckCircle,
  CircleNotch,
  EnvelopeSimple,
  Fingerprint,
  GraduationCap,
  House,
  Info,
  PencilSimple,
  ArrowClockwise,
  ShieldCheck,
  User,
  WarningCircle,
} from '@phosphor-icons/react'
import { getRegistrationErrorMessage } from '../modules/student-vote/api'
import {
  useRegistrationOptionsQuery,
  useRegistrationStartMutation,
  useRegistrationVerifyMutation,
  useVotePhase,
} from '../modules/student-vote/hooks'
import type {
  RegistrationStartResult,
  StudentLevelName,
  StudentRegistrationPayload,
  StudentRegistrationResult,
} from '../modules/student-vote/types'
import { OtpInput } from '../shared/ui/otp-input'
import { Button, ButtonLink } from '../shared/ui/Button'
import { Backdrop, LoadingBlock } from '../shared/ui/backdrop'
import { useToastStore } from '../shared/ui/toast-store'
import { Reveal } from '../shared/ui/motion'
import heroCampus from '../../assets/ucao-sortie.jpeg'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MATRICULE_RE = /^[A-Za-z0-9-]{3,32}$/

/** Ordre et libellés des instituts demandés ; les autres instituts éventuels suivent. */
const FACULTY_ORDER = ['ESI-DGI', 'ISEG', 'ISSJ', 'IMETIC']

/** Délai avant de pouvoir redemander un code (secondes). */
const RESEND_COOLDOWN_S = 60

const LEVEL_LABELS: Record<string, string> = { L1: 'Licence 1', L2: 'Licence 2', L3: 'Licence 3' }

type FormState = {
  matricule: string
  lastName: string
  firstName: string
  email: string
  facultyCode: string
  departmentCode: string
  levelName: '' | StudentLevelName
  certify: boolean
}

const EMPTY: FormState = {
  matricule: '',
  lastName: '',
  firstName: '',
  email: '',
  facultyCode: '',
  departmentCode: '',
  levelName: '',
  certify: false,
}

const selectClass = `tt-field-outline h-12 w-full appearance-none rounded-xl bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2394a3b8' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_0.9rem_center] bg-no-repeat py-0 pr-10 disabled:cursor-not-allowed disabled:opacity-50`

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="tt-label">
        {label} <span className="text-crimson-700 dark:text-crimson-500">*</span>
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}

function IconInput({ icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon: ReactNode }) {
  return (
    <div className="group relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-600">
        {icon}
      </span>
      <input {...props} className={`tt-field-outline h-12 w-full rounded-xl pl-11 ${props.className ?? ''}`} />
    </div>
  )
}

export function RegistrationPage() {
  const { isVoteOpen, isLoading: phaseLoading } = useVotePhase()
  const optionsQuery = useRegistrationOptionsQuery()
  const startMutation = useRegistrationStartMutation()
  const verifyMutation = useRegistrationVerifyMutation()
  const { pushToast } = useToastStore()

  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<StudentRegistrationResult | null>(null)
  // Étape 2 : code envoyé à l'e-mail saisi
  const [challenge, setChallenge] = useState<(RegistrationStartResult & { sentAt: number }) | null>(null)
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())

  // Horloge pour le délai de renvoi du code (uniquement pendant l'étape du code).
  useEffect(() => {
    if (!challenge) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [challenge])

  const faculties = useMemo(() => {
    const list = optionsQuery.data?.faculties ?? []
    return [...list].sort((a, b) => {
      const ia = FACULTY_ORDER.indexOf(a.code)
      const ib = FACULTY_ORDER.indexOf(b.code)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })
  }, [optionsQuery.data])

  const departments = faculties.find((f) => f.code === form.facultyCode)?.departments ?? []
  const levels = optionsQuery.data?.levels ?? []
  const closed = isVoteOpen || optionsQuery.data?.isOpen === false

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value, ...(key === 'facultyCode' ? { departmentCode: '' } : {}) }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setSubmitError(null)
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!MATRICULE_RE.test(form.matricule.trim())) next.matricule = 'Matricule invalide (lettres, chiffres et tirets).'
    if (form.lastName.trim().length < 2) next.lastName = 'Indiquez votre nom.'
    if (form.firstName.trim().length < 2) next.firstName = 'Indiquez vos prénoms.'
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Adresse e-mail invalide.'
    if (!form.facultyCode) next.facultyCode = 'Choisissez votre institut.'
    if (!form.departmentCode) next.departmentCode = 'Choisissez votre filière.'
    if (!form.levelName) next.levelName = 'Choisissez votre année.'
    if (!form.certify) next.certify = 'Vous devez certifier l’exactitude de vos informations.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)
    if (!validate()) {
      pushToast('Veuillez corriger les champs signalés.', 'error')
      return
    }
    await sendCode()
  }

  function buildPayload(): StudentRegistrationPayload {
    return {
      matricule: form.matricule.trim().toUpperCase(),
      lastName: form.lastName.trim(),
      firstName: form.firstName.trim(),
      email: form.email.trim().toLowerCase(),
      facultyCode: form.facultyCode,
      departmentCode: form.departmentCode,
      levelName: form.levelName as StudentLevelName,
    }
  }

  /** Étape 1 (et renvoi) : contrôle des données + envoi du code à l'e-mail saisi. */
  async function sendCode() {
    try {
      const started = await startMutation.mutateAsync(buildPayload())
      setChallenge({ ...started, sentAt: Date.now() })
      setNow(Date.now())
      setOtp('')
      setOtpError(null)
      pushToast(`Un code de vérification a été envoyé à ${started.emailMasked}.`, 'success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      const message = getRegistrationErrorMessage(error)
      if (challenge) setOtpError(message)
      else setSubmitError(message)
      pushToast(message, 'error')
    }
  }

  /** Étape 2 : vérification du code → l'étudiant est inscrit, e-mail lié au matricule. */
  async function onVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!challenge || otp.length !== 6) return
    setOtpError(null)
    try {
      const registered = await verifyMutation.mutateAsync({ sessionToken: challenge.sessionToken, otp })
      setResult(registered)
      setChallenge(null)
      pushToast('Votre inscription a bien été enregistrée.', 'success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      const message = getRegistrationErrorMessage(error)
      setOtpError(message)
      setOtp('')
      pushToast(message, 'error')
    }
  }

  /* ─── États particuliers ─── */

  if (phaseLoading || optionsQuery.isLoading) {
    return <LoadingBlock label="Chargement du formulaire…" />
  }

  if (closed) {
    return (
      <StatusCard
        icon={<Info size={26} weight="duotone" />}
        title="Les inscriptions sont fermées"
        action={
          <ButtonLink to="/vote" size="lg" variant="accent" trailing={<ArrowRight size={16} weight="bold" />}>
            Aller voter
          </ButtonLink>
        }
      >
        Un vote est en cours. Si vous êtes inscrit, vous pouvez voter dès maintenant avec votre matricule et votre e-mail.
      </StatusCard>
    )
  }

  if (optionsQuery.isError) {
    return (
      <StatusCard
        icon={<WarningCircle size={26} weight="duotone" />}
        title="Formulaire indisponible"
        action={
          <Button size="lg" onClick={() => optionsQuery.refetch()}>
            Réessayer
          </Button>
        }
      >
        Le service d’inscription ne répond pas pour le moment. Réessayez dans quelques instants.
      </StatusCard>
    )
  }

  if (result) {
    const faculty = faculties.find((f) => f.code === result.facultyCode)
    const department = faculty?.departments.find((d) => d.code === result.departmentCode)
    return (
      <StatusCard
        tone="success"
        icon={<CheckCircle size={26} weight="duotone" />}
        title="Inscription enregistrée"
        action={
          <ButtonLink to="/" size="lg" variant="ghost" leading={<House size={16} />}>
            Retour à l’accueil
          </ButtonLink>
        }
      >
        <span className="block">
          Merci {result.firstName}. Vos informations seront vérifiées par l’administration avant le lancement du vote.
        </span>
        <dl className="mt-6 grid gap-x-6 gap-y-3 rounded-xl border border-slate-200/80 p-4 text-left text-sm sm:grid-cols-2 dark:border-white/10">
          {[
            ['Matricule', result.matricule],
            ['Nom et prénoms', `${result.lastName} ${result.firstName}`],
            ['Institut', faculty?.label ?? result.facultyCode],
            ['Filière', department?.name ?? result.departmentCode],
            ['Année', LEVEL_LABELS[result.levelName] ?? result.levelName],
            ['Année universitaire', result.academicYear],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-slate-500">{k}</dt>
              <dd className="font-medium text-slate-900 dark:text-white">{v}</dd>
            </div>
          ))}
        </dl>
        <span className="mt-5 block rounded-lg bg-brand-50 px-4 py-3 text-left text-sm text-brand-800 dark:bg-brand-500/15 dark:text-brand-100">
          Le jour du vote, utilisez le <strong>même matricule</strong> et la <strong>même adresse e-mail</strong> : vos
          informations seront comparées à celles de votre inscription.
        </span>
      </StatusCard>
    )
  }

  if (challenge) {
    const waitS = Math.max(0, RESEND_COOLDOWN_S - Math.floor((now - challenge.sentAt) / 1000))
    return (
      <StatusCard icon={<EnvelopeSimple size={26} weight="duotone" />} title="Vérifiez votre e-mail">
        <span className="block">
          Saisissez le code à 6 chiffres envoyé à{' '}
          <span className="font-medium text-slate-900 dark:text-white">{challenge.emailMasked}</span>. Il expire dans{' '}
          {challenge.expiresInMinutes} minutes.
        </span>
        <form onSubmit={onVerify} className="mt-8 space-y-5 text-left">
          <OtpInput value={otp} onChange={setOtp} disabled={verifyMutation.isPending} aria-label="Code de vérification" />
          {challenge.debugOtp && (
            <p className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-2 text-center font-mono text-xs text-amber-700 dark:text-amber-400">
              DEBUG : {challenge.debugOtp}
            </p>
          )}
          {otpError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-rose-500/25 bg-rose-500/[0.06] p-3 text-sm text-rose-700 dark:text-rose-300"
            >
              <WarningCircle size={18} className="mt-0.5 shrink-0" />
              {otpError}
            </div>
          )}
          <Button
            type="submit"
            size="lg"
            variant="accent"
            className="w-full"
            disabled={otp.length !== 6 || verifyMutation.isPending}
            trailing={
              verifyMutation.isPending ? <CircleNotch size={16} className="animate-spin" /> : <CheckCircle size={16} weight="bold" />
            }
          >
            {verifyMutation.isPending ? 'Vérification…' : 'Confirmer mon inscription'}
          </Button>
          <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-200/70 pt-4 text-sm sm:flex-row dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => {
                setChallenge(null)
                setOtpError(null)
              }}
              className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
            >
              <PencilSimple size={15} /> Modifier mes informations
            </button>
            <button
              type="button"
              onClick={sendCode}
              disabled={waitS > 0 || startMutation.isPending}
              className="inline-flex items-center gap-1.5 font-medium text-brand-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline dark:text-brand-300"
            >
              <ArrowClockwise size={15} />
              {waitS > 0 ? `Renvoyer le code (${waitS} s)` : 'Renvoyer le code'}
            </button>
          </div>
        </form>
      </StatusCard>
    )
  }

  /* ─── Formulaire ─── */

  return (
    <div className="relative isolate pb-16 pt-6">
      <Backdrop pattern="dots" />
      <div className="section-container relative">
      <Reveal
        immediate
        className="relative grid overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-1.5 shadow-lift dark:border-white/[0.08] dark:bg-night-900/70 lg:grid-cols-[0.85fr_1.15fr]"
      >
        {/* Visuel */}
        <aside className="relative hidden overflow-hidden rounded-[1.25rem] lg:block">
          <img src={heroCampus} alt="Étudiants de l'UCAO" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-brand-950/75" />
          <div className="relative flex h-full flex-col justify-end gap-6 p-10 text-white">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-crimson-700 px-3 py-1 text-xs font-medium">
              Avant le vote
            </span>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight">Inscrivez-vous pour pouvoir voter</h2>
            <ol className="space-y-3 text-sm text-white/85">
              {[
                'Remplissez le formulaire avec vos informations exactes.',
                'Confirmez votre e-mail avec le code reçu.',
                'L’administration vérifie les inscriptions.',
                'Le jour du vote, identifiez-vous avec le même matricule et le même e-mail.',
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </aside>

        {/* Formulaire */}
        <div className="px-5 py-8 sm:px-10 sm:py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Inscription</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Tous les champs sont obligatoires. Un code vous sera envoyé par e-mail pour confirmer votre adresse.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-8 space-y-6">
            <fieldset className="space-y-4">
              <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <User size={16} className="text-brand-600 dark:text-brand-300" /> Identité
              </legend>
              <Field id="reg-matricule" label="Numéro matricule" error={errors.matricule}>
                <IconInput
                  id="reg-matricule"
                  icon={<Fingerprint size={20} />}
                  value={form.matricule}
                  onChange={(e) => set('matricule', e.target.value)}
                  placeholder="Ex : UCAO26A001"
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={Boolean(errors.matricule)}
                  aria-describedby={errors.matricule ? 'reg-matricule-error' : undefined}
                  className="uppercase placeholder:normal-case"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="reg-lastname" label="Nom" error={errors.lastName}>
                  <input
                    id="reg-lastname"
                    value={form.lastName}
                    onChange={(e) => set('lastName', e.target.value)}
                    autoComplete="family-name"
                    placeholder="Ex : AGBEKO"
                    aria-invalid={Boolean(errors.lastName)}
                    className="tt-field-outline h-12 w-full rounded-xl"
                  />
                </Field>
                <Field id="reg-firstname" label="Prénoms" error={errors.firstName}>
                  <input
                    id="reg-firstname"
                    value={form.firstName}
                    onChange={(e) => set('firstName', e.target.value)}
                    autoComplete="given-name"
                    placeholder="Ex : Kossi Jean"
                    aria-invalid={Boolean(errors.firstName)}
                    className="tt-field-outline h-12 w-full rounded-xl"
                  />
                </Field>
              </div>
              <Field
                id="reg-email"
                label="Adresse e-mail"
                error={errors.email}
                hint="Cette adresse sera liée à votre matricule : elle sera exigée le jour du vote."
              >
                <IconInput
                  id="reg-email"
                  icon={<EnvelopeSimple size={20} />}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="votre.nom@exemple.com"
                  aria-invalid={Boolean(errors.email)}
                />
              </Field>
            </fieldset>

            <hr className="border-slate-200/70 dark:border-white/[0.06]" />

            <fieldset className="space-y-4">
              <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <GraduationCap size={16} className="text-brand-600 dark:text-brand-300" /> Parcours
              </legend>
              <div className="grid gap-4 sm:grid-cols-[1fr_1.4fr]">
                <Field id="reg-faculty" label="Institut" error={errors.facultyCode}>
                  <select
                    id="reg-faculty"
                    value={form.facultyCode}
                    onChange={(e) => set('facultyCode', e.target.value)}
                    aria-invalid={Boolean(errors.facultyCode)}
                    className={selectClass}
                  >
                    <option value="">Choisir…</option>
                    {faculties.map((f) => (
                      <option key={f.code} value={f.code}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  id="reg-department"
                  label="Filière"
                  error={errors.departmentCode}
                  hint={form.facultyCode ? undefined : 'Choisissez d’abord votre institut.'}
                >
                  <div className="relative">
                    <Buildings
                      size={20}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      id="reg-department"
                      value={form.departmentCode}
                      onChange={(e) => set('departmentCode', e.target.value)}
                      disabled={!form.facultyCode}
                      aria-invalid={Boolean(errors.departmentCode)}
                      className={`${selectClass} pl-11`}
                    >
                      <option value="">{form.facultyCode ? 'Choisir…' : '—'}</option>
                      {departments.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </Field>
              </div>
              <div className="sm:max-w-[calc(50%-0.5rem)]">
                <Field id="reg-level" label="Année" error={errors.levelName}>
                  <select
                    id="reg-level"
                    value={form.levelName}
                    onChange={(e) => set('levelName', e.target.value as FormState['levelName'])}
                    aria-invalid={Boolean(errors.levelName)}
                    className={selectClass}
                  >
                    <option value="">Choisir…</option>
                    {levels.map((l) => (
                      <option key={l.name} value={l.name}>
                        {LEVEL_LABELS[l.name] ?? l.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </fieldset>

            <div className="space-y-1.5">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm text-slate-700 dark:border-white/10 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={form.certify}
                  onChange={(e) => set('certify', e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-[var(--color-brand-600)]"
                  aria-invalid={Boolean(errors.certify)}
                />
                Je certifie l’exactitude de ces informations. Je sais qu’elles seront contrôlées avant le vote et
                comparées à celles saisies le jour du vote.
              </label>
              {errors.certify && <p className="text-xs text-rose-600 dark:text-rose-400">{errors.certify}</p>}
            </div>

            {submitError && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-rose-500/25 bg-rose-500/[0.06] p-4 text-sm text-rose-700 dark:text-rose-300"
              >
                <WarningCircle size={18} className="mt-0.5 shrink-0" />
                {submitError}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              variant="accent"
              disabled={startMutation.isPending}
              className="w-full"
              trailing={
                startMutation.isPending ? <CircleNotch size={16} className="animate-spin" /> : <ArrowRight size={16} weight="bold" />
              }
            >
              {startMutation.isPending ? 'Envoi du code…' : 'Recevoir mon code de vérification'}
            </Button>

            <p className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={14} className="text-brand-600 dark:text-brand-300" />
              Vos données servent uniquement à l’organisation du vote.
            </p>
          </form>
        </div>
      </Reveal>
      </div>
    </div>
  )
}

function StatusCard({
  icon,
  title,
  children,
  action,
  tone = 'neutral',
}: {
  icon: ReactNode
  title: string
  children: ReactNode
  action?: ReactNode
  tone?: 'neutral' | 'success'
}) {
  return (
    <div className="relative isolate">
      <Backdrop pattern="grid" />
      <div className="relative mx-auto flex min-h-[calc(100dvh-7rem)] max-w-xl flex-col justify-center px-4 py-12 sm:px-6">
        <Reveal
          immediate
          className="rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-lift dark:border-white/[0.08] dark:bg-night-900/70 sm:p-10"
        >
          <div
            className={`mx-auto flex size-14 items-center justify-center rounded-2xl ${
              tone === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
            }`}
          >
            {icon}
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h1>
          <div className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{children}</div>
          {action && <div className="mt-8 flex justify-center">{action}</div>}
        </Reveal>
      </div>
    </div>
  )
}
