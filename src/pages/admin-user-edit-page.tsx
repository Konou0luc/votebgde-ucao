import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Loader2,
  Shield,
  Mail,
  Check,
  ShieldCheck,
  ArrowLeft,
  Save,
  UserPlus,
} from 'lucide-react'
import { useAdminAuthStore } from '../modules/admin-dashboard/auth-store'
import { useToastStore } from '../shared/ui/toast-store'
import {
  useAdminUsersQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
} from '../modules/admin-dashboard/hooks'
import { getAdminErrorMessage } from '../modules/admin-dashboard/api'
import { ADMIN_PRIVATE_PATH } from '../shared/constants/routes'
import type { AdminRole } from '../modules/admin-dashboard/types'

const ALL_PERMISSIONS = [
  { id: 'scrutin:read', label: 'Voir Scrutins' },
  { id: 'scrutin:write', label: 'Gérer Scrutins' },
  { id: 'candidate-list:read', label: 'Voir Listes' },
  { id: 'candidate-list:write', label: 'Gérer Listes' },
  { id: 'results:publish', label: 'Publier Résultats' },
  { id: 'dashboard:read', label: 'Voir Dashboard' },
  { id: 'audit:read', label: 'Voir Audit' },
]

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
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <Shield className="size-12 text-rose-600 mb-4" />
        <h1 className="text-2xl font-bold">Accès Restreint</h1>
        <Link to={ADMIN_PRIVATE_PATH} className="mt-4 text-blue-600">Retour</Link>
      </div>
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
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl pb-24 pt-12">
      <header className="mb-12 space-y-4">
        <Link
          to={`${ADMIN_PRIVATE_PATH}/utilisateurs`}
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="size-3" strokeWidth={2.5} />
          Retour aux utilisateurs
        </Link>
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tighter text-slate-950 dark:text-white">
            {isEditMode ? 'Modifier l\'Admin' : 'Nouvel Administrateur'}
          </h1>
          <p className="text-slate-500">
            {isEditMode ? `Modification du compte ${formData.email}` : 'Créez un nouveau compte avec des accès spécifiques.'}
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-white/[0.08] dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-slate-950"
                  placeholder="admin@example.com"
                />
              </div>
            </div>
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Mot de passe {isEditMode && '(Optionnel)'}
              </label>
              <input
                type="password"
                required={!isEditMode}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-slate-950"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Rôle Principal</label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(['STANDARD_ADMIN', 'SUPER_ADMIN'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: role as AdminRole })}
                  className={`flex items-center gap-4 rounded-2xl border p-5 transition text-left ${
                    formData.role === role
                      ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-500/10'
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 dark:border-white/5 dark:bg-slate-800/50'
                  }`}
                >
                  <div className={`rounded-xl p-2 ${formData.role === role ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-950'}`}>
                    {role === 'SUPER_ADMIN' ? <ShieldCheck className="size-5" /> : <Shield className="size-5" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest">{role.replace('_', ' ')}</p>
                    <p className="text-[10px] opacity-70">
                      {role === 'SUPER_ADMIN' ? 'Accès total sans restrictions' : 'Accès limité aux permissions choisies'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-12 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">Permissions Détaillées</h3>
              {formData.role === 'SUPER_ADMIN' && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                  Toutes les permissions incluses
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ALL_PERMISSIONS.map((perm) => (
                <button
                  key={perm.id}
                  type="button"
                  disabled={formData.role === 'SUPER_ADMIN'}
                  onClick={() => togglePermission(perm.id)}
                  className={`flex items-center justify-between rounded-2xl border px-5 py-4 transition ${
                    formData.permissions.includes(perm.id) || formData.role === 'SUPER_ADMIN'
                      ? 'border-emerald-500/30 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'border-slate-100 bg-slate-50 text-slate-500 dark:border-white/5 dark:bg-slate-800/50 hover:border-slate-200'
                  } ${formData.role === 'SUPER_ADMIN' ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span className="text-xs font-bold">{perm.label}</span>
                  {(formData.permissions.includes(perm.id) || formData.role === 'SUPER_ADMIN') ? (
                    <div className="rounded-full bg-emerald-500 p-0.5 text-white">
                      <Check className="size-3" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="size-4 rounded-full border-2 border-slate-200 dark:border-slate-700" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-12 flex items-center gap-3 rounded-2xl bg-slate-50 p-6 dark:bg-white/5">
            <div className="relative flex h-6 items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="peer size-5 cursor-pointer appearance-none rounded-lg border-2 border-slate-200 bg-white transition-all checked:border-blue-500 checked:bg-blue-500 dark:border-white/10 dark:bg-slate-950"
              />
              <Check className="pointer-events-none absolute left-1 top-1/2 size-3 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={4} />
            </div>
            <label htmlFor="isActive" className="cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-300">
              Compte actif (autoriser la connexion)
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(`${ADMIN_PRIVATE_PATH}/utilisateurs`)}
            className="rounded-full px-8 py-4 text-sm font-bold text-slate-500 transition hover:text-slate-900 dark:hover:text-white"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="inline-flex items-center gap-3 rounded-full bg-blue-600 px-10 py-4 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : isEditMode ? (
              <Save className="size-5" />
            ) : (
              <UserPlus className="size-5" />
            )}
            {isEditMode ? 'Enregistrer les modifications' : 'Créer l\'administrateur'}
          </button>
        </div>
      </form>
    </div>
  )
}
