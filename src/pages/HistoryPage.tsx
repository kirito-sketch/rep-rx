import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

interface Session {
  id: string
  started_at: string
  ended_at: string | null
  total_volume_kg: number | null
  duration_mins: number | null
  ai_note: string | null
  workout_templates: {
    label: string
  } | null
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center bg-bg-elevated rounded-lg px-3 py-2 min-w-[60px]">
      <span className="tabular text-text-primary text-sm font-bold">{value}</span>
      <span className="text-text-muted text-[10px] font-medium">{label}</span>
    </div>
  )
}

function SessionCard({ session }: { session: Session }) {
  const label = session.workout_templates?.label ?? 'Workout'
  const volume = session.total_volume_kg
    ? `${Math.round(session.total_volume_kg).toLocaleString()} kg`
    : '—'
  const duration = session.duration_mins ? `${session.duration_mins} min` : '—'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-card p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-text-muted text-[11px] font-semibold uppercase tracking-wide">
            {formatDate(session.started_at)}
          </p>
          <h3 className="text-text-primary font-bold text-base">{label}</h3>
        </div>
        <div className="w-2 h-2 rounded-full bg-success mt-1.5" />
      </div>

      <div className="flex gap-2 mb-3">
        <StatPill label="volume" value={volume} />
        <StatPill label="duration" value={duration} />
      </div>

      {session.ai_note && (
        <p className="text-text-secondary text-xs italic border-l-2 border-accent pl-3 leading-relaxed">
          {session.ai_note}
        </p>
      )}
    </motion.div>
  )
}

function WeeklySummary({ sessions }: { sessions: Session[] }) {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
  weekStart.setHours(0, 0, 0, 0)

  const thisWeek = sessions.filter((s) => new Date(s.started_at) >= weekStart)
  const totalVolume = thisWeek.reduce((s, sess) => s + (sess.total_volume_kg ?? 0), 0)
  const totalDuration = thisWeek.reduce((s, sess) => s + (sess.duration_mins ?? 0), 0)

  return (
    <div className="bg-accent rounded-xl p-4 text-white">
      <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest mb-3">
        This Week
      </p>
      <div className="flex gap-4">
        <div>
          <p className="tabular text-3xl font-extrabold">{thisWeek.length}</p>
          <p className="text-white/70 text-xs">sessions</p>
        </div>
        <div className="w-px bg-white/20" />
        <div>
          <p className="tabular text-3xl font-extrabold">
            {totalVolume > 0 ? `${Math.round(totalVolume / 1000 * 10) / 10}k` : '—'}
          </p>
          <p className="text-white/70 text-xs">kg lifted</p>
        </div>
        <div className="w-px bg-white/20" />
        <div>
          <p className="tabular text-3xl font-extrabold">{totalDuration > 0 ? totalDuration : '—'}</p>
          <p className="text-white/70 text-xs">minutes</p>
        </div>
      </div>
    </div>
  )
}

export function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return

      supabase
        .from('workout_sessions')
        .select(`
          id, started_at, ended_at, total_volume_kg, duration_mins, ai_note,
          workout_templates(label)
        `)
        .eq('user_id', user.id)
        .not('ended_at', 'is', null)
        .order('started_at', { ascending: false })
        .limit(30)
        .then(({ data }) => {
          setSessions((data ?? []) as unknown as Session[])
          setLoading(false)
        })
    })
  }, [])

  return (
    <div className="min-h-screen bg-bg-base">
      <header className="px-5 pt-12 pb-5">
        <p className="text-text-muted text-xs font-semibold uppercase tracking-widest">
          All time
        </p>
        <h1 className="text-text-primary font-extrabold text-2xl mt-0.5">Activity</h1>
      </header>

      <main className="px-5 pb-nav flex flex-col gap-3">
        {loading ? (
          <>
            <div className="bg-bg-elevated rounded-xl h-24 animate-pulse" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-card p-4">
                <div className="h-3 bg-bg-elevated rounded animate-pulse w-1/3 mb-2" />
                <div className="h-5 bg-bg-elevated rounded animate-pulse w-1/2" />
              </div>
            ))}
          </>
        ) : (
          <>
            <WeeklySummary sessions={sessions} />

            {sessions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-card px-6 py-10 text-center mt-2">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-text-secondary text-sm font-semibold">No sessions yet</p>
                <p className="text-text-muted text-xs mt-1">
                  Complete your first workout to see it here.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-text-secondary text-xs font-bold uppercase tracking-widest px-1 mt-1">
                  Sessions
                </h3>
                {sessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
