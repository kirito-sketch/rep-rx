import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSessionStore } from '../../store/sessionStore'

export function RestTimer() {
  const { restActive, restSecondsRemaining, restTotalSeconds, tickRest, dismissRest } =
    useSessionStore()

  useEffect(() => {
    if (!restActive) return
    const interval = setInterval(tickRest, 1000)
    return () => clearInterval(interval)
  }, [restActive, tickRest])

  const progress =
    restTotalSeconds > 0 ? restSecondsRemaining / restTotalSeconds : 0
  const mins = Math.floor(restSecondsRemaining / 60)
  const secs = restSecondsRemaining % 60

  return (
    <AnimatePresence>
      {restActive && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-border px-6 pt-5 pb-10 safe-bottom"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Rest</p>
              <p className="tabular text-5xl font-bold text-text-primary leading-none">
                {mins}:{String(secs).padStart(2, '0')}
              </p>
            </div>
            <button
              onClick={dismissRest}
              className="bg-bg-elevated border border-border rounded-md px-5 py-3 text-text-secondary text-sm active:opacity-70"
            >
              Skip →
            </button>
          </div>

          {/* Depleting progress bar */}
          <div className="h-0.5 bg-bg-elevated rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              style={{ width: `${progress * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
