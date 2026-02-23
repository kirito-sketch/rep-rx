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
  unit: string
  value: number
  step: number
  min: number
  onChange: (v: number) => void
}

function Stepper({ label, unit, value, step, min, onChange }: StepperProps) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1.5">
      <p className="text-text-muted text-[11px] font-bold uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-2 w-full">
        <button
          onPointerDown={() => onChange(Math.max(min, value - step))}
          className="flex-none w-12 h-12 bg-bg-elevated border border-border rounded-xl text-text-primary text-xl font-light flex items-center justify-center active:bg-bg-base transition-colors select-none"
        >
          −
        </button>
        <div className="flex-1 text-center">
          <span className="tabular text-3xl font-extrabold text-text-primary select-none">
            {value % 1 === 0 ? value : value.toFixed(1)}
          </span>
          <span className="text-text-muted text-xs font-medium ml-1">{unit}</span>
        </div>
        <button
          onPointerDown={() => onChange(value + step)}
          className="flex-none w-12 h-12 bg-bg-elevated border border-border rounded-xl text-text-primary text-xl font-light flex items-center justify-center active:bg-bg-base transition-colors select-none"
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
    <div className="flex flex-col gap-4">
      {/* Set progress */}
      <div className="bg-white rounded-xl shadow-card px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-text-secondary text-xs font-bold">Sets</span>
          <span className="tabular text-text-muted text-xs">
            {currentSet} of {targetSets}
          </span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: targetSets }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors ${
                i < currentSet - 1
                  ? 'bg-accent'
                  : i === currentSet - 1
                  ? 'bg-accent/30'
                  : 'bg-bg-elevated'
              }`}
            />
          ))}
        </div>
        <p className="text-text-muted text-xs mt-2 text-center">
          Target{' '}
          <span className="text-text-secondary font-semibold tabular">
            {targetRepsMin}–{targetRepsMax} reps
          </span>
        </p>
      </div>

      {/* Steppers */}
      <div className="bg-white rounded-xl shadow-card px-4 py-5 flex gap-4">
        <Stepper label="Weight" unit="kg" value={weight} step={2.5} min={0} onChange={setWeight} />
        <div className="w-px bg-border" />
        <Stepper label="Reps" unit="reps" value={reps} step={1} min={1} onChange={setReps} />
      </div>

      {/* Log Set */}
      <motion.button
        onPointerDown={handleLog}
        animate={flash ? { scale: [1, 1.04, 1] } : {}}
        transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-full bg-accent text-white font-extrabold rounded-xl py-5 text-base tracking-wide active:opacity-80 transition-opacity select-none shadow-lift"
      >
        Log Set
      </motion.button>
    </div>
  )
}
