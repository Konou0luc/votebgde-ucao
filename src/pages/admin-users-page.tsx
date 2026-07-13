import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Loader2,
  Shield,
  Trash2,
  Pencil,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  UserPlus,
} from 'lucide-react'
import { useAdminAuthStore } from '../modules/admin-dashboard/auth-store'
import { useToastStore } from '../shared/ui/toast-store'
import {
  useAdminUsersQuery,
  useDeleteAdminMutation,
} from '../modules/admin-dashboard/hooks'
import { getAdminErrorMessage } from '../modules/admin-dashboard/api'
import { ADMIN_PRIVATE_PATH } from '../shared/constants/routes'
import { ConfirmModal } from '../shared/ui/confirm-modal'

export function AdminUsersPage() {
  const navigate = useNavigate()
  const admin = useAdminAuthStore((s) => s.admin)
  const pushToast = useToastStore((s) => s.pushToast)
  const usersQuery = useAdminUsersQuery()
  const deleteMutation = useDeleteAdminMutation()

  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; userId: string | null }>({
    isOpen: false,
    userId: null,
  })

  if (admin?.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-rose-50 p-4 dark:bg-rose-500/10">
          <ShieldAlert className="size-12 text-rose-600" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Accès Restreint</h1>
        <p className="mt-2 text-slate-500">Seuls les Super Administrateurs peuvent accéder à cette page.</p>
        <Link to={ADMIN_PRIVATE_PATH} className="mt-6 font-medium text-blue-600 hover:underline">
          Retour au tableau de bord
        </Link>
      </div>
    )
  }

  const handleDelete = async () => {
    if (!confirmDelete.userId) return
    try {
      await deleteMutation.mutateAsync(confirmDelete.userId)
      pushToast('Administrateur supprimé.', 'success')
    } catch (err) {
      pushToast(getAdminErrorMessage(err, 'Suppression impossible.'), 'error')
    } finally {
      setConfirmDelete({ isOpen: false, userId: null })
    }
  }

  return (
    <div className="mx-auto max-w-6xl pb-24 pt-12">
      <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <Link
            to={ADMIN_PRIVATE_PATH}
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="size-3" strokeWidth={2.5} />
            Dashboard
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tighter text-slate-950 dark:text-white">
              Gestion des Admins
            </h1>
            <p className="text-slate-500">Gérez les comptes et les permissions de l&apos;équipe.</p>
          </div>
        </div>

        <button
          onClick={() => navigate(`${ADMIN_PRIVATE_PATH}/utilisateurs/nouveau`)}
          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.98]"
        >
          <span className="relative z-10 flex items-center gap-2">
            <UserPlus className="size-4" strokeWidth={2} />
            Nouvel Admin
          </span>
        </button>
      </header>

      {usersQuery.isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {usersQuery.data?.map((user) => (
            <div
              key={user.id}
              className="group relative rounded-[2rem] border border-slate-200 bg-white p-1.5 transition-all hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 dark:border-white/[0.08] dark:bg-slate-900"
            >
              <div className="flex h-full flex-col rounded-[calc(2rem-0.375rem)] bg-white p-6 dark:bg-slate-950">
                <div className="mb-4 flex items-start justify-between">
                  <div className={`rounded-full p-2.5 ${user.role === 'SUPER_ADMIN' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10'}`}>
                    {user.role === 'SUPER_ADMIN' ? <ShieldCheck className="size-6" strokeWidth={1.5} /> : <Shield className="size-6" strokeWidth={1.5} />}
                  </div>
                  <div className="flex gap-1">
                    <Link
                      to={`${ADMIN_PRIVATE_PATH}/utilisateurs/${user.id}/modifier`}
                      className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-white/5"
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <button
                      onClick={() => setConfirmDelete({ isOpen: true, userId: user.id })}
                      disabled={user.id === admin?.id}
                      className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 disabled:opacity-30"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-6 space-y-1">
                  <h3 className="truncate font-bold text-slate-900 dark:text-white">{user.email}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${user.role === 'SUPER_ADMIN' ? 'text-amber-600' : 'text-blue-600'}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${user.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>

                <div className="mt-auto space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Permissions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.permissions.length > 0 ? (
                      user.permissions.map((p) => (
                        <span
                          key={p}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-white/5 dark:text-slate-400"
                        >
                          {p.split(':')[1]}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] italic text-slate-400 text-slate-500">Aucune permission</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Supprimer l'administrateur"
        message="Voulez-vous vraiment supprimer ce compte administrateur ? Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, userId: null })}
      />
    </div>
  )
}
