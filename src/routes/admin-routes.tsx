import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAdminAuthStore } from '../modules/admin-dashboard/auth-store'
import { AdminDashboardOverview } from '../pages/admin-dashboard-overview'
import { AdminElectionCreatePage } from '../pages/admin-election-create-page'
import { AdminElectionDetailPage } from '../pages/admin-election-detail-page'
import { AdminLoginPage } from '../pages/admin-login-page'
import { AdminScrutinsPage } from '../pages/admin-scrutins-page'
import { ADMIN_PRIVATE_PATH } from '../shared/constants/routes'
import { AdminDashboardLayout } from '../shared/layouts/admin-dashboard-layout'

function RequireAdmin() {
  const token = useAdminAuthStore((s) => s.accessToken)
  if (!token) {
    return <Navigate replace to={`${ADMIN_PRIVATE_PATH}/login`} />
  }
  return (
    <AdminDashboardLayout>
      <Outlet />
    </AdminDashboardLayout>
  )
}

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLoginPage />} />
      <Route element={<RequireAdmin />}>
        <Route index element={<AdminDashboardOverview />} />
        <Route path="scrutins/nouveau" element={<AdminElectionCreatePage />} />
        <Route path="scrutins/:id" element={<AdminElectionDetailPage />} />
        <Route path="scrutins" element={<AdminScrutinsPage />} />
      </Route>
    </Routes>
  )
}
