import { create } from 'zustand'

export interface InjuryEntry {
  bodyPart: string
  painScale: number
  avoidMovements: string[]
}

export interface OnboardingData {
  goal: string
  daysPerWeek: number
  gymType: string
  injuries: InjuryEntry[]
  experienceNote: string
}

interface OnboardingState {
  step: number
  data: Partial<OnboardingData>
  nextStep: () => void
  prevStep: () => void
  updateData: (patch: Partial<OnboardingData>) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 0,
  data: {},
  nextStep: () => set((s) => ({ step: s.step + 1 })),
  prevStep: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
  updateData: (patch) => set((s) => ({ data: { ...s.data, ...patch } })),
  reset: () => set({ step: 0, data: {} }),
}))
