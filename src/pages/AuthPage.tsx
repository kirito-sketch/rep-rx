import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']
const PIN_LENGTH = 6

export function AuthPage() {
  const { unlock } = useAuthStore()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const handleKey = (key: string) => {
    if (key === '⌫') {
      setPin((p) => p.slice(0, -1))
      setError(false)
      return
    }
    if (key === '' || pin.length >= PIN_LENGTH) return

    const next = pin + key

    if (next.length === PIN_LENGTH) {
      const ok = unlock(next)
      if (!ok) {
        setError(true)
        setTimeout(() => {
          setPin('')
          setError(false)
        }, 600)
      }
      // if ok, App.tsx redirects automatically via authed state
    } else {
      setPin(next)
    }
  }

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6 select-none">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xs flex flex-col items-center gap-10"
      >
        {/* Wordmark */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary">Rep Rx</h1>
          <p className="text-text-muted text-xs mt-1">Enter your PIN</p>
        </div>

        {/* PIN dots */}
        <motion.div
          animate={error ? { x: [-8, 8, -6, 6, -4, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex gap-4"
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border transition-all duration-150 ${
                i < pin.length
                  ? error
                    ? 'bg-red-500 border-red-500'
                    : 'bg-accent border-accent'
                  : 'bg-transparent border-border'
              }`}
            />
          ))}
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-400 text-xs -mt-6"
            >
              Incorrect PIN
            </motion.p>
          )}
        </AnimatePresence>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {KEYS.map((key, i) => (
            <button
              key={i}
              onClick={() => handleKey(key)}
              disabled={key === ''}
              className={`h-16 rounded-md text-xl font-medium transition-all active:scale-95 ${
                key === ''
                  ? 'invisible pointer-events-none'
                  : key === '⌫'
                  ? 'bg-bg-elevated border border-border text-text-secondary text-base'
                  : 'bg-bg-surface border border-border text-text-primary hover:border-accent'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
