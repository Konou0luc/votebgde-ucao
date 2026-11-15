import { useState } from 'react'
import { ShieldAlert, ShieldCheck, Trash2, Pencil, UserPlus, Users } from 'lucide-react'
import { useAdminAuthStore } from '../modules/admin-dashboard/auth-store'
import { useToastStore } from '../shared/ui/toast-store'
import { useAdminUsersQuery, useDeleteAdminMutation } from '../modules/admin-dashboard/hooks'
import { getAdminErrorMessage } from '../modules/admin-dashboard/api'
import { permissionLabel, roleLabel } from '../modules/admin-dashboard/permission-labels'
import { ADMIN_PRIVATE_PATH } from '../shared/constants/routes'
import { ConfirmModal } from '../shared/ui/confirm-modal'
import {
  AdminButtonLink,
  Badge,
  EmptyState,
  ErrorState,
  IconButton,
  IconLink,
  LoadingState,
  PageHeader,
  Panel,
} from '../shared/ui/admin-ui'
import { formatDateTime, table, tableWrap, td, th, tr } from '../shared/ui/admin-ui-classes'

export function AdminUsersPage() {
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
      <Panel>
        <EmptyState
          icon={ShieldAlert}
          title="Accès restreint"
          description="Seuls les super administrateurs peuvent accéder à cette page."
          action={<AdminButtonLink to={ADMIN_PRIVATE_PATH}>Retour au tableau de bord</AdminButtonLink>}
        />
      </Panel>
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

  const users = usersQuery.data ?? []

  return (
    <div className="pb-12">
      <PageHeader
        title="Utilisateurs"
        description="Gérez les comptes administrateurs et leurs permissions."
        actions={
          <AdminButtonLink to={`${ADMIN_PRIVATE_PATH}/utilisateurs/nouveau`} variant="primary" icon={UserPlus}>
            Nouvel administrateur
          </AdminButtonLink>
        }
      />

      <Panel
        title="Comptes administrateurs"
        icon={Users}
        description={usersQuery.data ? `${users.length} compte${users.length > 1 ? 's' : ''}` : undefined}
        bodyClassName={users.length ? '!py-0' : ''}
      >
        {usersQuery.isLoading ? (
          <LoadingState compact />
        ) : usersQuery.isError ? (
          <ErrorState>Impossible de charger les administrateurs.</ErrorState>
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="Aucun administrateur" />
        ) : (
          <div className={tableWrap}>
            <table className={`${table} min-w-[820px]`}>
              <thead>
                <tr>
                  <th className={th}>Compte</th>
                  <th className={th}>Rôle</th>
                  <th className={th}>Statut</th>
                  <th className={th}>Permissions</th>
                  <th className={th}>Dernière connexion</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.id === admin?.id
                  const isSuper = user.role === 'SUPER_ADMIN'
                  return (
                    <tr key={user.id} className={tr}>
                      <td className={td}>
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                            {user.email.slice(0, 2).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-950 dark:text-white">{user.email}</p>
                            {isSelf && <p className="text-[13px] text-slate-500">Vous</p>}
                          </div>
                        </div>
                      </td>
                      <td className={td}>
                        <Badge tone={isSuper ? 'warning' : 'brand'} icon={isSuper ? ShieldCheck : undefined}>
                          {roleLabel(user.role)}
                        </Badge>
                      </td>
                      <td className={td}>
                        <span className="inline-flex items-center gap-1.5 text-[15px]">
                          <span className={`size-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          {user.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className={td}>
                        {isSuper ? (
                          <span className="text-[13px] text-slate-500">Toutes</span>
                        ) : user.permissions.length > 0 ? (
                          <div className="flex max-w-xs flex-wrap gap-1" title={user.permissions.map(permissionLabel).join(', ')}>
                            {user.permissions.slice(0, 2).map((p) => (
                              <Badge key={p}>{permissionLabel(p)}</Badge>
                            ))}
                            {user.permissions.length > 2 && <Badge>+{user.permissions.length - 2}</Badge>}
                          </div>
                        ) : (
                          <span className="text-[13px] text-slate-400">Aucune</span>
                        )}
                      </td>
                      <td className={`${td} whitespace-nowrap text-[13px] tabular-nums text-slate-500`}>
                        {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Jamais'}
                      </td>
                      <td className={`${td} text-right`}>
                        <div className="flex items-center justify-end gap-0.5">
                          <IconLink to={`${ADMIN_PRIVATE_PATH}/utilisateurs/${user.id}/modifier`} label={`Modifier ${user.email}`} icon={Pencil} />
                          <IconButton
                            label={isSelf ? 'Vous ne pouvez pas supprimer votre propre compte' : `Supprimer ${user.email}`}
                            icon={Trash2}
                            tone="danger"
                            disabled={isSelf}
                            onClick={() => setConfirmDelete({ isOpen: true, userId: user.id })}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Supprimer l'administrateur"
        message="Voulez-vous vraiment supprimer ce compte administrateur ? Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, userId: null })}
      />
    </div>
  )
}
