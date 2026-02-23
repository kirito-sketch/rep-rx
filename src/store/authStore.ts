import { create } from 'zustand'

const SESSION_KEY = 'rep_rx_authed'

interface AuthState {
  authed: boolean
  loading: boolean
  unlock: (pin: string) => boolean
  signOut: () => void
}

export const useAuthStore = create<AuthState>(() => ({
  authed: localStorage.getItem(SESSION_KEY) === '1',
  loading: false,
  unlock: (pin: string) => {
    const correct = import.meta.env.VITE_APP_PIN
    if (pin === correct) {
      localStorage.setItem(SESSION_KEY, '1')
      useAuthStore.setState({ authed: true })
      return true
    }
    return false
  },
  signOut: () => {
    localStorage.removeItem(SESSION_KEY)
    useAuthStore.setState({ authed: false })
  },
}))
