import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Model, { type IExerciseData, type Muscle } from 'react-body-highlighter'

// Maps ExerciseDB muscle names → react-body-highlighter muscle IDs
const MUSCLE_MAP: Record<string, Muscle> = {
  chest: 'chest',
  'upper chest': 'chest',
  pectorals: 'chest',
  lats: 'back-deltoids',
  'upper back': 'upper-back',
  biceps: 'biceps',
  'biceps brachii': 'biceps',
  triceps: 'triceps',
  shoulders: 'front-deltoids',
  delts: 'front-deltoids',
  deltoids: 'front-deltoids',
  'anterior deltoid': 'front-deltoids',
  'rear deltoid': 'back-deltoids',
  quads: 'quadriceps',
  quadriceps: 'quadriceps',
  hamstrings: 'hamstring',
  glutes: 'gluteal',
  calves: 'calves',
  abs: 'abs',
  core: 'abs',
  traps: 'trapezius',
  trapezius: 'trapezius',
  forearms: 'forearm',
  'lower back': 'lower-back',
}

function mapMuscle(name: string): Muscle | null {
  return MUSCLE_MAP[name.toLowerCase()] ?? null
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

  const primaryId = primaryMuscle ? mapMuscle(primaryMuscle) : null
  const secondaryIds = secondaryMuscles.map(mapMuscle).filter((m): m is Muscle => m !== null)

  const allMuscles: Muscle[] = [
    ...(primaryId ? [primaryId] : []),
    ...secondaryIds,
  ]

  const muscleData: IExerciseData[] = allMuscles.length > 0
    ? [{ name: exerciseName, muscles: allMuscles }]
    : []

  const handleExpand = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setExpanded(true)
    timerRef.current = setTimeout(() => setExpanded(false), 5000)
  }

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <AnimatePresence initial={false} mode="wait">
        {expanded ? (
          <motion.div
            key="expanded"
            initial={{ height: 64 }}
            animate={{ height: 'auto' }}
            exit={{ height: 64 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative bg-bg-elevated cursor-pointer overflow-hidden"
            onClick={() => {
              if (timerRef.current) clearTimeout(timerRef.current)
              setExpanded(false)
            }}
          >
            <div className="flex min-h-[180px]">
              {/* Anatomy SVG — left half */}
              <div className="w-1/2 flex items-center justify-center p-4 bg-bg-surface">
                {muscleData.length > 0 ? (
                  <Model
                    data={muscleData}
                    style={{ width: '100%', maxHeight: 160 }}
                    highlightedColors={['#f97316', '#fb923c']}
                    bodyColor="#1e293b"
                    onClick={() => {}}
                  />
                ) : (
                  <div className="text-text-muted text-xs text-center">
                    <p>{primaryMuscle ?? 'Unknown muscle'}</p>
                  </div>
                )}
              </div>

              {/* Exercise GIF — right half */}
              <div className="w-1/2 flex items-center justify-center p-4 bg-bg-base">
                {gifUrl ? (
                  <img
                    src={gifUrl}
                    alt={`${exerciseName} technique`}
                    className="w-full max-h-40 object-contain rounded-sm"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-text-muted text-xs text-center px-2">
                    No demo available
                  </div>
                )}
              </div>
            </div>

            <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
              <span className="text-text-muted text-xs bg-bg-base/80 px-2 py-1 rounded-sm">
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
            className="w-full h-16 flex items-center gap-3 px-4 bg-bg-elevated text-left"
          >
            {gifUrl ? (
              <img
                src={gifUrl}
                alt=""
                className="h-10 w-10 object-contain rounded-sm flex-shrink-0"
                loading="lazy"
              />
            ) : (
              <div className="h-10 w-10 bg-bg-surface rounded-sm flex-shrink-0 flex items-center justify-center">
                <span className="text-text-muted text-xs">?</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-sm font-medium truncate">{exerciseName}</p>
              <p className="text-text-muted text-xs">
                {primaryMuscle ?? 'Unknown'} · Tap to view
              </p>
            </div>
            <span className="text-text-muted text-xs flex-shrink-0">▲</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
