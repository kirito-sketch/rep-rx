import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useSessionStore } from '../store/sessionStore'
import { ExerciseMediaCard } from '../components/session/ExerciseMediaCard'
import { SetLogger } from '../components/session/SetLogger'
import { RestTimer } from '../components/session/RestTimer'
import { SessionWrap } from '../components/session/SessionWrap'

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

    // Load template
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

    // Create session record (once)
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
            if (data) {
              _setSessionId(data.id)
              setSessionId(data.id)
            }
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
    if (isLastExercise) {
      setDone(true)
    } else {
      nextExercise()
    }
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-bg-elevated border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  if (done && sessionId) {
    return (
      <SessionWrap
        sessionId={sessionId}
        setLogs={setLogs}
        startedAt={startedAt.current}
      />
    )
  }

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-12 pb-4 flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-text-muted text-sm"
        >
          ← Exit
        </button>
        <p className="text-text-secondary text-sm tabular">
          {currentExerciseIndex + 1} / {exercises.length}
        </p>
      </header>

      <main className="flex-1 flex flex-col px-6 gap-5 overflow-y-auto pb-48">
        {/* Exercise name */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExerciseIndex}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-text-primary font-semibold text-lg leading-tight">
              {currentExercise?.exercises?.name ?? currentExercise?.exercise_id}
            </h2>
            {currentExercise?.exercises?.muscle_group_primary && (
              <p className="text-text-muted text-xs mt-0.5">
                {currentExercise.exercises.muscle_group_primary}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Media card */}
        <ExerciseMediaCard
          key={currentExerciseIndex}
          exerciseName={currentExercise?.exercises?.name ?? ''}
          gifUrl={currentExercise?.exercises?.gif_url ?? null}
          primaryMuscle={currentExercise?.exercises?.muscle_group_primary ?? null}
          secondaryMuscles={currentExercise?.exercises?.muscle_group_secondary ?? []}
          isNewExercise={true}
        />

        {/* Logger or next */}
        {allSetsLogged ? (
          <button
            onClick={handleNext}
            className="w-full bg-accent text-white font-semibold rounded-md py-5 text-base"
          >
            {isLastExercise ? 'Finish Session →' : 'Next Exercise →'}
          </button>
        ) : (
          <SetLogger
            exerciseId={currentExercise?.exercise_id ?? ''}
            targetSets={currentExercise?.target_sets ?? 3}
            targetRepsMin={currentExercise?.target_reps_min ?? 8}
            targetRepsMax={currentExercise?.target_reps_max ?? 12}
            targetWeight={currentExercise?.target_weight ?? 20}
            restSeconds={currentExercise?.rest_seconds ?? 90}
          />
        )}
      </main>

      <RestTimer />
    </div>
  )
}
