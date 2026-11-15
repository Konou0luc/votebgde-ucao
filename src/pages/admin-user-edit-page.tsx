import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, KeyRound, Mail, Save, Shield, ShieldAlert, ShieldCheck, UserPlus } from 'lucide-react'
import { useAdminAuthStore } from '../modules/admin-dashboard/auth-store'
import { useToastStore } from '../shared/ui/toast-store'
import { useAdminUsersQuery, useCreateAdminMutation, useUpdateAdminMutation } from '../modules/admin-dashboard/hooks'
import { getAdminErrorMessage } from '../modules/admin-dashboard/api'
import { ALL_PERMISSIONS } from '../modules/admin-dashboard/permission-labels'
import { ADMIN_PRIVATE_PATH } from '../shared/constants/routes'
import type { AdminRole } from '../modules/admin-dashboard/types'
import { AdminButton, AdminButtonLink, EmptyState, Field, LoadingState, PageHeader, Panel } from '../shared/ui/admin-ui'
import { adminInput } from '../shared/ui/admin-ui-classes'

export function AdminUserEditPage() {
  const { userId } = useParams<{ userId?: string }>()
  const navigate = useNavigate()
  const admin = useAdminAuthStore((s) => s.admin)
  const pushToast = useToastStore((s) => s.pushToast)
  
  const usersQuery = useAdminUsersQuery()
  const createMutation = useCreateAdminMutation()
  const updateMutation = useUpdateAdminMutation()

  const isEditMode = Boolean(userId)
  const editingUser = usersQuery.data?.find((u) => u.id === userId)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'STANDARD_ADMIN' as AdminRole,
    permissions: ['scrutin:read', 'candidate-list:read', 'dashboard:read'] as string[],
    isActive: true,
  })

  useEffect(() => {
    if (isEditMode && editingUser) {
      setFormData({
        email: editingUser.email,
        password: '',
        role: editingUser.role,
        permissions: editingUser.permissions,
        isActive: editingUser.isActive,
      })
    }
  }, [isEditMode, editingUser])

  if (admin?.role !== 'SUPER_ADMIN') {
    return (
      <Panel>
        <EmptyState
          icon={ShieldAlert}
          title="Accès restreint"
          description="Seuls les super administrateurs peuvent gérer les comptes."
          action={<AdminButtonLink to={ADMIN_PRIVATE_PATH}>Retour</AdminButtonLink>}
        />
      </Panel>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEditMode && userId) {
        await updateMutation.mutateAsync({
          id: userId,
          payload: {
            email: formData.email,
            role: formData.role,
            permissions: formData.permissions,
            isActive: formData.isActive,
            ...(formData.password ? { password: formData.password } : {}),
          },
        })
        pushToast('Administrateur mis à jour.', 'success')
      } else {
        if (!formData.password) {
          pushToast('Le mot de passe est requis.', 'error')
          return
        }
        await createMutation.mutateAsync({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          permissions: formData.permissions,
        })
        pushToast('Nouvel administrateur créé.', 'success')
      }
      navigate(`${ADMIN_PRIVATE_PATH}/utilisateurs`)
    } catch (err) {
      pushToast(getAdminErrorMessage(err, 'Action impossible.'), 'error')
    }
  }

  const togglePermission = (permId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId],
    }))
  }

  if (isEditMode && usersQuery.isLoading) {
    return <LoadingState />
  }

  const isSuper = formData.role === 'SUPER_ADMIN'
  const saving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <PageHeader
        back={{ to: `${ADMIN_PRIVATE_PATH}/utilisateurs`, label: 'Utilisateurs' }}
        title={isEditMode ? "Modifier l'administrateur" : 'Nouvel administrateur'}
        description={isEditMode ? `Compte ${formData.email}` : 'Créez un compte avec des accès adaptés à son rôle.'}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Panel title="Identifiants" icon={KeyRound}>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="E-mail" htmlFor="u-email" required>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
                <input
                  id="u-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`${adminInput} pl-9`}
                  placeholder="admin@example.com"
                  autoComplete="off"
                />
              </div>
            </Field>
            <Field
              label="Mot de passe"
              htmlFor="u-password"
              required={!isEditMode}
              hint={isEditMode ? 'Laissez vide pour conserver le mot de passe actuel.' : undefined}
            >
              <input
                id="u-password"
                type="password"
                required={!isEditMode}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={adminInput}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </Field>
          </div>
        </Panel>

        <Panel title="Rôle et permissions" icon={Shield} delay={0.05}>
          <fieldset>
            <legend className="mb-3 text-[15px] font-medium text-slate-700 dark:text-slate-300">Rôle</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(['STANDARD_ADMIN', 'SUPER_ADMIN'] as const).map((role) => {
                const selected = formData.role === role
                return (
                  <button
                    key={role}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setFormData({ ...formData, role: role as AdminRole })}
                    className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-[border-color,box-shadow,background-color] ${
                      selected
                        ? 'border-brand-500 bg-brand-500/[0.04] ring-4 ring-brand-500/10 dark:border-brand-400 dark:ring-brand-400/15'
                        : 'border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20'
                    }`}
                  >
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                        selected ? 'bg-brand-600 text-white dark:bg-brand-500' : 'bg-slate-100 text-slate-500 dark:bg-white/[0.06]'
                      }`}
                    >
                      {role === 'SUPER_ADMIN' ? <ShieldCheck className="size-4" /> : <Shield className="size-4" />}
                    </span>
                    <span>
                      <span className="block text-[15px] font-medium text-slate-950 dark:text-white">
                        {role === 'SUPER_ADMIN' ? 'Super admin' : 'Administrateur'}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-slate-500">
                        {role === 'SUPER_ADMIN' ? 'Accès total, gestion des comptes et de l’audit.' : 'Accès limité aux permissions choisies.'}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <fieldset className="mt-6 border-t border-slate-100 pt-6 dark:border-white/[0.06]">
            <div className="mb-3 flex items-center justify-between">
              <legend className="text-[15px] font-medium text-slate-700 dark:text-slate-300">Permissions</legend>
              {isSuper && <span className="text-[13px] text-amber-600 dark:text-amber-400">Toutes incluses pour un super admin</span>}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {ALL_PERMISSIONS.map((perm) => {
                const checked = isSuper || formData.permissions.includes(perm.id)
                return (
                  <label
                    key={perm.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-[15px] transition-colors ${
                      checked
                        ? 'border-brand-500/30 bg-brand-500/[0.04] text-slate-900 dark:border-brand-400/40 dark:text-white'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:text-slate-400'
                    } ${isSuper ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={checked}
                      disabled={isSuper}
                      onChange={() => togglePermission(perm.id)}
                    />
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 ${
                        checked ? 'border-brand-600 bg-brand-600 text-white dark:border-brand-500 dark:bg-brand-500' : 'border-slate-300 dark:border-white/20'
                      }`}
                    >
                      {checked && <Check className="size-3" strokeWidth={3} />}
                    </span>
                    {perm.label}
                  </label>
                )
              })}
            </div>
          </fieldset>

          <label className="mt-6 flex cursor-pointer items-center justify-between gap-4 border-t border-slate-100 pt-6 dark:border-white/[0.06]">
            <span>
              <span className="block text-[15px] font-medium text-slate-900 dark:text-white">Compte actif</span>
              <span className="block text-[13px] text-slate-500">Autoriser la connexion à la console.</span>
            </span>
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="peer sr-only"
            />
            <span className="relative h-5 w-9 shrink-0 rounded-full bg-slate-200 transition-colors peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 dark:bg-white/15 after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4" />
          </label>
        </Panel>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AdminButton variant="ghost" onClick={() => navigate(`${ADMIN_PRIVATE_PATH}/utilisateurs`)}>
            Annuler
          </AdminButton>
          <AdminButton type="submit" variant="primary" loading={saving} icon={isEditMode ? Save : UserPlus}>
            {isEditMode ? 'Enregistrer les modifications' : "Créer l'administrateur"}
          </AdminButton>
        </div>
      </form>
    </div>
  )
}
