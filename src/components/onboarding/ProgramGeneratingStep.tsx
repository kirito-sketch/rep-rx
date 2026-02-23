import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '../../store/onboardingStore'
import { generateProgram } from '../../lib/generateProgram'
import { getOrCacheExercise } from '../../lib/exerciseDb'
import { supabase } from '../../lib/supabase'

const STEPS = [
  'Analyzing your goals...',
  'Mapping injury constraints...',
  'Selecting exercises...',
  'Building your 4-week split...',
  'Saving your program...',
]

export function ProgramGeneratingStep() {
  const { data, reset } = useOnboardingStore()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const stepInterval = setInterval(() => {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1))
    }, 1400)

    const run = async () => {
      try {
        // 1. Generate program via Groq
        const program = await generateProgram(data as any)

        // 2. Get Supabase user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated — please reload and try again')

        // 3. Upsert profile
        const { error: profileErr } = await supabase.from('profiles').upsert({
          id: user.id,
          goal: data.goal,
          days_per_week: data.daysPerWeek,
          gym_type: data.gymType,
          onboarded: true,
        })
        if (profileErr) throw new Error(`Profile save failed: ${profileErr.message}`)

        // 4. Save injuries
        if (data.injuries && data.injuries.length > 0) {
          const { error: injuryErr } = await supabase.from('injuries').insert(
            data.injuries.map((i) => ({
              user_id: user.id,
              body_part: i.bodyPart,
              pain_scale: i.painScale,
              avoid_movements: i.avoidMovements,
              active: true,
            }))
          )
          if (injuryErr) console.warn('Injury save failed (non-fatal):', injuryErr.message)
        }

        // 5. Save program record
        const { data: prog, error: progErr } = await supabase
          .from('programs')
          .insert({
            user_id: user.id,
            name: program.name,
            week_count: program.weekCount,
            active: true,
          })
          .select()
          .single()
        if (progErr || !prog) throw new Error(`Program save failed: ${progErr?.message}`)

        // 6. Save templates + exercises for each day
        for (const day of program.split) {
          // Insert workout template
          const { data: tmpl, error: tmplErr } = await supabase
            .from('workout_templates')
            .insert({
              program_id: prog.id,
              day_of_week: day.dayOfWeek,
              label: day.label,
              order_index: day.dayOfWeek,
            })
            .select()
            .single()

          if (tmplErr || !tmpl) {
            console.error(`Template save failed for day ${day.dayOfWeek}:`, tmplErr?.message)
            continue
          }

          // Cache all exercises in parallel (each returns an exercise record with id)
          const exerciseRecords = await Promise.all(
            day.exercises.map((ex) => getOrCacheExercise(ex.name))
          )

          // Insert template_exercises — only include rows where exercise was cached
          const templateExRows = day.exercises
            .map((ex, i) => {
              const exRecord = exerciseRecords[i]
              if (!exRecord?.id) {
                console.warn(`Skipping exercise "${ex.name}" — no ID`)
                return null
              }
              return {
                template_id: tmpl.id,
                exercise_id: exRecord.id,
                target_sets: ex.sets,
                target_reps_min: ex.repsMin,
                target_reps_max: ex.repsMax,
                target_weight: ex.startingWeightKg,
                rest_seconds: ex.restSeconds,
                order_index: i,
              }
            })
            .filter(Boolean)

          if (templateExRows.length > 0) {
            const { error: texErr } = await supabase
              .from('template_exercises')
              .insert(templateExRows)
            if (texErr) {
              throw new Error(`Exercise save failed for day ${day.dayOfWeek}: ${texErr.message}`)
            }
          }
        }

        clearInterval(stepInterval)
        reset()
        navigate('/')
      } catch (err) {
        clearInterval(stepInterval)
        console.error('Onboarding error:', err)
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      }
    }

    run()
    return () => clearInterval(stepInterval)
  }, [])

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-red-400 text-sm px-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-accent text-sm underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-2 border-bg-elevated border-t-accent rounded-full"
      />
      <div className="text-center">
        <p className="text-text-primary font-medium">Building your program</p>
        <motion.p
          key={currentStep}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-text-muted text-sm mt-1"
        >
          {STEPS[currentStep]}
        </motion.p>
      </div>
    </div>
  )
}
