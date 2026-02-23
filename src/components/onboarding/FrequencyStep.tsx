import { useState } from 'react'
import { useOnboardingStore } from '../../store/onboardingStore'

const OPTIONS = [3, 4, 5, 6]

export function FrequencyStep() {
  const { updateData, nextStep, prevStep } = useOnboardingStore()
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-text-muted text-xs uppercase tracking-widest mb-2">Step 2 of 5</p>
        <h2 className="text-xl font-semibold text-text-primary">How many days per week?</h2>
        <p className="text-text-secondary text-sm mt-1">Be realistic — consistency beats perfection.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map((n) => (
          <button
            key={n}
            onClick={() => setSelected(n)}
            className={`flex flex-col items-center justify-center py-6 border rounded-md transition-colors ${
              selected === n
                ? 'border-accent bg-accent-dim text-text-primary'
                : 'border-border bg-bg-surface text-text-secondary'
            }`}
          >
            <span className="tabular text-3xl font-bold">{n}</span>
            <span className="text-xs mt-1 text-text-muted">days/week</span>
          </button>
        ))}
      </div>
      <div className="flex gap-3 mt-auto">
        <button onClick={prevStep} className="flex-1 border border-border rounded-md py-4 text-text-secondary text-sm">
          Back
        </button>
        <button
          onClick={() => { if (selected) { updateData({ daysPerWeek: selected }); nextStep() } }}
          disabled={!selected}
          className="flex-2 flex-1 bg-accent text-white font-semibold rounded-md py-4 text-sm disabled:opacity-40"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
