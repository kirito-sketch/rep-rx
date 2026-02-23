import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { useSessionStore } from '../../store/sessionStore'

interface Props {
  exerciseId: string
  targetSets: number
  targetRepsMin: number
  targetRepsMax: number
  targetWeight: number
  restSeconds: number
}

interface StepperProps {
  label: string
  value: number
  step: number
  min: number
  onChange: (v: number) => void
}

function Stepper({ label, value, step, min, onChange }: StepperProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-text-muted text-xs uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-3">
        <button
          onPointerDown={() => onChange(Math.max(min, value - step))}
          className="w-14 h-14 bg-bg-elevated border border-border rounded-md text-text-primary text-2xl font-light flex items-center justify-center active:bg-bg-surface transition-colors select-none"
        >
          −
        </button>
        <span className="tabular text-3xl font-bold text-text-primary w-20 text-center select-none">
          {value % 1 === 0 ? value : value.toFixed(1)}
        </span>
        <button
          onPointerDown={() => onChange(value + step)}
          className="w-14 h-14 bg-bg-elevated border border-border rounded-md text-text-primary text-2xl font-light flex items-center justify-center active:bg-bg-surface transition-colors select-none"
        >
          +
        </button>
      </div>
    </div>
  )
}

export function SetLogger({
  exerciseId,
  targetSets,
  targetRepsMin,
  targetRepsMax,
  targetWeight,
  restSeconds,
}: Props) {
  const { currentSet, logSet, startRest } = useSessionStore()
  const [weight, setWeight] = useState(targetWeight)
  const [reps, setReps] = useState(targetRepsMax)
  const [flash, setFlash] = useState(false)

  const handleLog = useCallback(() => {
    logSet({ exerciseId, setNumber: currentSet, weightKg: weight, reps })
    startRest(restSeconds)
    setFlash(true)
    setTimeout(() => setFlash(false), 300)
  }, [exerciseId, currentSet, weight, reps, restSeconds, logSet, startRest])

  return (
    <div className="flex flex-col gap-5">
      {/* Set progress dots */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: targetSets }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < currentSet - 1
                ? 'bg-accent'
                : i === currentSet - 1
                ? 'bg-accent/40'
                : 'bg-bg-elevated'
            }`}
          />
        ))}
        <span className="text-text-muted text-xs ml-1 tabular whitespace-nowrap">
          Set {currentSet}/{targetSets}
        </span>
      </div>

      {/* Target hint */}
      <p className="text-text-muted text-xs text-center">
        Target{' '}
        <span className="text-text-secondary tabular">
          {targetRepsMin}–{targetRepsMax} reps
        </span>
      </p>

      {/* Steppers */}
      <Stepper label="kg" value={weight} step={2.5} min={0} onChange={setWeight} />
      <Stepper label="reps" value={reps} step={1} min={1} onChange={setReps} />

      {/* LOG SET */}
      <motion.button
        onPointerDown={handleLog}
        animate={flash ? { scale: [1, 1.04, 1] } : {}}
        transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-full bg-accent text-white font-semibold rounded-md py-5 text-base active:opacity-80 transition-opacity select-none"
      >
        Log Set
      </motion.button>
    </div>
  )
}
