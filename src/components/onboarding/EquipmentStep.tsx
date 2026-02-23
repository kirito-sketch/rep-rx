import { useOnboardingStore } from '../../store/onboardingStore'

const OPTIONS = [
  { value: 'commercial', label: 'Commercial Gym', sub: 'Full equipment access' },
  { value: 'home', label: 'Home Gym', sub: 'Dumbbells, bench, rack' },
  { value: 'limited', label: 'Limited', sub: 'Minimal equipment' },
]

export function EquipmentStep() {
  const { updateData, nextStep, prevStep } = useOnboardingStore()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-text-muted text-xs uppercase tracking-widest mb-2">Step 3 of 5</p>
        <h2 className="text-xl font-semibold text-text-primary">Where do you train?</h2>
      </div>
      <div className="flex flex-col gap-3">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => { updateData({ gymType: o.value }); nextStep() }}
            className="flex items-center justify-between w-full bg-bg-surface border border-border rounded-md px-4 py-4 text-left hover:border-accent transition-colors min-h-[64px]"
          >
            <div>
              <p className="text-text-primary font-medium text-sm">{o.label}</p>
              <p className="text-text-muted text-xs">{o.sub}</p>
            </div>
            <span className="text-text-muted text-sm">→</span>
          </button>
        ))}
      </div>
      <button onClick={prevStep} className="w-full border border-border rounded-md py-4 text-text-secondary text-sm">
        Back
      </button>
    </div>
  )
}
