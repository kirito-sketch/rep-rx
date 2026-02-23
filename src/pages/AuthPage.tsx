import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'

const PIN_LENGTH = 6

export function AuthPage() {
  const { unlock } = useAuthStore()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH)
    setPin(value)
    setError(false)

    if (value.length === PIN_LENGTH) {
      const ok = await unlock(value)
      if (!ok) {
        setError(true)
        setTimeout(() => {
          setPin('')
          setError(false)
          inputRef.current?.focus()
        }, 600)
      }
    }
  }

  return (
    <div
      className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6 select-none"
      onClick={() => inputRef.current?.focus()}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-xs flex flex-col items-center gap-10"
      >
        {/* Wordmark */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-accent rounded-2xl mb-4 shadow-lift">
            <span className="text-white text-2xl font-extrabold">Rx</span>
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary">Rep Rx</h1>
          <p className="text-text-muted text-sm mt-1">Enter your PIN to continue</p>
        </div>

        {/* Hidden native input */}
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={PIN_LENGTH}
          value={pin}
          onChange={handleChange}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          autoComplete="off"
        />

        {/* PIN dots */}
        <motion.div
          animate={error ? { x: [-8, 8, -6, 6, -4, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex gap-4"
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                i < pin.length
                  ? error
                    ? 'bg-red-500 border-red-500'
                    : 'bg-accent border-accent scale-110'
                  : 'bg-transparent border-border'
              }`}
            />
          ))}
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-500 text-sm font-medium -mt-6"
            >
              Incorrect PIN
            </motion.p>
          )}
        </AnimatePresence>

        <p className="text-text-muted text-xs">Tap anywhere to open keyboard</p>
      </motion.div>
    </div>
  )
}
