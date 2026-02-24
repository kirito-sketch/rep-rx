import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useSessionStore } from '../store/sessionStore'
import { ExerciseMediaCard } from '../components/session/ExerciseMediaCard'
import { SetLogger } from '../components/session/SetLogger'
import { RestTimer } from '../components/session/RestTimer'
import { SessionWrap } from '../components/session/SessionWrap'
import { tutorialUrl } from '../lib/youtube'

export function SessionPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  const {
    currentExerciseIndex,
    currentSet,
    setLogs,
    setSessionId,
    nextExercise,
    resetSession,
  } = useSessionStore()

  const [template, setTemplate] = useState<any>(null)
  const [sessionId, _setSessionId] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const startedAt = useRef(new Date())
  const sessionCreated = useRef(false)

  useEffect(() => {
    if (!templateId) return
    resetSession()

    supabase
      .from('workout_templates')
      .select(
        `id, label,
         template_exercises(
           id, exercise_id, target_sets, target_reps_min, target_reps_max,
           target_weight, rest_seconds, order_index,
           exercises(name, muscle_group_primary, muscle_group_secondary, gif_url)
         )`
      )
      .eq('id', templateId)
      .order('order_index', { referencedTable: 'template_exercises' })
      .single()
      .then(({ data }) => setTemplate(data))

    if (!sessionCreated.current) {
      sessionCreated.current = true
      startedAt.current = new Date()
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return
        supabase
          .from('workout_sessions')
          .insert({ user_id: user.id, template_id: templateId })
          .select()
          .single()
          .then(({ data }) => {
            if (data) { _setSessionId(data.id); setSessionId(data.id) }
          })
      })
    }
  }, [templateId])

  const exercises = (template?.template_exercises ?? []).sort(
    (a: any, b: any) => a.order_index - b.order_index
  )
  const currentExercise = exercises[currentExerciseIndex]
  const isLastExercise = currentExerciseIndex >= exercises.length - 1
  const allSetsLogged = currentSet > (currentExercise?.target_sets ?? 3)

  const handleNext = () => {
    if (isLastExercise) setDone(true)
    else nextExercise()
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  if (done && sessionId) {
    return <SessionWrap sessionId={sessionId} setLogs={setLogs} startedAt={startedAt.current} />
  }

  return (
    <div className="h-screen bg-bg-base flex flex-col overflow-hidden">

      {/* Header */}
      <header className="flex-none flex items-center justify-between px-5 pt-12 pb-3 border-b border-border bg-bg-base">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-text-secondary text-sm font-semibold"
        >
          <span>←</span><span>Exit</span>
        </button>
        <p className="text-text-primary text-sm font-bold truncate max-w-[150px]">{template.label}</p>
        <p className="text-text-muted text-sm tabular font-medium">
          {currentExerciseIndex + 1}/{exercises.length}
        </p>
      </header>

      {/* Exercise identity — slides on change */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentExerciseIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.22 }}
          className="flex-none px-5 pt-4 pb-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-text-primary font-extrabold text-xl leading-tight">
                {currentExercise?.exercises?.name ?? currentExercise?.exercise_id}
              </h2>
              {currentExercise?.exercises?.muscle_group_primary && (
                <p className="text-text-muted text-xs mt-0.5 font-medium capitalize">
                  {currentExercise.exercises.muscle_group_primary}
                </p>
              )}
            </div>
            {currentExercise?.exercises?.name && (
              <a
                href={tutorialUrl(currentExercise.exercises.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-none flex items-center gap-1 text-[11px] font-semibold text-accent border border-accent/30 bg-accent-dim rounded-lg px-2.5 py-1.5 active:opacity-70 transition-opacity whitespace-nowrap"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <polygon points="2,1 11,6 2,11" fill="#EA580C" />
                </svg>
                Watch
              </a>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Media hero — always visible, never scrolls away */}
      <div className="flex-none px-5 pb-4">
        <ExerciseMediaCard
          key={`media-${currentExerciseIndex}`}
          exerciseName={currentExercise?.exercises?.name ?? ''}
          gifUrl={currentExercise?.exercises?.gif_url ?? null}
          primaryMuscle={currentExercise?.exercises?.muscle_group_primary ?? null}
          secondaryMuscles={currentExercise?.exercises?.muscle_group_secondary ?? []}
        />
      </div>

      {/* Set logger — scrollable */}
      <div className="flex-1 overflow-y-auto px-5 pb-40 flex flex-col gap-4">
        {allSetsLogged ? (
          <motion.button
            key="next"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleNext}
            className="w-full bg-accent text-white font-extrabold rounded-xl py-5 text-base tracking-wide active:opacity-80 transition-opacity shadow-lift"
          >
            {isLastExercise ? 'Finish Session →' : 'Next Exercise →'}
          </motion.button>
        ) : (
          <SetLogger
            key={`logger-${currentExerciseIndex}`}
            exerciseId={currentExercise?.exercise_id ?? ''}
            targetSets={currentExercise?.target_sets ?? 3}
            targetRepsMin={currentExercise?.target_reps_min ?? 8}
            targetRepsMax={currentExercise?.target_reps_max ?? 12}
            targetWeight={currentExercise?.target_weight ?? 20}
            restSeconds={currentExercise?.rest_seconds ?? 90}
          />
        )}
      </div>

      <RestTimer />
    </div>
  )
}
