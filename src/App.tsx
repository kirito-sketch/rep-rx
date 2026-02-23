import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { AuthPage } from './pages/AuthPage'
import { Dashboard } from './pages/Dashboard'
import { OnboardingFlow } from './pages/OnboardingFlow'
import { SessionPage } from './pages/SessionPage'

export default function App() {
  const { authed, loading, restoreSession } = useAuthStore()

  useEffect(() => {
    restoreSession()
  }, [])

  // Show spinner while we check existing session
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-bg-elevated border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <BrowserRouter>
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
          path="/*"
          element={authed ? <Dashboard /> : <Navigate to="/auth" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
