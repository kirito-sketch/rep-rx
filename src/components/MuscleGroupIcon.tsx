/**
 * Clean SVG muscle group illustrations — replaces emoji fallbacks.
 * Each icon is a minimal silhouette with the primary muscle highlighted.
 */

type MuscleGroup =
  | 'chest'
  | 'back'
  | 'back-deltoids'
  | 'upper-back'
  | 'lower-back'
  | 'shoulders'
  | 'front-deltoids'
  | 'biceps'
  | 'triceps'
  | 'forearm'
  | 'quadriceps'
  | 'hamstring'
  | 'calves'
  | 'gluteal'
  | 'abs'
  | 'obliques'
  | 'trapezius'
  | 'neck'
  | 'adductor'
  | 'abductors'
  | null

interface Props {
  muscle: MuscleGroup
  size?: number
  accent?: string
  baseColor?: string
}

// Chest: front torso, pecs highlighted
function ChestSVG({ accent, base }: { accent: string; base: string }) {
  return (
    <svg viewBox="0 0 60 80" fill="none">
      {/* Torso outline */}
      <path d="M20 10 C18 10 14 14 14 20 L12 50 C12 56 16 62 22 64 L30 66 L38 64 C44 62 48 56 48 50 L46 20 C46 14 42 10 40 10 Z" stroke={base} strokeWidth="1.5" fill="white" />
      {/* Neck */}
      <path d="M26 10 L26 4 C26 2 28 1 30 1 C32 1 34 2 34 4 L34 10" stroke={base} strokeWidth="1.5" fill="white" />
      {/* Shoulders */}
      <path d="M14 18 C8 18 4 22 4 28 L4 32 C4 36 8 38 12 36 L14 34" stroke={base} strokeWidth="1.5" fill="white" />
      <path d="M46 18 C52 18 56 22 56 28 L56 32 C56 36 52 38 48 36 L46 34" stroke={base} strokeWidth="1.5" fill="white" />
      {/* Left pec — highlighted */}
      <path d="M16 22 C16 22 20 20 26 22 C28 26 27 32 24 34 C20 36 14 32 14 28 Z" fill={accent} opacity="0.85" />
      {/* Right pec — highlighted */}
      <path d="M44 22 C44 22 40 20 34 22 C32 26 33 32 36 34 C40 36 46 32 46 28 Z" fill={accent} opacity="0.85" />
      {/* Sternum line */}
      <path d="M30 20 L30 38" stroke="white" strokeWidth="1" opacity="0.6" />
      {/* Lower torso */}
      <path d="M20 50 L22 64" stroke={base} strokeWidth="1" />
      <path d="M40 50 L38 64" stroke={base} strokeWidth="1" />
    </svg>
  )
}

