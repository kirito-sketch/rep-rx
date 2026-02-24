/**
 * Shared muscle name → react-body-highlighter Muscle ID resolution.
 * Used by ExerciseMediaCard, TodayCard, WeekPage.
 */
import type { Muscle } from 'react-body-highlighter'

export const MUSCLE_MAP: Record<string, Muscle> = {
  // Chest
  chest: 'chest', 'upper chest': 'chest', pectorals: 'chest',
  'pectoralis major': 'chest', 'pectoralis minor': 'chest', 'serratus anterior': 'chest',
  // Back
  lats: 'back-deltoids', latissimus: 'back-deltoids', 'latissimus dorsi': 'back-deltoids',
  'upper back': 'upper-back', 'lower back': 'lower-back', 'erector spinae': 'lower-back',
  rhomboids: 'upper-back', 'rear deltoid': 'back-deltoids', 'posterior deltoid': 'back-deltoids',
  infraspinatus: 'back-deltoids', 'teres major': 'back-deltoids', 'teres minor': 'back-deltoids',
  'levator scapulae': 'trapezius',
  // Shoulders
  shoulders: 'front-deltoids', delts: 'front-deltoids', deltoids: 'front-deltoids',
  deltoid: 'front-deltoids', 'anterior deltoid': 'front-deltoids', 'front deltoid': 'front-deltoids',
  'front deltoids': 'front-deltoids', 'lateral deltoid': 'front-deltoids', 'medial deltoid': 'front-deltoids',
  // Traps / neck
  traps: 'trapezius', trapezius: 'trapezius', neck: 'neck',
  // Arms
  biceps: 'biceps', 'biceps brachii': 'biceps', brachialis: 'biceps',
  brachioradialis: 'forearm', triceps: 'triceps', 'triceps brachii': 'triceps',
  forearms: 'forearm', forearm: 'forearm', 'wrist flexors': 'forearm', 'wrist extensors': 'forearm',
  // Core
  abs: 'abs', abdominals: 'abs', core: 'abs', obliques: 'obliques', oblique: 'obliques',
  'external oblique': 'obliques', 'internal oblique': 'obliques',
  'transverse abdominis': 'abs', 'rectus abdominis': 'abs',
  // Legs
  quads: 'quadriceps', quadriceps: 'quadriceps', quad: 'quadriceps',
  'rectus femoris': 'quadriceps', 'vastus lateralis': 'quadriceps', 'vastus medialis': 'quadriceps',
  hamstrings: 'hamstring', hamstring: 'hamstring', 'biceps femoris': 'hamstring',
  glutes: 'gluteal', gluteal: 'gluteal', gluteus: 'gluteal',
  'gluteus maximus': 'gluteal', 'gluteus medius': 'gluteal',
  calves: 'calves', calf: 'calves', gastrocnemius: 'calves', soleus: 'left-soleus',
  'hip flexors': 'quadriceps', adductors: 'adductor', adductor: 'adductor',
  abductors: 'abductors', abductor: 'abductors',
}

const NAME_MUSCLE_PATTERNS: Array<[RegExp, Muscle]> = [
  [/press|fly|flye|push.?up|dip|pec/i, 'chest'],
  [/row|pull.?down|pull.?up|chin.?up|lat/i, 'back-deltoids'],
  [/deadlift|back.?ext|hyper|erect/i, 'lower-back'],
  [/squat|leg.?press|lunge|step.?up|leg.?ext/i, 'quadriceps'],
  [/leg.?curl|hamstring|rdl|romanian/i, 'hamstring'],
  [/hip.?thrust|glute|donkey/i, 'gluteal'],
  [/calf.raise|calf|gastro/i, 'calves'],
  [/curl|bicep|hammer/i, 'biceps'],
  [/tricep|skull.?crush|push.?down/i, 'triceps'],
  [/shoulder|lateral.raise|overhead/i, 'front-deltoids'],
  [/shrug|trap/i, 'trapezius'],
  [/crunch|sit.?up|plank|core/i, 'abs'],
  [/oblique|twist/i, 'obliques'],
  [/forearm|wrist/i, 'forearm'],
]

export function mapMuscle(name: string): Muscle | null {
  return MUSCLE_MAP[name.toLowerCase()] ?? null
}

export function muscleFromExerciseName(exerciseName: string): Muscle | null {
  for (const [pattern, muscle] of NAME_MUSCLE_PATTERNS) {
    if (pattern.test(exerciseName)) return muscle
  }
  return null
}

/** Resolve a muscle group string + exercise name fallback → Muscle ID */
export function resolveMuscle(muscleGroupStr: string | null, exerciseName: string): Muscle | null {
  return (muscleGroupStr ? mapMuscle(muscleGroupStr) : null) ?? muscleFromExerciseName(exerciseName)
}

/** Deduplicate and filter null from a Muscle[] */
export function uniqueMuscles(muscles: (Muscle | null)[]): Muscle[] {
  const seen = new Set<Muscle>()
  const result: Muscle[] = []
  for (const m of muscles) {
    if (m && !seen.has(m)) { seen.add(m); result.push(m) }
  }
  return result
}
