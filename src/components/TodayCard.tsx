import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Model, { type IExerciseData, type Muscle } from 'react-body-highlighter'
import { mapMuscle, muscleFromExerciseName, uniqueMuscles } from '../lib/muscles'

interface TemplateExercise {
  id: string
  exercise_id: string
  target_sets: number
  target_reps_min: number
  target_reps_max: number
  exercises?: { name: string; muscle_group_primary?: string } | null
}

interface Template {
  id: string
  label: string
  template_exercises?: TemplateExercise[]
}

export function TodayCard({ template }: { template: Template }) {
  const navigate = useNavigate()
  const exercises = template.template_exercises ?? []
  const exerciseCount = exercises.length

  // Aggregate all primary muscles across the workout
  const allMuscles: Muscle[] = uniqueMuscles(
    exercises.map((te) => {
      const name = te.exercises?.muscle_group_primary ?? ''
      const exName = te.exercises?.name ?? te.exercise_id
      return (mapMuscle(name) ?? muscleFromExerciseName(exName)) as Muscle | null
    })
  )

  const muscleData: IExerciseData[] =
    allMuscles.length > 0 ? [{ name: template.label, muscles: allMuscles }] : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-white rounded-xl shadow-card overflow-hidden"
    >
      {/* Header strip with body diagram */}
      <div className="relative bg-accent-dim px-5 pt-4 pb-3 flex items-center justify-between overflow-hidden">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-accent text-[11px] font-bold uppercase tracking-widest mb-0.5">
            Today's Workout
          </p>
          <h2 className="text-text-primary font-extrabold text-xl leading-tight truncate">
            {template.label}
          </h2>
          <p className="text-text-secondary text-xs mt-0.5 font-medium">
            {exerciseCount} exercises
          </p>
        </div>

        {/* Body diagram — front & back, shows all muscles targeted today */}
        <div className="flex-none flex items-center gap-1">
          {muscleData.length > 0 ? (
            <>
              <div className="w-[44px] h-[72px]">
                <Model
                  data={muscleData}
                  style={{ width: '100%', height: '100%' }}
                  highlightedColors={['#EA580C', '#FB923C']}
                  bodyColor="#D9CDBF"
                  type="anterior"
                  onClick={() => {}}
                />
              </div>
              <div className="w-px h-10 bg-accent/20" />
              <div className="w-[44px] h-[72px]">
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
            <div className="w-16 h-16 flex items-center justify-center text-3xl opacity-60">
              💪
            </div>
          )}
        </div>
      </div>

      {/* Exercise list */}
      <div className="px-5 pt-2 pb-4">
        <div className="divide-y divide-border-subtle">
          {exercises.slice(0, 4).map((te) => (
            <div key={te.id} className="flex items-center justify-between py-2.5">
              <span className="text-text-primary text-sm font-medium">
                {te.exercises?.name ?? te.exercise_id}
              </span>
              <span className="tabular text-text-muted text-xs font-medium bg-bg-elevated px-2 py-0.5 rounded-md">
                {te.target_sets}×{te.target_reps_min}–{te.target_reps_max}
              </span>
            </div>
          ))}
        </div>

        {exerciseCount > 4 && (
          <button
            onClick={() => navigate('/week')}
            className="text-accent text-xs font-semibold mt-1 mb-1 active:opacity-70"
          >
            +{exerciseCount - 4} more →
          </button>
        )}

        <button
          onClick={() => navigate(`/session/${template.id}`)}
          className="mt-3 w-full bg-accent text-white font-bold rounded-xl py-4 text-sm tracking-wide transition-opacity active:opacity-80"
        >
          Start Session →
        </button>
      </div>
    </motion.div>
  )
}