// Back: posterior torso, lats + upper back highlighted
function BackSVG({ accent, base }: { accent: string; base: string }) {
  return (
    <svg viewBox="0 0 60 80" fill="none">
      {/* Torso back */}
      <path d="M20 10 C18 10 14 14 14 20 L12 50 C12 56 16 62 22 64 L30 66 L38 64 C44 62 48 56 48 50 L46 20 C46 14 42 10 40 10 Z" stroke={base} strokeWidth="1.5" fill="white" />
      <path d="M26 10 L26 4 C26 2 28 1 30 1 C32 1 34 2 34 4 L34 10" stroke={base} strokeWidth="1.5" fill="white" />
      {/* Shoulders */}
      <path d="M14 18 C8 18 4 22 4 28 L4 32 C4 36 8 38 12 36 L14 34" stroke={base} strokeWidth="1.5" fill="white" />
      <path d="M46 18 C52 18 56 22 56 28 L56 32 C56 36 52 38 48 36 L46 34" stroke={base} strokeWidth="1.5" fill="white" />
      {/* Lats highlighted */}
      <path d="M14 26 C14 26 16 30 18 40 L22 48 C18 44 13 38 12 30 Z" fill={accent} opacity="0.85" />
      <path d="M46 26 C46 26 44 30 42 40 L38 48 C42 44 47 38 48 30 Z" fill={accent} opacity="0.85" />
      {/* Upper back */}
      <path d="M18 22 C22 20 28 19 30 19 C32 19 38 20 42 22 C40 28 36 30 30 30 C24 30 20 28 18 22 Z" fill={accent} opacity="0.7" />
      {/* Spine */}
      <path d="M30 19 L30 60" stroke="white" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

// Shoulders: deltoids
function ShoulderSVG({ accent, base }: { accent: string; base: string }) {
  return (
    <svg viewBox="0 0 60 80" fill="none">
      <path d="M22 18 C20 18 16 16 16 22 L16 44 C16 50 20 54 24 56 L30 58 L36 56 C40 54 44 50 44 44 L44 22 C44 16 40 18 38 18 Z" stroke={base} strokeWidth="1.5" fill="white" />
      <path d="M26 18 L26 12 C26 10 28 9 30 9 C32 9 34 10 34 12 L34 18" stroke={base} strokeWidth="1.5" fill="white" />
      {/* Left deltoid highlighted */}
      <path d="M16 18 C10 16 4 20 3 28 C3 34 8 38 14 36 C16 36 16 32 16 28 Z" fill={accent} opacity="0.9" />
      {/* Right deltoid highlighted */}
      <path d="M44 18 C50 16 56 20 57 28 C57 34 52 38 46 36 C44 36 44 32 44 28 Z" fill={accent} opacity="0.9" />
      {/* Top deltoid cap */}
      <path d="M18 18 C22 14 28 12 30 12 C32 12 38 14 42 18 C40 22 36 24 30 24 C24 24 20 22 18 18 Z" fill={accent} opacity="0.7" />
    </svg>
  )
}

// Biceps: arm, bicep highlighted
function BicepSVG({ accent, base }: { accent: string; base: string }) {
  return (
    <svg viewBox="0 0 40 90" fill="none">
      {/* Upper arm */}
      <path d="M10 10 C6 10 4 14 4 20 L4 40 C4 46 8 52 14 54 L20 56 L26 54 C32 52 36 46 36 40 L36 20 C36 14 34 10 30 10 Z" stroke={base} strokeWidth="1.5" fill="white" />
      {/* Bicep peak highlighted */}
      <path d="M6 20 C6 14 12 10 18 12 C22 14 24 18 22 24 C20 28 16 30 12 28 C8 26 6 24 6 20 Z" fill={accent} opacity="0.9" />
      {/* Forearm */}
      <path d="M8 54 C6 56 6 62 8 72 C10 78 14 82 20 83 C26 82 30 78 32 72 C34 62 34 56 32 54" stroke={base} strokeWidth="1.5" fill="white" />
      {/* Elbow bend */}
      <path d="M6 50 C4 48 4 44 6 42" stroke={base} strokeWidth="1" />
      <path d="M34 50 C36 48 36 44 34 42" stroke={base} strokeWidth="1" />
    </svg>
  )
}

// Triceps: back of arm
function TricepSVG({ accent, base }: { accent: string; base: string }) {
  return (
    <svg viewBox="0 0 40 90" fill="none">
      {/* Upper arm */}
      <path d="M10 10 C6 10 4 14 4 20 L4 40 C4 46 8 52 14 54 L20 56 L26 54 C32 52 36 46 36 40 L36 20 C36 14 34 10 30 10 Z" stroke={base} strokeWidth="1.5" fill="white" />
      {/* Tricep (back of arm) highlighted */}
      <path d="M10 16 C8 20 8 30 10 38 C12 44 16 50 20 52 C24 50 28 44 30 38 C32 30 32 20 30 16 C28 12 24 10 20 10 C16 10 12 12 10 16 Z" fill={accent} opacity="0.6" />
      {/* Outline override */}
      <path d="M10 10 C6 10 4 14 4 20 L4 40 C4 46 8 52 14 54 L20 56 L26 54 C32 52 36 46 36 40 L36 20 C36 14 34 10 30 10 Z" stroke={base} strokeWidth="1.5" fill="none" />
      {/* Forearm */}
      <path d="M8 54 C6 58 6 64 8 72 C10 78 14 82 20 83 C26 82 30 78 32 72 C34 64 34 58 32 54" stroke={base} strokeWidth="1.5" fill="white" />
    </svg>
  )
}

// Quads/Legs: front of legs highlighted
function QuadsSVG({ accent, base }: { accent: string; base: string }) {
  return (
    <svg viewBox="0 0 50 90" fill="none">
      {/* Left leg */}
      <path d="M8 5 C6 5 4 8 4 14 L6 50 C6 58 8 68 10 76 C12 82 16 86 20 87 C22 84 22 78 20 70 L18 50 L16 14 C14 8 12 5 10 5 Z" stroke={base} strokeWidth="1.5" fill="white" />
      {/* Left quad highlighted */}
      <path d="M8 8 C6 12 6 24 8 36 C10 44 14 50 18 52 L18 34 C17 22 14 12 10 8 Z" fill={accent} opacity="0.85" />
      {/* Right leg */}
      <path d="M42 5 C44 5 46 8 46 14 L44 50 C44 58 42 68 40 76 C38 82 34 86 30 87 C28 84 28 78 30 70 L32 50 L34 14 C36 8 38 5 40 5 Z" stroke={base} strokeWidth="1.5" fill="white" />
      {/* Right quad highlighted */}
      <path d="M42 8 C44 12 44 24 42 36 C40 44 36 50 32 52 L32 34 C33 22 36 12 40 8 Z" fill={accent} opacity="0.85" />
      {/* Hip join */}
      <path d="M10 5 C14 2 22 1 25 1 C28 1 36 2 40 5" stroke={base} strokeWidth="1.5" />
    </svg>
  )
}

// Hamstrings: back of legs
function HamstringSVG({ accent, base }: { accent: string; base: string }) {
  return (
    <svg viewBox="0 0 50 90" fill="none">
      {/* Left leg */}
      <path d="M8 5 C6 5 4 8 4 14 L6 50 C6 58 8 68 10 76 C12 82 16 86 20 87 C22 84 22 78 20 70 L18 50 L16 14 C14 8 12 5 10 5 Z" stroke={base} strokeWidth="1.5" fill="white" />
      {/* Left hamstring highlighted (back of thigh) */}
      <path d="M4 14 C4 22 6 36 10 46 L16 52 L18 36 C16 24 12 14 8 8 Z" fill={accent} opacity="0.8" />
      {/* Right leg */}
      <path d="M42 5 C44 5 46 8 46 14 L44 50 C44 58 42 68 40 76 C38 82 34 86 30 87 C28 84 28 78 30 70 L32 50 L34 14 C36 8 38 5 40 5 Z" stroke={base} strokeWidth="1.5" fill="white" />
      {/* Right hamstring */}
      <path d="M46 14 C46 22 44 36 40 46 L34 52 L32 36 C34 24 38 14 42 8 Z" fill={accent} opacity="0.8" />
      <path d="M10 5 C14 2 22 1 25 1 C28 1 36 2 40 5" stroke={base} strokeWidth="1.5" />
    </svg>
  )
}

// Glutes: posterior hip
function GluteSVG({ accent, base }: { accent: string; base: string }) {
  return (
    <svg viewBox="0 0 60 60" fill="none">
      {/* Hip/glute area top view */}
      <path d="M10 8 C6 8 3 14 3 22 C3 34 8 46 14 52 L20 56 L30 58 L40 56 L46 52 C52 46 57 34 57 22 C57 14 54 8 50 8 Z" stroke={base} strokeWidth="1.5" fill="white" />
      {/* Left glute highlighted */}
      <path d="M10 12 C6 16 4 24 6 34 C8 42 12 50 20 54 L24 52 C20 44 18 34 18 24 C16 16 14 10 10 12 Z" fill={accent} opacity="0.85" />
      {/* Right glute highlighted */}
      <path d="M50 12 C54 16 56 24 54 34 C52 42 48 50 40 54 L36 52 C40 44 42 34 42 24 C44 16 46 10 50 12 Z" fill={accent} opacity="0.85" />
      {/* Center crease */}
      <path d="M30 8 L30 58" stroke={base} strokeWidth="1" />
    </svg>
  )
}

// Abs/Core: front torso, abs grid highlighted
function AbsSVG({ accent, base }: { accent: string; base: string }) {
  return (
    <svg viewBox="0 0 40 80" fill="none">
      {/* Torso */}
      <path d="M8 10 C6 10 4 14 4 20 L4 50 C4 58 8 66 14 68 L20 70 L26 68 C32 66 36 58 36 50 L36 20 C36 14 34 10 32 10 Z" stroke={base} strokeWidth="1.5" fill="white" />
      {/* Neck */}
      <path d="M16 10 L16 4 L20 2 L24 2 L24 10" stroke={base} strokeWidth="1.5" fill="none" />
      {/* Abs grid - 3 rows x 2 cols */}
      <rect x="13" y="32" width="5" height="7" rx="1.5" fill={accent} opacity="0.85" />
      <rect x="22" y="32" width="5" height="7" rx="1.5" fill={accent} opacity="0.85" />
      <rect x="13" y="42" width="5" height="7" rx="1.5" fill={accent} opacity="0.85" />
      <rect x="22" y="42" width="5" height="7" rx="1.5" fill={accent} opacity="0.85" />
      <rect x="13" y="22" width="5" height="7" rx="1.5" fill={accent} opacity="0.7" />
      <rect x="22" y="22" width="5" height="7" rx="1.5" fill={accent} opacity="0.7" />
      <rect x="13" y="52" width="5" height="6" rx="1.5" fill={accent} opacity="0.6" />
      <rect x="22" y="52" width="5" height="6" rx="1.5" fill={accent} opacity="0.6" />
    </svg>
  )
}

// Calves: lower leg
function CalvesSVG({ accent, base }: { accent: string; base: string }) {
  return (
    <svg viewBox="0 0 40 80" fill="none">
      {/* Left lower leg */}
      <path d="M6 5 C4 5 2 8 2 14 L4 42 C4 52 6 62 8 70 C9 75 12 79 16 80 C18 77 18 72 16 64 L14 42 L12 14 C10 8 8 5 6 5 Z" stroke={base} strokeWidth="1.5" fill="white" />
      {/* Calf muscle bulge — highlighted */}
      <path d="M3 16 C2 22 2 32 4 40 C6 46 10 50 14 50 C14 40 12 28 8 18 Z" fill={accent} opacity="0.85" />
      {/* Right lower leg */}
      <path d="M34 5 C36 5 38 8 38 14 L36 42 C36 52 34 62 32 70 C31 75 28 79 24 80 C22 77 22 72 24 64 L26 42 L28 14 C30 8 32 5 34 5 Z" stroke={base} strokeWidth="1.5" fill="white" />
      <path d="M37 16 C38 22 38 32 36 40 C34 46 30 50 26 50 C26 40 28 28 32 18 Z" fill={accent} opacity="0.85" />
    </svg>
  )
}

// Traps: upper traps
function TrapSVG({ accent, base }: { accent: string; base: string }) {
  return (
    <svg viewBox="0 0 60 50" fill="none">
      {/* Upper back/shoulder area */}
      <path d="M10 10 C8 10 4 14 4 20 L4 40 C4 44 8 48 14 48 L30 50 L46 48 C52 48 56 44 56 40 L56 20 C56 14 52 10 50 10 Z" stroke={base} strokeWidth="1.5" fill="white" />
      <path d="M24 10 L24 4 C24 2 27 1 30 1 C33 1 36 2 36 4 L36 10" stroke={base} strokeWidth="1.5" fill="white" />
      {/* Left trap */}
      <path d="M10 10 C6 12 4 16 4 22 C4 28 8 32 14 32 L24 28 L24 10 C18 8 12 8 10 10 Z" fill={accent} opacity="0.85" />
      {/* Right trap */}
      <path d="M50 10 C54 12 56 16 56 22 C56 28 52 32 46 32 L36 28 L36 10 C42 8 48 8 50 10 Z" fill={accent} opacity="0.85" />
    </svg>
  )
}

// Forearm: lower arm
function ForearmSVG({ accent, base }: { accent: string; base: string }) {
  return (
    <svg viewBox="0 0 30 70" fill="none">
      <path d="M4 5 C2 5 1 8 1 14 L2 44 C2 54 4 62 8 68 C10 70 14 72 16 70 C18 70 20 68 22 66 C26 60 28 52 28 44 L29 14 C29 8 28 5 26 5 Z" stroke={base} strokeWidth="1.5" fill="white" />
      {/* Forearm muscles — highlighted */}
      <path d="M4 8 C2 12 2 22 4 34 C6 42 10 50 15 54 C20 50 24 42 26 34 C28 22 28 12 26 8 C22 6 16 5 15 5 C14 5 8 6 4 8 Z" fill={accent} opacity="0.7" />
      <path d="M4 5 C2 5 1 8 1 14 L2 44 C2 54 4 62 8 68 C10 70 14 72 16 70 C18 70 20 68 22 66 C26 60 28 52 28 44 L29 14 C29 8 28 5 26 5 Z" stroke={base} strokeWidth="1.5" fill="none" />
    </svg>
  )
}

// Generic full-body
function FullBodySVG({ accent, base }: { accent: string; base: string }) {
  return (
    <svg viewBox="0 0 40 90" fill="none">
      {/* Head */}
      <circle cx="20" cy="7" r="6" stroke={base} strokeWidth="1.5" fill="white" />
      {/* Torso */}
      <path d="M12 14 C10 14 8 18 8 24 L8 44 C8 50 12 56 16 58 L20 60 L24 58 C28 56 32 50 32 44 L32 24 C32 18 30 14 28 14 Z" stroke={base} strokeWidth="1.5" fill={accent} opacity="0.4" />
      {/* Left arm */}
      <path d="M8 18 C4 18 2 22 2 28 L2 42 C2 46 4 50 8 52 L10 50 L10 30 L12 18 Z" stroke={base} strokeWidth="1.5" fill={accent} opacity="0.4" />
      {/* Right arm */}
      <path d="M32 18 C36 18 38 22 38 28 L38 42 C38 46 36 50 32 52 L30 50 L30 30 L28 18 Z" stroke={base} strokeWidth="1.5" fill={accent} opacity="0.4" />
      {/* Left leg */}
      <path d="M12 60 L10 80 C10 84 12 88 16 89 C18 86 18 80 16 72 Z" stroke={base} strokeWidth="1.5" fill={accent} opacity="0.4" />
      {/* Right leg */}
      <path d="M28 60 L30 80 C30 84 28 88 24 89 C22 86 22 80 24 72 Z" stroke={base} strokeWidth="1.5" fill={accent} opacity="0.4" />
    </svg>
  )
}

function ObliqueSVG({ accent, base }: { accent: string; base: string }) {
  return (
    <svg viewBox="0 0 50 80" fill="none">
      <path d="M16 10 C12 10 8 14 8 20 L6 52 C6 60 10 68 18 70 L25 72 L32 70 C40 68 44 60 44 52 L42 20 C42 14 38 10 34 10 Z" stroke={base} strokeWidth="1.5" fill="white" />
      {/* Left oblique */}
      <path d="M8 24 C8 30 8 40 10 50 C12 56 16 62 20 64 L22 56 C20 46 18 36 16 26 C14 18 10 16 8 24 Z" fill={accent} opacity="0.85" />
      {/* Right oblique */}
      <path d="M42 24 C42 30 42 40 40 50 C38 56 34 62 30 64 L28 56 C30 46 32 36 34 26 C36 18 40 16 42 24 Z" fill={accent} opacity="0.85" />
      {/* Abs faint */}
      <rect x="20" y="30" width="4" height="6" rx="1" fill={base} opacity="0.2" />
      <rect x="26" y="30" width="4" height="6" rx="1" fill={base} opacity="0.2" />
    </svg>
  )
}

const ICON_MAP: Record<string, (props: { accent: string; base: string }) => JSX.Element> = {
  chest: ChestSVG,
  back: BackSVG,
  'back-deltoids': BackSVG,
  'upper-back': BackSVG,
  'lower-back': BackSVG,
  shoulders: ShoulderSVG,
  'front-deltoids': ShoulderSVG,
  biceps: BicepSVG,
  triceps: TricepSVG,
  forearm: ForearmSVG,
  quadriceps: QuadsSVG,
  hamstring: HamstringSVG,
  calves: CalvesSVG,
  gluteal: GluteSVG,
  abs: AbsSVG,
  obliques: ObliqueSVG,
  trapezius: TrapSVG,
  neck: TrapSVG,
  adductor: QuadsSVG,
  abductors: QuadsSVG,
}

export function MuscleGroupIcon({
  muscle,
  size = 80,
  accent = '#EA580C',
  baseColor = '#E3DDD4',
}: Props) {
  const Component = muscle ? (ICON_MAP[muscle] ?? FullBodySVG) : FullBodySVG
  return (
    <div style={{ width: size, height: size }} className="flex items-center justify-center">
      <Component accent={accent} base={baseColor} />
    </div>
  )
}

export function muscleFromName(exerciseName: string): MuscleGroup {
  const n = exerciseName.toLowerCase()
  if (/press|fly|flye|push.?up|dip|pec/.test(n)) return 'chest'
  if (/row|pull.?down|pull.?up|chin.?up|lat/.test(n)) return 'back-deltoids'
  if (/deadlift|back.?ext|hyper|erect/.test(n)) return 'lower-back'
  if (/squat|leg.?press|lunge|step.?up|leg.?ext/.test(n)) return 'quadriceps'
  if (/leg.?curl|hamstring|rdl|romanian/.test(n)) return 'hamstring'
  if (/hip.?thrust|glute|donkey/.test(n)) return 'gluteal'
  if (/calf.raise|calf|gastro/.test(n)) return 'calves'
  if (/curl|bicep|hammer/.test(n)) return 'biceps'
  if (/tricep|skull.?crush|push.?down/.test(n)) return 'triceps'
  if (/shoulder|lateral.raise|overhead/.test(n)) return 'front-deltoids'
  if (/shrug|trap/.test(n)) return 'trapezius'
  if (/crunch|sit.?up|plank|core/.test(n)) return 'abs'
  if (/oblique|twist/.test(n)) return 'obliques'
  if (/forearm|wrist/.test(n)) return 'forearm'
  return null
}
