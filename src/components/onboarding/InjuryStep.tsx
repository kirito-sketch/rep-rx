import { useState } from 'react'
import { useOnboardingStore } from '../../store/onboardingStore'

const COMMON_INJURIES = [
  { value: 'left_shoulder', label: 'Left Shoulder' },
  { value: 'right_shoulder', label: 'Right Shoulder' },
  { value: 'left_hip', label: 'Left Hip' },
  { value: 'right_hip', label: 'Right Hip' },
  { value: 'lower_back', label: 'Lower Back' },
  { value: 'left_knee', label: 'Left Knee' },
  { value: 'right_knee', label: 'Right Knee' },
]

export function InjuryStep() {
  const { updateData, nextStep, prevStep } = useOnboardingStore()
  const [selected, setSelected] = useState<string[]>([])
  const [painScale, setPainScale] = useState<Record<string, number>>({})

  const toggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
    if (!painScale[value]) {
      setPainScale((p) => ({ ...p, [value]: 5 }))
    }
  }

  const handleNext = () => {
    const injuries = selected.map((bodyPart) => ({
      bodyPart,
      painScale: painScale[bodyPart] ?? 5,
      avoidMovements: [],
    }))
    updateData({ injuries })
    nextStep()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-text-muted text-xs uppercase tracking-widest mb-2">Step 4 of 5</p>
        <h2 className="text-xl font-semibold text-text-primary">Any injuries?</h2>
        <p className="text-text-secondary text-sm mt-1">We'll work around them, not ignore them.</p>
      </div>

      <div className="flex flex-col gap-2">
        {COMMON_INJURIES.map((injury) => {
          const active = selected.includes(injury.value)
          return (
            <div key={injury.value}>
              <button
                onClick={() => toggle(injury.value)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-md border text-sm transition-colors ${
                  active
                    ? 'border-accent bg-accent-dim text-text-primary'
                    : 'border-border bg-bg-surface text-text-secondary'
                }`}
              >
                <span>{injury.label}</span>
                {active && (
                  <span className="text-accent-text text-xs font-medium">Active</span>
                )}
              </button>

              {active && (
                <div className="px-4 py-3 bg-bg-elevated border border-border border-t-0 rounded-b-md">
                  <p className="text-text-muted text-xs mb-2">
                    Pain level: <span className="text-text-secondary tabular">{painScale[injury.value] ?? 5}</span>/10
                  </p>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={painScale[injury.value] ?? 5}
                    onChange={(e) =>
                      setPainScale((p) => ({ ...p, [injury.value]: +e.target.value }))
                    }
                    className="w-full accent-orange-500"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex gap-3 mt-auto">
        <button onClick={prevStep} className="flex-1 border border-border rounded-md py-4 text-text-secondary text-sm">
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 bg-accent text-white font-semibold rounded-md py-4 text-sm"
        >
          {selected.length === 0 ? 'No injuries →' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}
