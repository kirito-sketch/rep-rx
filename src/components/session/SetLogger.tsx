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

/**
 * Value sits ABOVE the −/+ buttons so buttons can be flex-1 width.
 * This eliminates the horizontal overflow bug where a fixed-width button
 * + large inline number + fixed-width button exceeded the column width.
 */
function Stepper({ label, unit, value, step, min, onChange }: StepperProps) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2">
      <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">{label}</p>
      <p className="tabular text-[32px] leading-none font-extrabold text-text-primary">
        {value % 1 === 0 ? value : value.toFixed(1)}
        <span className="text-text-muted text-xs font-medium ml-0.5">{unit}</span>
      </p>
      <div className="flex gap-2 w-full">
        <button
          onPointerDown={() => onChange(Math.max(min, value - step))}
          className="flex-1 h-11 bg-bg-elevated border border-border rounded-xl text-text-secondary text-xl flex items-center justify-center active:bg-bg-base transition-colors select-none"
        >
          −
        </button>
        <button
          onPointerDown={() => onChange(value + step)}
          className="flex-1 h-11 bg-bg-elevated border border-border rounded-xl text-text-secondary text-xl flex items-center justify-center active:bg-bg-base transition-colors select-none"
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
    <div className="flex flex-col gap-3">

      {/* Set progress */}
      <div className="bg-white rounded-2xl shadow-card px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-text-primary text-sm font-bold">
            Set {currentSet}
            <span className="text-text-muted font-normal"> of {targetSets}</span>
          </span>
          <span className="text-text-muted text-xs tabular">
            Target <span className="font-semibold text-text-secondary">{targetRepsMin}–{targetRepsMax}</span> reps
          </span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: targetSets }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < currentSet - 1
                  ? 'bg-accent'
                  : i === currentSet - 1
                  ? 'bg-accent/35'
                  : 'bg-bg-elevated'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Weight + Reps */}
      <div className="bg-white rounded-2xl shadow-card px-4 py-4 flex gap-4">
        <Stepper
          label="Weight"
          unit="kg"
          value={weight}
          step={2.5}
          min={0}
          onChange={setWeight}
        />
        <div className="w-px bg-border self-stretch" />
        <Stepper
          label="Reps"
          unit="reps"
          value={reps}
          step={1}
          min={1}
          onChange={setReps}
        />
      </div>

      {/* Log Set */}
      <motion.button
        onPointerDown={handleLog}
        animate={flash ? { scale: [1, 1.04, 1] } : {}}
        transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-full bg-accent text-white font-extrabold rounded-2xl py-4 text-base tracking-wide active:opacity-80 transition-opacity select-none shadow-lift"
      >
        Log Set {currentSet}
      </motion.button>
    </div>
  )
}
