import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const SESSION_KEY = 'rep_rx_authed'

interface AuthState {
  authed: boolean
  loading: boolean
  unlock: (pin: string) => Promise<boolean>
  signOut: () => void
  restoreSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>(() => ({
  authed: false,
  loading: true,

  // Called on app boot — restore existing Supabase session if PIN was already set
  restoreSession: async () => {
    const pinUnlocked = localStorage.getItem(SESSION_KEY) === '1'
    if (!pinUnlocked) {
      useAuthStore.setState({ loading: false })
      return
    }
    // Check if Supabase already has a session
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      useAuthStore.setState({ authed: true, loading: false })
      return
    }
    // No Supabase session — sign in anonymously to get one
    const { error } = await supabase.auth.signInAnonymously()
    if (error) {
      // Can't restore — clear PIN flag and re-prompt
      localStorage.removeItem(SESSION_KEY)
      useAuthStore.setState({ authed: false, loading: false })
    } else {
      useAuthStore.setState({ authed: true, loading: false })
    }
  },

  unlock: async (pin: string) => {
    const correct = import.meta.env.VITE_APP_PIN
    if (pin !== correct) return false

    // Check for existing Supabase session first
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      // First time — create anonymous Supabase user
      const { error } = await supabase.auth.signInAnonymously()
      if (error) {
        console.error('Supabase anon sign-in failed:', error.message)
        return false
      }
    }

    localStorage.setItem(SESSION_KEY, '1')
    useAuthStore.setState({ authed: true })
    return true
  },

  signOut: () => {
    localStorage.removeItem(SESSION_KEY)
    useAuthStore.setState({ authed: false })
    // Don't sign out of Supabase — keep the anon session so data persists
  },
}))
