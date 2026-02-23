import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'

export function AuthPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-text-primary mb-1">Rep Rx</h1>
        <p className="text-text-muted text-sm mb-8">Built for you. Not for everyone.</p>

        {sent ? (
          <div className="border border-border rounded-md p-4">
            <p className="text-text-secondary text-sm">
              Check your email — magic link sent to{' '}
              <span className="text-text-primary">{email}</span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full bg-bg-surface border border-border rounded-md px-4 py-3 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white font-semibold rounded-md py-3 text-sm disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Sending...' : 'Continue with Email →'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
