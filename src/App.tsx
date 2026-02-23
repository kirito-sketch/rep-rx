import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
import { AuthPage } from './pages/AuthPage'
import { Dashboard } from './pages/Dashboard'
import { OnboardingFlow } from './pages/OnboardingFlow'

export default function App() {
  const { user, loading, setUser } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="min-h-screen bg-bg-base" />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={!user ? <AuthPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/onboarding"
          element={user ? <OnboardingFlow /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/*"
          element={user ? <Dashboard /> : <Navigate to="/auth" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
