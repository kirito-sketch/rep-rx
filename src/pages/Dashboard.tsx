import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { TodayCard } from '../components/TodayCard'
import { WeekStrip } from '../components/WeekStrip'
import { useAuthStore } from '../store/authStore'

export function Dashboard() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [todayTemplate, setTodayTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  // displayName state removed (unused in render)

  useEffect(() => {
    if (!user) return

    // Check onboarding status
    supabase
      .from('profiles')
      .select('onboarded, display_name, goal')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (!data?.onboarded) {
          navigate('/onboarding')
          return
        }
      })

    // Detect today's workout (1=Mon … 7=Sun)
    const todayJs = new Date().getDay()
    const today = todayJs === 0 ? 7 : todayJs

    supabase
      .from('workout_templates')
      .select(`
        id,
        label,
        day_of_week,
        programs!inner(user_id, active),
        template_exercises(
          id,
          exercise_id,
          target_sets,
          target_reps_min,
          target_reps_max,
          target_weight,
          rest_seconds,
          order_index,
          exercises(name, muscle_group_primary, gif_url)
        )
      `)
      .eq('day_of_week', today)
      .eq('programs.user_id', user.id)
      .eq('programs.active', true)
      .order('order_index', { referencedTable: 'template_exercises' })
      .maybeSingle()
      .then(({ data }) => {
        setTodayTemplate(data)
        setLoading(false)
      })
  }, [user])

  return (
    <div className="min-h-screen bg-bg-base">
      <header className="flex items-center justify-between px-6 pt-12 pb-6">
        <div>
          <h1 className="text-text-primary font-semibold text-lg">Rep Rx</h1>
          <p className="text-text-muted text-xs mt-0.5">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={signOut}
          className="text-text-muted text-xs border border-border rounded-md px-3 py-2"
        >
          Sign out
        </button>
      </header>

      <main className="px-6 flex flex-col gap-4 pb-12">
        <WeekStrip />

        {loading ? (
          <div className="bg-bg-surface border border-border rounded-md p-6">
            <div className="h-4 bg-bg-elevated rounded animate-pulse w-1/2 mb-2" />
            <div className="h-3 bg-bg-elevated rounded animate-pulse w-1/3" />
          </div>
        ) : todayTemplate ? (
          <TodayCard template={todayTemplate} />
        ) : (
          <div className="bg-bg-surface border border-border rounded-md px-6 py-10 text-center">
            <p className="text-text-secondary text-sm font-medium">Rest day.</p>
            <p className="text-text-muted text-xs mt-1">Recovery is training.</p>
          </div>
        )}
      </main>
    </div>
  )
}
