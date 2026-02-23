import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Model, { type IExerciseData, type Muscle } from 'react-body-highlighter'
import { MuscleGroupIcon } from '../MuscleGroupIcon'

// Maps muscle DB names → react-body-highlighter muscle IDs
const MUSCLE_MAP: Record<string, Muscle> = {
  chest: 'chest', 'upper chest': 'chest', pectorals: 'chest',
  'pectoralis major': 'chest', 'pectoralis minor': 'chest', 'serratus anterior': 'chest',
  lats: 'back-deltoids', latissimus: 'back-deltoids', 'latissimus dorsi': 'back-deltoids',
  'upper back': 'upper-back', 'lower back': 'lower-back', 'erector spinae': 'lower-back',
  rhomboids: 'upper-back', 'rear deltoid': 'back-deltoids', 'posterior deltoid': 'back-deltoids',
  infraspinatus: 'back-deltoids', 'teres major': 'back-deltoids', 'teres minor': 'back-deltoids',
  'levator scapulae': 'trapezius',
  shoulders: 'front-deltoids', delts: 'front-deltoids', deltoids: 'front-deltoids',
  deltoid: 'front-deltoids', 'anterior deltoid': 'front-deltoids', 'front deltoid': 'front-deltoids',
  'front deltoids': 'front-deltoids', 'lateral deltoid': 'front-deltoids', 'medial deltoid': 'front-deltoids',
  traps: 'trapezius', trapezius: 'trapezius', neck: 'neck',
  biceps: 'biceps', 'biceps brachii': 'biceps', brachialis: 'biceps',
  brachioradialis: 'forearm', triceps: 'triceps', 'triceps brachii': 'triceps',
  forearms: 'forearm', forearm: 'forearm', 'wrist flexors': 'forearm', 'wrist extensors': 'forearm',
  abs: 'abs', abdominals: 'abs', core: 'abs', obliques: 'obliques', oblique: 'obliques',
  'external oblique': 'obliques', 'internal oblique': 'obliques', 'transverse abdominis': 'abs',
  'rectus abdominis': 'abs',
  quads: 'quadriceps', quadriceps: 'quadriceps', quad: 'quadriceps', 'rectus femoris': 'quadriceps',
  'vastus lateralis': 'quadriceps', 'vastus medialis': 'quadriceps',
  hamstrings: 'hamstring', hamstring: 'hamstring', 'biceps femoris': 'hamstring',
  glutes: 'gluteal', gluteal: 'gluteal', gluteus: 'gluteal', 'gluteus maximus': 'gluteal',
  'gluteus medius': 'gluteal', calves: 'calves', calf: 'calves', gastrocnemius: 'calves',
  soleus: 'left-soleus', 'hip flexors': 'quadriceps', adductors: 'adductor', adductor: 'adductor',
  abductors: 'abductors', abductor: 'abductors',
}

const NAME_MUSCLE_MAP: Array<[RegExp, Muscle]> = [
  [/press|fly|flye|push.?up|dip|pec/i, 'chest'],
  [/row|pull.?down|pull.?up|chin.?up|lat/i, 'back-deltoids'],
  [/deadlift|back.?ext|hyper|erect/i, 'lower-back'],
  [/squat|leg.?press|lunge|step.?up|leg.?ext/i, 'quadriceps'],
  [/leg.?curl|hamstring|rdl|romanian/i, 'hamstring'],
  [/hip.?thrust|glute|donkey/i, 'gluteal'],
  [/calf.raise|calf|gastro/i, 'calves'],
  [/curl|bicep|hammer/i, 'biceps'],
  [/tricep|skull.?crush|push.?down/i, 'triceps'],
  [/shoulder|lateral.raise|overhead/i, 'front-deltoids'],
  [/shrug|trap/i, 'trapezius'],
  [/crunch|sit.?up|plank|core/i, 'abs'],
  [/oblique|twist/i, 'obliques'],
  [/forearm|wrist/i, 'forearm'],
]

function mapMuscle(name: string): Muscle | null {
  return MUSCLE_MAP[name.toLowerCase()] ?? null
}

