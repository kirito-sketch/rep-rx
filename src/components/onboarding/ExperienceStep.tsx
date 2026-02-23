import { useOnboardingStore } from '../../store/onboardingStore'

export function ExperienceStep() {
  const { updateData, nextStep, prevStep } = useOnboardingStore()

  const handleSelect = (note: string) => {
    updateData({ experienceNote: note })
    nextStep()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-text-muted text-xs uppercase tracking-widest mb-2">Step 5 of 5</p>
        <h2 className="text-xl font-semibold text-text-primary">How would you describe yourself?</h2>
        <p className="text-text-secondary text-sm mt-1">This helps calibrate exercise complexity and starting weights.</p>
      </div>
      <div className="flex flex-col gap-3">
        {[
          { label: 'New to training', sub: 'Under 6 months, still learning form', value: 'beginner_under_6mo' },
          { label: 'Trainer-led', sub: 'Gym time but no independent program knowledge', value: 'trainer_led' },
          { label: 'Self-taught', sub: '1-2 years, know the basics', value: 'intermediate_1_2yr' },
          { label: 'Experienced', sub: '3+ years, knows programming', value: 'experienced_3yr_plus' },
        ].map((o) => (
          <button
            key={o.value}
            onClick={() => handleSelect(o.value)}
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
