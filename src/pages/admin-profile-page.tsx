import { useState, useEffect } from 'react'
import { AlertTriangle, KeyRound, Lock, Mail, Shield, ShieldCheck } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { roleLabel, permissionLabel } from '../modules/admin-dashboard/permission-labels'
import { AdminButton, Badge, Field, PageHeader, Panel } from '../shared/ui/admin-ui'
import { adminInput } from '../shared/ui/admin-ui-classes'
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

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword
  const isSuper = admin.role === 'SUPER_ADMIN'

  return (
    <div className="pb-12">
      <PageHeader
        back={isForcedChange ? undefined : { to: ADMIN_PRIVATE_PATH, label: "Vue d'ensemble" }}
        title={isForcedChange ? 'Changement de mot de passe obligatoire' : 'Mon profil'}
        description={
          isForcedChange
            ? 'Pour des raisons de sécurité, vous devez modifier votre mot de passe provisoire avant de continuer.'
            : 'Vos informations et la sécurité de votre compte.'
        }
      />

      {isForcedChange && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
          <div>
            <p className="text-[15px] font-medium text-amber-900 dark:text-amber-300">Première connexion</p>
            <p className="mt-0.5 text-[15px] text-amber-800/80 dark:text-amber-400/80">
              L’accès au tableau de bord sera débloqué dès la mise à jour de votre mot de passe.
            </p>
          </div>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Panel>
          <div className="flex flex-col items-center py-2 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-brand-600 text-xl font-semibold text-white">
              {admin.email.slice(0, 2).toUpperCase()}
            </span>
            <p className="mt-4 max-w-full truncate font-medium text-slate-950 dark:text-white">{admin.email}</p>
            <Badge tone={isSuper ? 'warning' : 'brand'} icon={isSuper ? ShieldCheck : Shield} className="mt-2">
              {roleLabel(admin.role)}
            </Badge>
          </div>
          <dl className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-[15px] dark:border-white/[0.06]">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
              <Mail className="size-4 shrink-0 text-slate-400" strokeWidth={1.75} />
              <span className="truncate">{admin.email}</span>
            </div>
          </dl>
          {!isSuper && admin.permissions?.length > 0 && (
            <div className="mt-5 border-t border-slate-100 pt-5 dark:border-white/[0.06]">
              <p className="mb-2 text-[13px] font-medium text-slate-500">Permissions</p>
              <div className="flex flex-wrap gap-1.5">
                {admin.permissions.map((p) => (
                  <Badge key={p}>{permissionLabel(p)}</Badge>
                ))}
              </div>
            </div>
          )}
        </Panel>

        <Panel className="lg:col-span-2" title="Mot de passe" description="Modifiez votre mot de passe d'accès" icon={Lock} delay={0.05}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Mot de passe actuel" htmlFor="pw-current" required>
              <input
                id="pw-current"
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={adminInput}
              />
            </Field>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nouveau mot de passe" htmlFor="pw-new" required hint="8 caractères minimum.">
                <input
                  id="pw-new"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={adminInput}
                />
              </Field>
              <Field
                label="Confirmer le mot de passe"
                htmlFor="pw-confirm"
                required
                hint={mismatch ? <span className="text-rose-600 dark:text-rose-400">Les mots de passe ne correspondent pas.</span> : undefined}
              >
                <input
                  id="pw-confirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${adminInput} ${mismatch ? '!border-rose-400' : ''}`}
                />
              </Field>
            </div>
            <div className="flex justify-end border-t border-slate-100 pt-5 dark:border-white/[0.06]">
              <AdminButton type="submit" variant="primary" icon={KeyRound} loading={isPending}>
                Mettre à jour le mot de passe
              </AdminButton>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  )
}