function guessFromName(exerciseName: string): Muscle | null {
  for (const [pattern, muscle] of NAME_MUSCLE_MAP) {
    if (pattern.test(exerciseName)) return muscle
  }
  return null
}

interface Props {
  exerciseName: string
  gifUrl: string | null
  primaryMuscle: string | null
  secondaryMuscles: string[]
  isNewExercise: boolean
}

export function ExerciseMediaCard({
  exerciseName,
  gifUrl,
  primaryMuscle,
  secondaryMuscles,
  isNewExercise,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isNewExercise) {
      setExpanded(true)
      timerRef.current = setTimeout(() => setExpanded(false), 5000)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isNewExercise, exerciseName])

  const primaryId =
    (primaryMuscle ? mapMuscle(primaryMuscle) : null) ?? guessFromName(exerciseName)

  const secondaryIds = (secondaryMuscles ?? [])
    .map(mapMuscle)
    .filter((m): m is Muscle => m !== null)

  const allMuscles: Muscle[] = [...(primaryId ? [primaryId] : []), ...secondaryIds]

  const muscleData: IExerciseData[] =
    allMuscles.length > 0 ? [{ name: exerciseName, muscles: allMuscles }] : []

  const handleExpand = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setExpanded(true)
    timerRef.current = setTimeout(() => setExpanded(false), 5000)
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white shadow-card">
      <AnimatePresence initial={false} mode="wait">
        {expanded ? (
          <motion.div
            key="expanded"
            initial={{ height: 68 }}
            animate={{ height: 'auto' }}
            exit={{ height: 68 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative cursor-pointer overflow-hidden"
            onClick={() => {
              if (timerRef.current) clearTimeout(timerRef.current)
              setExpanded(false)
            }}
          >
            <div className="flex min-h-[180px]">
              {/* Anatomy model — left half */}
              <div className="w-1/2 flex items-center justify-center p-4 bg-bg-elevated">
                {muscleData.length > 0 ? (
                  <Model
                    data={muscleData}
                    style={{ width: '100%', maxHeight: 160 }}
                    highlightedColors={['#EA580C', '#FB923C']}
                    bodyColor="#D6CFBF"
                    onClick={() => {}}
                  />
                ) : (
                  <MuscleGroupIcon
                    muscle={primaryId as any}
                    size={100}
                    accent="#EA580C"
                    baseColor="#A59D95"
                  />
                )}
              </div>

              {/* Exercise GIF / illustration — right half */}
              <div className="w-1/2 flex items-center justify-center p-4 bg-bg-base">
                {gifUrl ? (
                  <img
                    src={gifUrl}
                    alt={`${exerciseName} technique`}
                    className="w-full max-h-40 object-contain rounded-lg"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <MuscleGroupIcon
                      muscle={primaryId as any}
                      size={90}
                      accent="#EA580C"
                      baseColor="#E3DDD4"
                    />
                    <p className="text-text-muted text-[10px] text-center capitalize">
                      {primaryMuscle ?? (primaryId ? primaryId.replace(/-/g, ' ') : 'full body')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
              <span className="text-text-muted text-[10px] bg-white/90 px-2.5 py-1 rounded-full font-medium shadow-card">
                Tap to collapse
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleExpand}
            className="w-full h-[68px] flex items-center gap-3 px-4 bg-white text-left"
          >
            {gifUrl ? (
              <img
                src={gifUrl}
                alt=""
                className="h-12 w-12 object-contain rounded-lg flex-shrink-0 bg-bg-elevated"
                loading="lazy"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-accent-dim flex-shrink-0 flex items-center justify-center">
                <MuscleGroupIcon
                  muscle={primaryId as any}
                  size={38}
                  accent="#EA580C"
                  baseColor="#E3DDD4"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-sm font-semibold truncate">{exerciseName}</p>
              <p className="text-text-muted text-xs capitalize">
                {primaryMuscle ?? (primaryId ? primaryId.replace(/-/g, ' ') : 'General')}
                {' · '}
                <span className="text-accent text-[10px] font-semibold">Tap to view</span>
              </p>
            </div>
            <span className="text-text-muted text-xs flex-shrink-0">▲</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
