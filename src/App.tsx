import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { AuthPage } from './pages/AuthPage'
import { Dashboard } from './pages/Dashboard'
import { OnboardingFlow } from './pages/OnboardingFlow'
import { SessionPage } from './pages/SessionPage'
import { WeekPage } from './pages/WeekPage'
import { HistoryPage } from './pages/HistoryPage'
import { ProfilePage } from './pages/ProfilePage'
import { BottomNav } from './components/BottomNav'

// Routes that should show the bottom navigation
const NAV_ROUTES = ['/', '/week', '/history', '/profile']

function AppLayout({ authed }: { authed: boolean }) {
  const location = useLocation()
  const showNav = authed && NAV_ROUTES.includes(location.pathname)

  return (
    <>
      <Routes>
        <Route
          path="/auth"
          element={!authed ? <AuthPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/onboarding"
          element={authed ? <OnboardingFlow /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/session/:templateId"
          element={authed ? <SessionPage /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/week"
          element={authed ? <WeekPage /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/history"
          element={authed ? <HistoryPage /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/profile"
          element={authed ? <ProfilePage /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/*"
          element={authed ? <Dashboard /> : <Navigate to="/auth" replace />}
        />
      </Routes>
      {showNav && <BottomNav />}
    </>
  )
}

export default function App() {
  const { authed, loading, restoreSession } = useAuthStore()

  useEffect(() => {
    restoreSession()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
          <p className="text-text-muted text-xs font-medium">Rep Rx</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <AppLayout authed={authed} />
    </BrowserRouter>
  )
}
