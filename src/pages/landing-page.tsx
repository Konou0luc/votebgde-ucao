import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import heroCampus from '../../assets/ucao-l1.jpeg'
import gatheringPhoto from '../../assets/ucao-rassemblement.jpeg'
import stepMatricule from '../../assets/etape1.png'
import stepOtpReceive from '../../assets/3d-mobile-phone-with-security-code-padlock.webp'
import stepOtpVerify from '../../assets/portrait-young-man-railway-station.webp'
import stepCandidate from '../../assets/person-putting-red-ballot-election-box.webp'
import stepConfirm from '../../assets/young-black-woman-with-long-locs-hairstyles-standing-outside-with-cup-take-away-coffee-woman-wearing-brown-coat-orange-scarf-black-hat.webp'

const onboardingSteps = [
  {
    title: 'Verification matricule',
    description:
      'L etudiant confirme son identite avec un matricule valide avant toute action de vote.',
    image: stepMatricule,
    alt: 'Ecran de verification matricule VoteBGDE — saisie du matricule et de l e-mail',
  },
  {
    title: 'Reception OTP',
    description:
      'Le systeme envoie un code temporaire sur le canal autorise pour renforcer la securite.',
    image: stepOtpReceive,
    alt: 'Telephone affichant la reception du code OTP',
  },
  {
    title: 'Verification OTP',
    description:
      'Le code recu est verifie en temps reel pour autoriser le passage a la selection de liste.',
    image: stepOtpVerify,
    alt: 'Etudiant validant le code OTP',
  },
  {
    title: 'Selection liste candidate',
    description:
      'L etudiant choisit une liste candidate dans une interface claire et mobile-friendly.',
    image: stepCandidate,
    alt: 'Bulletin symbolisant la selection de la liste candidate',
  },
  {
    title: 'Confirmation du vote',
    description:
      'Une etape finale de verification confirme la prise en compte du vote en toute transparence.',
    image: stepConfirm,
    alt: 'Etudiante apres confirmation du vote',
  },
]

export function LandingPage() {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const activeStep = onboardingSteps[activeStepIndex]

  function goToPreviousStep() {
    setActiveStepIndex((prev) =>
      prev === 0 ? onboardingSteps.length - 1 : prev - 1,
    )
  }

  function goToNextStep() {
    setActiveStepIndex((prev) =>
      prev === onboardingSteps.length - 1 ? 0 : prev + 1,
    )
  }

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveStepIndex((prev) =>
        prev === onboardingSteps.length - 1 ? 0 : prev + 1,
      )
    }, 4500)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <main className="mx-auto min-h-[100dvh] w-full min-w-0 max-w-[1400px] px-4 pb-12 md:px-8 lg:pb-16">
      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-slate-900">
        <img
          src={heroCampus}
          alt="Etudiants dans un laboratoire informatique universitaire"
          className="absolute inset-0 h-full w-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-900/70 to-slate-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_22%,rgba(59,130,246,0.16),transparent_42%)]" />

        <div className="relative mx-auto flex min-h-[72dvh] w-full max-w-[1600px] items-center px-4 py-14 md:min-h-[78dvh] md:px-8 md:py-20">
          <div className="grid w-full items-end gap-8 lg:grid-cols-12">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="space-y-9 py-2 text-white lg:col-span-8 lg:space-y-7 lg:py-0"
            >
              <h1 className="max-w-5xl text-balance text-4xl font-semibold tracking-tight md:text-6xl">
                Conduisez un scrutin numerique institutionnel, clair et fiable
              </h1>
              <p className="max-w-[62ch] text-base leading-relaxed text-slate-100/90 md:text-lg">
                VoteBGDE orchestre un parcours de vote rigoureux, lisible et
                rapide, adapte aux usages mobiles et aux contraintes de
                gouvernance universitaire.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/vote"
                  className="group inline-flex min-h-12 items-center justify-between rounded-full bg-blue-600 pl-6 pr-2 text-sm font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-blue-500 active:scale-[0.98]"
                >
                  Demarrer le vote
                  <span className="ml-3 inline-flex size-8 items-center justify-center rounded-full bg-white/20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                    <ArrowRight size={16} />
                  </span>
                </Link>
                <span className="text-sm text-slate-100/90">
                  Experience adaptee a toutes les tailles d ecran
                </span>
              </div>
            </motion.div>

            <div className="hidden lg:col-span-4 lg:block">
              <div className="space-y-4 border-l border-white/35 pl-5 text-white">
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                  Vision institutionnelle
                </p>
                <p className="text-base leading-relaxed text-white/90">
                  Le processus se deploie dans un cadre controle, transparent et
                  comprehensible par tous les acteurs du scrutin.
                </p>
                <div className="flex gap-8 pt-2">
                  <div>
                    <p className="text-3xl font-semibold">47.2%</p>
                    <p className="text-xs text-white/75">Participation a mi-journee</p>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold">2 min 18</p>
                    <p className="text-xs text-white/75">Temps moyen du parcours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative left-1/2 mt-0 w-screen -translate-x-1/2 overflow-hidden bg-white py-10 dark:bg-slate-950 md:py-12">
        <div className="relative mx-auto w-full max-w-[1600px] px-4 md:px-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
                Parcours etudiant
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 md:text-4xl">
                Un flux de vote guide, etape par etape
              </h2>
              <p className="max-w-[70ch] text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Le parcours se deroule automatiquement pour presenter chaque
                phase du vote dans le bon ordre, sans surcharge d information.
              </p>
            </div>
            <div className="inline-flex gap-2">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800"
                aria-label="Etape precedente"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800"
                aria-label="Etape suivante"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <motion.article
            key={activeStep.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid items-stretch gap-5 md:grid-cols-[1.2fr_0.8fr]"
          >
            <div className="relative min-h-[440px] overflow-hidden rounded-[1.6rem] border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900 md:h-full md:min-h-[440px]">
              <img
                src={activeStep.image}
                alt={activeStep.alt}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="flex min-h-[440px] flex-col rounded-[1.6rem] border border-slate-200 bg-white p-6 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 md:h-full md:min-h-[440px]">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
                  Etape {activeStepIndex + 1} / {onboardingSteps.length}
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
                  {activeStep.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {activeStep.description}
                </p>
              </div>

              <div className="mt-auto flex gap-2 pt-8">
                {onboardingSteps.map((_, index) => (
                  <button
                    key={`indicator-${index}`}
                    type="button"
                    onClick={() => setActiveStepIndex(index)}
                    aria-label={`Afficher l etape ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      index === activeStepIndex
                        ? 'w-10 bg-blue-400'
                        : 'w-4 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.article>
        </div>
      </section>

      <section className="relative left-1/2 mt-0 w-screen -translate-x-1/2 overflow-hidden">
        <img
          src={gatheringPhoto}
          alt="Etudiants rassembles sur le campus"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/68 to-slate-900/45" />
        <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[1600px] items-center px-4 py-12 md:px-8">
          <div className="max-w-3xl space-y-5 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-300">
              Qualite d experience
            </p>
            <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Parcours simple, rapide et rassurant
            </h2>
            <p className="max-w-[58ch] text-base leading-relaxed text-slate-200/90 md:text-lg">
              L etudiant suit un chemin direct avec des verifications progressives
              et des retours clairs a chaque action.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm">
                Identite controlee
              </span>
              <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm">
                OTP valide en direct
              </span>
              <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm">
                Vote confirme
              </span>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
