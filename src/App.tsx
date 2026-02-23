import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { AuthPage } from './pages/AuthPage'
import { Dashboard } from './pages/Dashboard'
import { OnboardingFlow } from './pages/OnboardingFlow'
import { SessionPage } from './pages/SessionPage'

export default function App() {
  const { authed } = useAuthStore()

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
