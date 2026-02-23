import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MuscleGroupIcon, muscleFromName } from './MuscleGroupIcon'

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

  // Pick the first exercise's muscle for the card illustration
  const firstExercise = exercises[0]
  const primaryMuscle =
    (firstExercise?.exercises?.muscle_group_primary
      ? firstExercise.exercises.muscle_group_primary.toLowerCase()
      : null) ??
    muscleFromName(firstExercise?.exercises?.name ?? firstExercise?.exercise_id ?? '')

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-white rounded-xl shadow-card overflow-hidden"
    >
      {/* Card top: illustration strip */}
      <div className="relative bg-accent-dim flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-accent text-[11px] font-bold uppercase tracking-widest mb-0.5">
            Today's Workout
          </p>
          <h2 className="text-text-primary font-extrabold text-xl leading-tight">
            {template.label}
          </h2>
          <p className="text-text-secondary text-xs mt-0.5 font-medium">
            {exerciseCount} exercises
          </p>
        </div>
        <div className="opacity-80">
          <MuscleGroupIcon
            muscle={primaryMuscle as any}
            size={72}
            accent="#EA580C"
            baseColor="#E3DDD4"
          />
        </div>
      </div>

      {/* Exercise list */}
      <div className="px-5 pt-3 pb-4">
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
          <p className="text-text-muted text-xs mt-1 mb-2">
            +{exerciseCount - 4} more exercises
          </p>
        )}

        <button
          onClick={() => navigate(`/session/${template.id}`)}
          className="mt-3 w-full bg-accent text-white font-bold rounded-lg py-4 text-sm tracking-wide transition-opacity active:opacity-80"
        >
          Start Session →
        </button>
      </div>
    </motion.div>
  )
}
