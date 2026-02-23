import { create } from 'zustand'

export interface SetLog {
  exerciseId: string
  setNumber: number
  weightKg: number
  reps: number
  isPr?: boolean
}

interface SessionState {
  sessionId: string | null
  currentExerciseIndex: number
  currentSet: number
  setLogs: SetLog[]
  restActive: boolean
  restSecondsRemaining: number
  restTotalSeconds: number
  setSessionId: (id: string) => void
  logSet: (log: SetLog) => void
  startRest: (seconds: number) => void
  tickRest: () => void
  nextExercise: () => void
  dismissRest: () => void
  resetSession: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  currentExerciseIndex: 0,
  currentSet: 1,
  setLogs: [],
  restActive: false,
  restSecondsRemaining: 0,
  restTotalSeconds: 90,
  setSessionId: (id) => set({ sessionId: id }),
  logSet: (log) =>
    set((s) => ({
      setLogs: [...s.setLogs, log],
      currentSet: s.currentSet + 1,
    })),
  startRest: (seconds) =>
    set({ restActive: true, restSecondsRemaining: seconds, restTotalSeconds: seconds }),
  tickRest: () =>
    set((s) => {
      if (s.restSecondsRemaining <= 1)
        return { restActive: false, restSecondsRemaining: 0 }
      return { restSecondsRemaining: s.restSecondsRemaining - 1 }
    }),
  nextExercise: () =>
    set((s) => ({
      currentExerciseIndex: s.currentExerciseIndex + 1,
      currentSet: 1,
      restActive: false,
    })),
  dismissRest: () => set({ restActive: false }),
  resetSession: () =>
    set({
      sessionId: null,
      currentExerciseIndex: 0,
      currentSet: 1,
      setLogs: [],
      restActive: false,
      restSecondsRemaining: 0,
    }),
}))
