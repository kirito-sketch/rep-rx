import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

interface Stats {
  totalSessions: number
  totalVolumeKg: number
  totalMinutes: number
}

export function ProfilePage() {
  const { signOut } = useAuthStore()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('workout_sessions')
        .select('total_volume_kg, duration_mins')
        .eq('user_id', user.id)
        .not('ended_at', 'is', null)
        .then(({ data }) => {
          if (!data) return
          setStats({
            totalSessions: data.length,
            totalVolumeKg: data.reduce((s, r) => s + (r.total_volume_kg ?? 0), 0),
            totalMinutes: data.reduce((s, r) => s + (r.duration_mins ?? 0), 0),
          })
        })
    })
  }, [])

  const formatVolume = (kg: number) => {
    if (kg >= 1000) return `${(kg / 1000).toFixed(1)}k`
    return `${Math.round(kg)}`
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <header className="px-5 pt-12 pb-6">
        <p className="text-text-muted text-xs font-semibold uppercase tracking-widest">Your</p>
        <h1 className="text-text-primary font-extrabold text-2xl mt-0.5">Profile</h1>
      </header>

      <main className="px-5 pb-nav flex flex-col gap-4">

        {/* Avatar + identity */}
        <div className="bg-white rounded-2xl shadow-card p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-accent-dim flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="10" r="5" fill="#EA580C" fillOpacity="0.7" />
              <path d="M4 24C4 20 8.5 17 14 17C19.5 17 24 20 24 24" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-text-primary font-bold text-lg">Rep Rx</p>
            <p className="text-text-muted text-xs">Personal Training App</p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-accent rounded-2xl p-5 text-white">
          <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest mb-4">
            All Time
          </p>
          {stats === null ? (
            <div className="flex gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="h-8 w-10 bg-white/20 rounded animate-pulse" />
                  <div className="h-2.5 w-12 bg-white/20 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-6"
            >
              <div>
                <p className="tabular text-3xl font-extrabold">{stats.totalSessions}</p>
                <p className="text-white/70 text-xs">sessions</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="tabular text-3xl font-extrabold">{formatVolume(stats.totalVolumeKg)}</p>
                <p className="text-white/70 text-xs">kg lifted</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="tabular text-3xl font-extrabold">{stats.totalMinutes > 0 ? stats.totalMinutes : '—'}</p>
                <p className="text-white/70 text-xs">minutes</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Resources */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <p className="px-5 pt-4 pb-2 text-text-muted text-[11px] font-bold uppercase tracking-widest">
            Learn
          </p>
          {[
            {
              label: 'Squat University',
              sub: 'Technique & injury prevention',
              url: 'https://www.youtube.com/@SquatUniversity',
              icon: '🎓',
            },
            {
              label: 'Jeff Nippard',
              sub: 'Science-based training',
              url: 'https://www.youtube.com/@JeffNippard',
              icon: '🔬',
            },
            {
              label: 'Alan Thrall',
              sub: 'Powerlifting fundamentals',
              url: 'https://www.youtube.com/@UntamedStrength',
              icon: '🏋️',
            },
          ].map(({ label, sub, url, icon }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-5 py-3.5 border-t border-border-subtle first:border-t-0 active:bg-bg-elevated transition-colors"
            >
              <span className="text-xl">{icon}</span>
              <div className="flex-1">
                <p className="text-text-primary text-sm font-semibold">{label}</p>
                <p className="text-text-muted text-xs">{sub}</p>
              </div>
              <span className="text-text-muted text-sm">↗</span>
            </a>
          ))}
        </div>

        {/* Lock */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-4 px-5 py-4 text-left active:bg-bg-elevated transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-bg-elevated flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="3" y="8" width="12" height="9" rx="2" stroke="#625B54" strokeWidth="1.5" />
                <path d="M6 8V6C6 4.34 7.34 3 9 3C10.66 3 12 4.34 12 6V8" stroke="#625B54" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-text-primary font-semibold text-sm">Lock app</p>
              <p className="text-text-muted text-xs">Requires PIN to unlock</p>
            </div>
          </button>
        </div>

        <p className="text-center text-text-muted text-[10px] pb-2">Rep Rx · Built with ❤️</p>
      </main>
    </div>
  )
}
