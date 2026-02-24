import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { TodayCard } from '../components/TodayCard'
import { WeekStrip } from '../components/WeekStrip'
import { InstallPrompt } from '../components/InstallPrompt'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function RestDayCard() {
  return (
    <div className="bg-white rounded-xl shadow-card px-6 py-10 text-center">
      <div className="text-4xl mb-3">🛌</div>
      <p className="text-text-primary text-base font-bold">Rest day</p>
      <p className="text-text-muted text-sm mt-1">Recovery is part of the work.</p>
    </div>
  )
}

function UpcomingWorkouts({ templates }: { templates: any[] }) {
  if (!templates.length) return null
  return (
    <div>
      <h3 className="text-text-secondary text-xs font-bold uppercase tracking-widest mb-2 px-1">
        Coming up
      </h3>
      <div className="flex flex-col gap-2">
        {templates.slice(0, 3).map((t) => {
          const dayNames = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          return (
            <div
              key={t.id}
              className="bg-white rounded-xl shadow-card px-4 py-3 flex items-center justify-between"
            >
              <div>
                <p className="text-text-secondary text-[11px] font-semibold uppercase tracking-wide">
                  {dayNames[t.day_of_week]}
                </p>
                <p className="text-text-primary text-sm font-semibold">{t.label}</p>
              </div>
              <span className="text-text-muted text-xs">
                {t.template_exercises?.length ?? 0} ex
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  const [todayTemplate, setTodayTemplate] = useState<any>(null)
  const [upcomingTemplates, setUpcomingTemplates] = useState<any[]>([])
  const [workoutDays, setWorkoutDays] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate('/onboarding')
        return
      }

      supabase
        .from('profiles')
        .select('onboarded')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (!data?.onboarded) navigate('/onboarding')
        })

      const todayJs = new Date().getDay()
      const today = todayJs === 0 ? 7 : todayJs

      // Load today's template
      supabase
        .from('workout_templates')
        .select(`
          id, label, day_of_week,
          programs!inner(user_id, active),
          template_exercises(
            id, exercise_id, target_sets, target_reps_min, target_reps_max,
            target_weight, rest_seconds, order_index,
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

      // Load all workout days + upcoming for this week
      supabase
        .from('workout_templates')
        .select(`
          id, label, day_of_week,
          programs!inner(user_id, active),
          template_exercises(id)
        `)
        .eq('programs.user_id', user.id)
        .eq('programs.active', true)
        .order('day_of_week')
        .then(({ data }) => {
          if (!data) return
          const days = data.map((t) => t.day_of_week)
          setWorkoutDays(days)
          // Upcoming = future days this week, not today
          const upcoming = data.filter((t) => t.day_of_week > today)
          setUpcomingTemplates(upcoming)
        })
    })
  }, [])

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <header className="px-5 pt-12 pb-5">
        <div>
          <p className="text-text-muted text-xs font-semibold uppercase tracking-widest">
            {dateStr}
          </p>
          <h1 className="text-text-primary font-extrabold text-2xl mt-0.5">
            {getGreeting()}
          </h1>
        </div>
      </header>

      <main className="px-5 flex flex-col gap-5 pb-nav">
        {/* Week strip */}
        <WeekStrip workoutDays={workoutDays} />

        {/* Today card */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-card p-5">
            <div className="h-4 bg-bg-elevated rounded-lg animate-pulse w-1/3 mb-3" />
            <div className="h-6 bg-bg-elevated rounded-lg animate-pulse w-2/3 mb-2" />
            <div className="h-3 bg-bg-elevated rounded-md animate-pulse w-1/4 mb-5" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-3 bg-bg-elevated rounded animate-pulse" />
              ))}
            </div>
          </div>
        ) : todayTemplate ? (
          <TodayCard template={todayTemplate} />
        ) : (
          <RestDayCard />
        )}

        {/* Upcoming workouts */}
        {!loading && <UpcomingWorkouts templates={upcomingTemplates} />}
      </main>

      <InstallPrompt />
    </div>
  )
}
