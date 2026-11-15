import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CandidateListStepPage, ConfirmationStepPage, MatriculeStepPage, OtpStepPage } from '../modules/student-vote/student-vote-steps'
import { LandingPage } from '../pages/landing-page'
import { CandidateDetailPage } from '../pages/candidate-detail-page'
import { StudentVotePage } from '../pages/student-vote-page'
import { VoteResultsPage } from '../pages/vote-results-page'
import { RegistrationPage } from '../pages/registration-page'
import { NotFoundPage } from '../pages/not-found-page'
import { ADMIN_PRIVATE_PATH } from '../shared/constants/routes'
import { LoadingBlock } from '../shared/ui/backdrop'
import { SiteLayout } from '../shared/ui/site-layout'

const AdminRoutes = lazy(() => import('./admin-routes').then((m) => ({ default: m.AdminRoutes })))

export function AppRouter() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <SiteLayout>
              <LandingPage />
            </SiteLayout>
          }
        />
        <Route
          path="/inscription"
          element={
            <SiteLayout>
              <RegistrationPage />
            </SiteLayout>
          }
        />
        <Route
          path="/resultats"
          element={
            <SiteLayout>
              <VoteResultsPage />
            </SiteLayout>
          }
        />
        <Route
          path="/candidat/:id"
          element={
            <SiteLayout>
              <CandidateDetailPage />
            </SiteLayout>
          }
        />
        <Route
          path="/vote"
          element={
            <SiteLayout>
              <StudentVotePage />
            </SiteLayout>
          }
        >
          <Route index element={<MatriculeStepPage />} />
          <Route path="otp" element={<OtpStepPage />} />
          <Route path="liste" element={<CandidateListStepPage />} />
          <Route path="confirmation" element={<ConfirmationStepPage />} />
          <Route path="succes" element={<Navigate replace to="/resultats" />} />
        </Route>
        <Route
          path={`${ADMIN_PRIVATE_PATH}/*`}
          element={
            <Suspense fallback={<LoadingBlock label="Chargement de la console…" />}>
              <AdminRoutes />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <SiteLayout>
              <NotFoundPage />
            </SiteLayout>
          }
        />
      </Routes>
    </>
  )
}
