import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

interface TemplateExercise {
  id: string
  exercise_id: string
  target_sets: number
  target_reps_min: number
  target_reps_max: number
  exercises?: { name: string } | null
}

interface Template {
  id: string
  label: string
  template_exercises?: TemplateExercise[]
}

export function TodayCard({ template }: { template: Template }) {
  const navigate = useNavigate()
  const exerciseCount = template.template_exercises?.length ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-bg-surface border border-border rounded-md p-6"
    >
      <div className="mb-5">
        <p className="text-accent-text text-xs font-medium uppercase tracking-widest mb-1">
          Today
        </p>
        <h2 className="text-text-primary font-semibold text-lg leading-tight">
          {template.label}
        </h2>
        <p className="text-text-muted text-xs mt-1">{exerciseCount} exercises</p>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        {template.template_exercises?.slice(0, 4).map((te) => (
          <div key={te.id} className="flex items-center justify-between py-1">
            <span className="text-text-secondary text-sm">
              {te.exercises?.name ?? te.exercise_id}
            </span>
            <span className="text-text-muted text-xs tabular">
              {te.target_sets}×{te.target_reps_min}–{te.target_reps_max}
            </span>
          </div>
        ))}
        {exerciseCount > 4 && (
          <p className="text-text-muted text-xs">+{exerciseCount - 4} more</p>
        )}
      </div>

      <button
        onClick={() => navigate(`/session/${template.id}`)}
        className="w-full bg-accent text-white font-semibold rounded-md py-4 text-sm transition-opacity active:opacity-80"
      >
        Start Session →
      </button>
    </motion.div>
  )
}
