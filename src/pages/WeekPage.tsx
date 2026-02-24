import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import Model, { type IExerciseData, type Muscle } from 'react-body-highlighter'
import { mapMuscle, muscleFromExerciseName, uniqueMuscles } from '../lib/muscles'

const DAY_NAMES = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface WorkoutDay {
  id: string
  label: string
  day_of_week: number
  template_exercises: Array<{
    id: string
    exercise_id: string
    target_sets: number
    target_reps_min: number
    target_reps_max: number
    order_index: number
    exercises?: { name: string; muscle_group_primary?: string } | null
  }>
}

function WorkoutDayCard({ day, isToday }: { day: WorkoutDay; isToday: boolean }) {
  const navigate = useNavigate()
  const exercises = day.template_exercises

  // Aggregate all muscles for the day
  const allMuscles: Muscle[] = uniqueMuscles(
    exercises.map((te) => {
      const name = te.exercises?.muscle_group_primary ?? ''
      const exName = te.exercises?.name ?? te.exercise_id
      return (mapMuscle(name) ?? muscleFromExerciseName(exName)) as Muscle | null
    })
  )
  const muscleData: IExerciseData[] =
    allMuscles.length > 0 ? [{ name: day.label, muscles: allMuscles }] : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`bg-white rounded-xl shadow-card overflow-hidden ${isToday ? 'ring-2 ring-accent' : ''}`}
    >
      <div className={`flex items-center justify-between px-4 py-3 ${isToday ? 'bg-accent-dim' : 'bg-bg-elevated'}`}>
        <div className="flex-1 min-w-0 pr-2">
          <p className={`text-[10px] font-bold uppercase tracking-widest ${isToday ? 'text-accent' : 'text-text-muted'}`}>
            {DAY_NAMES[day.day_of_week]}{isToday ? ' · Today' : ''}
          </p>
          <h3 className="text-text-primary font-bold text-base">{day.label}</h3>
        </div>

        {/* Body diagram — front & back thumbnail */}
        <div className="flex-none flex items-center gap-0.5">
          {muscleData.length > 0 ? (
            <>
              <div className="w-[34px] h-[54px]">
                <Model
                  data={muscleData}
                  style={{ width: '100%', height: '100%' }}
                  highlightedColors={['#EA580C', '#FB923C']}
                  bodyColor="#D9CDBF"
                  type="anterior"
                  onClick={() => {}}
                />
              </div>
              <div className="w-px h-8 bg-accent/20" />
              <div className="w-[34px] h-[54px]">
                <Model
                  data={muscleData}
                  style={{ width: '100%', height: '100%' }}
                  highlightedColors={['#EA580C', '#FB923C']}
                  bodyColor="#D9CDBF"
                  type="posterior"
                  onClick={() => {}}
                />
              </div>
            </>
          ) : (
            <div className="w-16 h-12 flex items-center justify-center text-2xl opacity-50">💪</div>
          )}
        </div>
      </div>

      <div className="px-4 pb-3 pt-1 divide-y divide-border-subtle">
        {exercises.slice(0, 5).map((te) => (
          <div key={te.id} className="flex items-center justify-between py-2">
            <span className="text-text-secondary text-sm">
              {te.exercises?.name ?? te.exercise_id}
            </span>
            <span className="tabular text-text-muted text-xs">
              {te.target_sets}×{te.target_reps_min}–{te.target_reps_max}
            </span>
          </div>
        ))}
        {exercises.length > 5 && (
          <p className="text-text-muted text-xs pt-2">+{exercises.length - 5} more</p>
        )}
      </div>

      {isToday && (
        <div className="px-4 pb-4">
          <button
            onClick={() => navigate(`/session/${day.id}`)}
            className="w-full bg-accent text-white font-bold rounded-lg py-3.5 text-sm tracking-wide active:opacity-80 transition-opacity"
          >
            Start Session →
          </button>
        </div>
      )}
    </motion.div>
  )
}

function RestDayRow({ dayNum }: { dayNum: number }) {
  return (
    <div className="bg-white rounded-xl shadow-card px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-sm">
        💤
      </div>
      <div>
        <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">
          {DAY_NAMES[dayNum]}
        </p>
        <p className="text-text-secondary text-sm font-medium">Rest day</p>
      </div>
    </div>
  )
}

export function WeekPage() {
  const [templates, setTemplates] = useState<WorkoutDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return

      supabase
        .from('workout_templates')
        .select(`
          id, label, day_of_week,
          programs!inner(user_id, active),
          template_exercises(
            id, exercise_id, target_sets, target_reps_min, target_reps_max,
            order_index,
            exercises(name, muscle_group_primary)
          )
        `)
        .eq('programs.user_id', user.id)
        .eq('programs.active', true)
        .order('day_of_week')
        .order('order_index', { referencedTable: 'template_exercises' })
        .then(({ data }) => {
          setTemplates((data ?? []) as unknown as WorkoutDay[])
          setLoading(false)
        })
    })
  }, [])

  const todayJs = new Date().getDay()
  const today = todayJs === 0 ? 7 : todayJs

  const weekTitle = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-bg-base">
      <header className="px-5 pt-12 pb-5">
        <p className="text-text-muted text-xs font-semibold uppercase tracking-widest">
          Week of {weekTitle}
        </p>
        <h1 className="text-text-primary font-extrabold text-2xl mt-0.5">
          Your Program
        </h1>
      </header>

      <main className="px-5 pb-nav flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-card p-4">
              <div className="h-4 bg-bg-elevated rounded animate-pulse w-1/4 mb-2" />
              <div className="h-5 bg-bg-elevated rounded animate-pulse w-1/2" />
            </div>
          ))
        ) : (
          Array.from({ length: 7 }, (_, i) => i + 1).map((dayNum) => {
            const workout = templates.find((t) => t.day_of_week === dayNum)
            const isToday = dayNum === today
            return workout ? (
              <WorkoutDayCard
                key={dayNum}
                day={workout}
                isToday={isToday}
              />
            ) : (
              <RestDayRow key={dayNum} dayNum={dayNum} />
            )
          })
        )}

        {!loading && templates.length === 0 && (
          <div className="bg-white rounded-xl shadow-card px-6 py-10 text-center">
            <p className="text-text-secondary text-sm font-semibold">No program loaded</p>
            <p className="text-text-muted text-xs mt-1">Complete onboarding to generate your program.</p>
          </div>
        )}
      </main>
    </div>
  )
}
