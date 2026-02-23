import { AnimatePresence, motion } from 'framer-motion'
import { useOnboardingStore } from '../store/onboardingStore'
import { GoalStep } from '../components/onboarding/GoalStep'
import { FrequencyStep } from '../components/onboarding/FrequencyStep'
import { EquipmentStep } from '../components/onboarding/EquipmentStep'
import { InjuryStep } from '../components/onboarding/InjuryStep'
import { ExperienceStep } from '../components/onboarding/ExperienceStep'
import { ProgramGeneratingStep } from '../components/onboarding/ProgramGeneratingStep'

const STEPS = [
  GoalStep,
  FrequencyStep,
  EquipmentStep,
  InjuryStep,
  ExperienceStep,
  ProgramGeneratingStep,
]

export function OnboardingFlow() {
  const { step } = useOnboardingStore()
  const StepComponent = STEPS[Math.min(step, STEPS.length - 1)]

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      {/* Progress bar */}
      <div className="h-0.5 bg-bg-elevated">
        <motion.div
          className="h-full bg-accent"
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 flex flex-col px-6 pt-12 pb-8 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
