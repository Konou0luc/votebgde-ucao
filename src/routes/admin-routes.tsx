import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useAdminAuthStore } from '../modules/admin-dashboard/auth-store'
import { AdminDashboardOverview } from '../pages/admin-dashboard-overview'
import { AdminElectionCreatePage } from '../pages/admin-election-create-page'
import { AdminElectionDetailPage } from '../pages/admin-election-detail-page'
import { AdminLoginPage } from '../pages/admin-login-page'
import { AdminScrutinsPage } from '../pages/admin-scrutins-page'
import { AdminProfilePage } from '../pages/admin-profile-page'
import { AdminCandidateListCreatePage } from '../pages/admin-candidate-list-create-page'
import { AdminUsersPage } from '../pages/admin-users-page'
import { AdminUserEditPage } from '../pages/admin-user-edit-page'
import { AdminAuditLogsPage } from '../pages/admin-audit-logs-page'
import { ADMIN_PRIVATE_PATH } from '../shared/constants/routes'
import { AdminDashboardLayout } from '../shared/layouts/admin-dashboard-layout'

function RequireAdmin() {
  const token = useAdminAuthStore((s) => s.accessToken)
  const admin = useAdminAuthStore((s) => s.admin)
  const location = useLocation()
  
  if (!token) {
    return <Navigate replace to={`${ADMIN_PRIVATE_PATH}/login`} />
  }

  // Si changement de mot de passe requis et qu'on n'est pas déjà sur la page profil
  if (admin?.needsPasswordChange && location.pathname !== `${ADMIN_PRIVATE_PATH}/profil`) {
    return <Navigate replace to={`${ADMIN_PRIVATE_PATH}/profil`} state={{ forcePasswordChange: true }} />
  }

  return (
    <AdminDashboardLayout>
      <Outlet />
    </AdminDashboardLayout>
  )
}

function RequirePermission({ permission, children }: { permission: string; children: React.ReactNode }) {
  const admin = useAdminAuthStore((s) => s.admin)
  if (!admin?.permissions?.includes(permission)) {
    return <Navigate replace to={ADMIN_PRIVATE_PATH} />
  }
  return <>{children}</>
}

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLoginPage />} />
      <Route element={<RequireAdmin />}>
        <Route index element={<AdminDashboardOverview />} />
        <Route
          path="scrutins/nouveau"
          element={
            <RequirePermission permission="scrutin:write">
              <AdminElectionCreatePage />
            </RequirePermission>
          }
        />
        <Route path="scrutins/:id" element={<AdminElectionDetailPage />} />
        <Route
          path="scrutins/:id/listes/nouveau"
          element={
            <RequirePermission permission="candidate-list:write">
              <AdminCandidateListCreatePage />
            </RequirePermission>
          }
        />
        <Route
          path="scrutins/:id/listes/:listId/modifier"
          element={
            <RequirePermission permission="candidate-list:write">
              <AdminCandidateListCreatePage />
            </RequirePermission>
          }
        />
        <Route path="scrutins" element={<AdminScrutinsPage />} />
        <Route path="utilisateurs" element={<AdminUsersPage />} />
        <Route path="utilisateurs/nouveau" element={<AdminUserEditPage />} />
        <Route path="utilisateurs/:userId/modifier" element={<AdminUserEditPage />} />
        <Route path="audit" element={<AdminAuditLogsPage />} />
        <Route path="profil" element={<AdminProfilePage />} />
      </Route>
    </Routes>
  )
}
