import { createBrowserRouter, Navigate, RouterProvider, Link, useRouteError } from 'react-router'
import { ProtectedLayout } from './app/shell.tsx'
import { AppProvider } from './app/provider.tsx'
import { Dashboard } from './pages/dashboard.tsx'
import { Login } from './pages/login.tsx'
import { ActivityList } from './pages/activity-list.tsx'
import { DraftPage } from './pages/draft.tsx'
import { ActivityDetail } from './pages/activity-detail.tsx'
import { ClaimsPage } from './pages/claims.tsx'
import { ClaimFormPage } from './pages/claim-form.tsx'
import { ClaimDetailPage } from './pages/claim-detail.tsx'
import { Configuration } from './pages/configuration.tsx'
import { EmptyState } from './components/shared.tsx'
import { Button } from './components/ui/button.tsx'

function RouteError() {
  useRouteError()
  return <main className="container main-content"><EmptyState title="Halaman belum dapat dibuka" description="Terjadi kendala saat menampilkan halaman. Muat ulang untuk mencoba kembali. Draft yang sudah disimpan tetap tersedia." action={<Button onClick={() => window.location.reload()}>Muat ulang aplikasi</Button>} /></main>
}

const router = createBrowserRouter([
  { path: '/login', element: <Login />, errorElement: <RouteError /> },
  { element: <ProtectedLayout />, errorElement: <RouteError />, children: [
    { path: '/', element: <Navigate to="/dashboard" replace /> },
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/activities', element: <ActivityList /> },
    { path: '/activities/new/:domain', element: <DraftPage /> },
    { path: '/activities/:id', element: <ActivityDetail /> },
    { path: '/activities/:id/edit', element: <DraftPage /> },
    { path: '/incentives', element: <ClaimsPage /> },
    { path: '/incentives/new', element: <ClaimFormPage /> },
    { path: '/incentives/:id', element: <ClaimDetailPage /> },
    { path: '/incentives/:id/edit', element: <ClaimFormPage /> },
    { path: '/configuration', element: <Configuration /> },
    { path: '*', element: <EmptyState title="Halaman tidak ditemukan" description="Alamat ini belum tersedia. Kembali ke dashboard untuk melanjutkan." action={<Button asChild><Link to="/dashboard">Kembali ke dashboard</Link></Button>} /> },
  ] },
])

export default function App() { return <AppProvider><RouterProvider router={router} /></AppProvider> }
