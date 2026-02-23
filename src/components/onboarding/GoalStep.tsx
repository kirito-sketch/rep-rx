import { useOnboardingStore } from '../../store/onboardingStore'

const GOALS = [
  { value: 'muscle', label: 'Build Muscle', sub: 'Hypertrophy focus' },
  { value: 'strength', label: 'Get Stronger', sub: 'Progressive overload' },
  { value: 'fat_loss', label: 'Lose Fat', sub: 'Maintain muscle' },
  { value: 'general', label: 'General Fitness', sub: 'Well-rounded' },
]

export function GoalStep() {
  const { updateData, nextStep } = useOnboardingStore()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-text-muted text-xs uppercase tracking-widest mb-2">Step 1 of 5</p>
        <h2 className="text-xl font-semibold text-text-primary">What's your main goal?</h2>
      </div>
      <div className="flex flex-col gap-3">
        {GOALS.map((g) => (
          <button
            key={g.value}
            onClick={() => { updateData({ goal: g.value }); nextStep() }}
            className="flex items-center justify-between w-full bg-bg-surface border border-border rounded-md px-4 py-4 text-left hover:border-accent transition-colors min-h-[64px]"
          >
            <div>
              <p className="text-text-primary font-medium text-sm">{g.label}</p>
              <p className="text-text-muted text-xs">{g.sub}</p>
            </div>
            <span className="text-text-muted text-sm">→</span>
          </button>
        ))}
      </div>
    </div>
  )
}
