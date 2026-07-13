import { useState, useEffect } from 'react'
import {
  User,
  Lock,
  Mail,
  Shield,
  Loader2,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuthStore } from '../modules/admin-dashboard/auth-store'
import { ADMIN_PRIVATE_PATH } from '../shared/constants/routes'
import { httpClient } from '../shared/api/http-client'
import { getAdminErrorMessage } from '../modules/admin-dashboard/api'
import { useToastStore } from '../shared/ui/toast-store'

export function AdminProfilePage() {
  const admin = useAdminAuthStore((s) => s.admin)
  const setSession = useAdminAuthStore((s) => s.setSession)
  const accessToken = useAdminAuthStore((s) => s.accessToken)
  const refreshToken = useAdminAuthStore((s) => s.refreshToken)
  const pushToast = useToastStore((s) => s.pushToast)
  const location = useLocation()
  const navigate = useNavigate()
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [isPending, setIsPending] = useState(false)
  
  const isForcedChange = location.state?.forcePasswordChange || admin?.needsPasswordChange

  useEffect(() => {
    if (isForcedChange) {
      pushToast('Veuillez changer votre mot de passe pour continuer.', 'error')
    }
  }, [isForcedChange])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      pushToast('Les nouveaux mots de passe ne correspondent pas.', 'error')
      return
    }

    setIsPending(true)

    try {
      await httpClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      })
      pushToast('Votre mot de passe a été modifié avec succès.', 'success')
      
      // Mettre à jour le store si c'était un changement forcé
      if (admin && (isForcedChange)) {
        setSession({
          accessToken: accessToken!,
          refreshToken: refreshToken!,
          admin: { ...admin, needsPasswordChange: false }
        })
        navigate(ADMIN_PRIVATE_PATH, { replace: true })
      }

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      pushToast(getAdminErrorMessage(err, 'Impossible de modifier le mot de passe.'), 'error')
    } finally {
      setIsPending(false)
    }
  }

  if (!admin) return null

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <header className="flex flex-col gap-4">
        {!isForcedChange && (
          <Link
            to={ADMIN_PRIVATE_PATH}
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="size-3" strokeWidth={2} />
            Retour au tableau de bord
          </Link>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">
            {isForcedChange ? 'Changement de mot de passe obligatoire' : 'Mon Profil'}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {isForcedChange 
              ? 'Pour des raisons de sécurité, vous devez modifier votre mot de passe provisoire avant de continuer.' 
              : 'Gérez vos informations personnelles et la sécurité de votre compte.'}
          </p>
        </div>
      </header>

      {isForcedChange && (
        <div className="flex items-center gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-500/20 dark:bg-amber-500/10">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
            <AlertTriangle className="size-6" strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-amber-900 dark:text-amber-400">Première connexion détectée</p>
            <p className="text-sm text-amber-700 dark:text-amber-500/80">
              Votre accès au tableau de bord sera débloqué immédiatement après la mise à jour de votre mot de passe.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Informations générales */}
        <div className="lg:col-span-1">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/[0.06] dark:bg-slate-900/50">
            <div className="flex flex-col items-center text-center">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 ring-1 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
                <User className="size-10" strokeWidth={1.25} />
              </div>
              <h2 className="mt-4 font-bold text-slate-950 dark:text-white">{admin.email}</h2>
              <div className="mt-2 flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-white/5 dark:text-slate-400">
                <Shield className="size-3" />
                {admin.role === 'SUPER_ADMIN' ? 'Super Administrateur' : 'Administrateur'}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="size-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">{admin.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modification du mot de passe */}
        <div className="lg:col-span-2">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/[0.06] dark:bg-slate-900/50">
            <div className="border-b border-slate-100 p-6 dark:border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400">
                  <Lock className="size-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 dark:text-white">Sécurité</h3>
                  <p className="text-xs text-slate-500">Modifier votre mot de passe d&apos;accès</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-white/5"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-white/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-white/5"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Lock className="size-4" />
                    )}
                    Mettre à jour le mot de passe
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
