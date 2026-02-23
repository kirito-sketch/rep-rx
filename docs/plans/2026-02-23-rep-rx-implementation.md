# Rep Rx Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build Rep Rx — a high-performance PWA fitness tracker that replaces trainer cognitive load, generates AI-powered programs, and provides a frictionless gym session logging experience with exercise anatomy visuals.

**Architecture:** Vite + React SPA deployed as a PWA. Supabase handles auth, Postgres DB, and Edge Functions. Groq Cloud (Llama 3) powers program generation and session notes. ExerciseDB API provides GIFs; `react-body-highlighter` renders muscle anatomy SVGs.

**Tech Stack:** React 18, Vite, Tailwind CSS v3, Framer Motion, Supabase JS v2, Groq SDK, ExerciseDB API (via RapidAPI), react-body-highlighter, Zustand (client state), React Router v6, Workbox (PWA/SW)

---

## Prerequisites

Before starting, set up accounts and collect keys:
1. [Supabase](https://supabase.com) — create project, get `SUPABASE_URL` + `SUPABASE_ANON_KEY`
2. [RapidAPI / ExerciseDB](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb) — get `RAPIDAPI_KEY`
3. [Groq Cloud](https://console.groq.com) — get `GROQ_API_KEY`

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- Create: `.env.example`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`

**Step 1: Scaffold Vite + React + TS project**

```bash
npm create vite@latest . -- --template react-ts
npm install
```

**Step 2: Install all dependencies**

```bash
npm install @supabase/supabase-js groq-sdk framer-motion zustand react-router-dom react-body-highlighter
npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa
npx tailwindcss init -p
```

**Step 3: Configure Tailwind — replace `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base:     '#020617',
          surface:  '#0f172a',
          elevated: '#1e293b',
        },
        border: {
          DEFAULT: '#1e293b',
          subtle:  '#0f172a',
        },
        accent: {
          DEFAULT: '#f97316',
          dim:     '#431407',
          text:    '#fdba74',
        },
        text: {
          primary:   '#f8fafc',
          secondary: '#94a3b8',
          muted:     '#475569',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
      },
    },
  },
  plugins: [],
} satisfies Config
```

**Step 4: Set up `src/index.css` — design tokens + base styles**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { background-color: #020617; color: #f8fafc; }
  body { font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
  * { box-sizing: border-box; }
  /* Tabular numbers for all numeric displays */
  .tabular { font-variant-numeric: tabular-nums; font-family: 'JetBrains Mono', monospace; }
}
```

**Step 5: Create `.env.example`**

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GROQ_API_KEY=
VITE_RAPIDAPI_KEY=
```

Copy to `.env.local` and fill in your keys.

**Step 6: Configure `vite.config.ts` with PWA plugin**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Rep Rx',
        short_name: 'Rep Rx',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*exercisedb.*/,
            handler: 'CacheFirst',
            options: { cacheName: 'exercise-gifs', expiration: { maxEntries: 200, maxAgeSeconds: 604800 } },
          },
        ],
      },
    }),
  ],
})
```

**Step 7: Verify dev server starts**

```bash
npm run dev
```
Expected: Vite dev server running at `http://localhost:5173`

**Step 8: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold vite+react+ts project with tailwind and PWA config"
```

---

## Task 2: Supabase — Database Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `src/lib/supabase.ts`

**Step 1: Install Supabase CLI**

```bash
npm install -g supabase
supabase init
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

**Step 2: Create migration file `supabase/migrations/001_initial_schema.sql`**

```sql
-- Profiles
CREATE TABLE profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name  text,
  goal          text CHECK (goal IN ('strength','muscle','fat_loss','general')),
  days_per_week int CHECK (days_per_week BETWEEN 1 AND 7),
  gym_type      text CHECK (gym_type IN ('commercial','home','limited')),
  weight_unit   text DEFAULT 'kg' CHECK (weight_unit IN ('kg','lbs')),
  onboarded     boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

-- Injuries
CREATE TABLE injuries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id) ON DELETE CASCADE,
  body_part       text NOT NULL,
  pain_scale      int CHECK (pain_scale BETWEEN 1 AND 10),
  avoid_movements text[],
  active          boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

-- Exercise library (populated from ExerciseDB cache)
CREATE TABLE exercises (
  id                      text PRIMARY KEY,
  name                    text NOT NULL,
  muscle_group_primary    text,
  muscle_group_secondary  text[],
  equipment               text,
  gif_url                 text,
  instructions            text[],
  injury_contraindications text[],
  cached_at               timestamptz DEFAULT now()
);

-- Programs
CREATE TABLE programs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name         text,
  week_count   int DEFAULT 4,
  active       boolean DEFAULT true,
  generated_by text DEFAULT 'groq-llama3-70b',
  created_at   timestamptz DEFAULT now()
);

-- Workout templates (days within a program)
CREATE TABLE workout_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id  uuid REFERENCES programs(id) ON DELETE CASCADE,
  day_of_week int CHECK (day_of_week BETWEEN 1 AND 7),
  label       text,
  order_index int
);

-- Exercises within a template
CREATE TABLE template_exercises (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id           uuid REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_id           text REFERENCES exercises(id),
  target_sets           int,
  target_reps_min       int,
  target_reps_max       int,
  target_weight         numeric,
  rest_seconds          int DEFAULT 90,
  order_index           int,
  injury_substitute_for uuid REFERENCES template_exercises(id)
);

-- Workout sessions (actual logged workouts)
CREATE TABLE workout_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id) ON DELETE CASCADE,
  template_id     uuid REFERENCES workout_templates(id),
  started_at      timestamptz DEFAULT now(),
  ended_at        timestamptz,
  total_volume_kg numeric,
  duration_mins   int,
  ai_note         text
);

-- Individual set logs
CREATE TABLE set_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id text REFERENCES exercises(id),
  set_number  int,
  weight_kg   numeric,
  reps        int,
  is_pr       boolean DEFAULT false,
  logged_at   timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE injuries ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "own injuries" ON injuries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own programs" ON programs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own sessions" ON workout_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own set logs" ON set_logs FOR ALL USING (
  session_id IN (SELECT id FROM workout_sessions WHERE user_id = auth.uid())
);
CREATE POLICY "own template exercises" ON template_exercises FOR ALL USING (
  template_id IN (
    SELECT wt.id FROM workout_templates wt
    JOIN programs p ON wt.program_id = p.id
    WHERE p.user_id = auth.uid()
  )
);
CREATE POLICY "own workout templates" ON workout_templates FOR ALL USING (
  program_id IN (SELECT id FROM programs WHERE user_id = auth.uid())
);
CREATE POLICY "public exercises read" ON exercises FOR SELECT USING (true);

-- PR detection trigger
CREATE OR REPLACE FUNCTION check_pr()
RETURNS TRIGGER AS $$
DECLARE
  prev_max numeric;
BEGIN
  SELECT MAX(weight_kg) INTO prev_max
  FROM set_logs sl
  JOIN workout_sessions ws ON sl.session_id = ws.id
  WHERE ws.user_id = (SELECT user_id FROM workout_sessions WHERE id = NEW.session_id)
    AND sl.exercise_id = NEW.exercise_id
    AND sl.session_id != NEW.session_id;

  IF prev_max IS NULL OR NEW.weight_kg > prev_max THEN
    NEW.is_pr := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_pr_flag
BEFORE INSERT ON set_logs
FOR EACH ROW EXECUTE FUNCTION check_pr();
```

**Step 3: Apply migration**

```bash
supabase db push
```
Expected: Migration applied, tables visible in Supabase dashboard.

**Step 4: Create `src/lib/supabase.ts`**

```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: supabase schema with RLS and PR trigger"
```

---

## Task 3: Auth Flow

**Files:**
- Create: `src/pages/AuthPage.tsx`
- Create: `src/store/authStore.ts`
- Modify: `src/App.tsx`

**Step 1: Create Zustand auth store `src/store/authStore.ts`**

```ts
import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },
}))
```

**Step 2: Create `src/pages/AuthPage.tsx`**

```tsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'

export function AuthPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-text-primary mb-1">Rep Rx</h1>
        <p className="text-text-muted text-sm mb-8">Built for you. Not for everyone.</p>

        {sent ? (
          <p className="text-text-secondary text-sm border border-border rounded-md p-4">
            Check your email — magic link sent to <span className="text-text-primary">{email}</span>
          </p>
        ) : (
          <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full bg-bg-surface border border-border rounded-md px-4 py-3 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white font-semibold rounded-md py-3 text-sm disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Continue with Email'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
```

**Step 3: Wire auth listener in `src/App.tsx`**

```tsx
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
import { AuthPage } from './pages/AuthPage'
import { Dashboard } from './pages/Dashboard'
import { OnboardingFlow } from './pages/OnboardingFlow'

export default function App() {
  const { user, loading, setUser } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div className="min-h-screen bg-bg-base" />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
        <Route path="/onboarding" element={user ? <OnboardingFlow /> : <Navigate to="/auth" />} />
        <Route path="/*" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  )
}
```

**Step 4: Verify auth renders correctly**

```bash
npm run dev
```
Navigate to `http://localhost:5173` — should redirect to `/auth`. Enter an email — should show "Check your email" state.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: magic link auth with zustand store and route guards"
```

---

## Task 4: Onboarding Flow — AI Interview

**Files:**
- Create: `src/pages/OnboardingFlow.tsx`
- Create: `src/components/onboarding/GoalStep.tsx`
- Create: `src/components/onboarding/FrequencyStep.tsx`
- Create: `src/components/onboarding/EquipmentStep.tsx`
- Create: `src/components/onboarding/InjuryStep.tsx`
- Create: `src/components/onboarding/ExperienceStep.tsx`
- Create: `src/store/onboardingStore.ts`

**Step 1: Create onboarding store `src/store/onboardingStore.ts`**

```ts
import { create } from 'zustand'

export interface OnboardingData {
  goal: string
  daysPerWeek: number
  gymType: string
  injuries: { bodyPart: string; painScale: number; avoidMovements: string[] }[]
  experienceNote: string
}

interface OnboardingState {
  step: number
  data: Partial<OnboardingData>
  nextStep: () => void
  prevStep: () => void
  updateData: (patch: Partial<OnboardingData>) => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 0,
  data: {},
  nextStep: () => set((s) => ({ step: s.step + 1 })),
  prevStep: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
  updateData: (patch) => set((s) => ({ data: { ...s.data, ...patch } })),
}))
```

**Step 2: Create `src/pages/OnboardingFlow.tsx`**

```tsx
import { AnimatePresence, motion } from 'framer-motion'
import { useOnboardingStore } from '../store/onboardingStore'
import { GoalStep } from '../components/onboarding/GoalStep'
import { FrequencyStep } from '../components/onboarding/FrequencyStep'
import { EquipmentStep } from '../components/onboarding/EquipmentStep'
import { InjuryStep } from '../components/onboarding/InjuryStep'
import { ExperienceStep } from '../components/onboarding/ExperienceStep'
import { ProgramGeneratingStep } from '../components/onboarding/ProgramGeneratingStep'

const STEPS = [GoalStep, FrequencyStep, EquipmentStep, InjuryStep, ExperienceStep, ProgramGeneratingStep]

export function OnboardingFlow() {
  const { step } = useOnboardingStore()
  const StepComponent = STEPS[step]

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

      <div className="flex-1 flex flex-col px-6 pt-12 pb-8">
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
```

**Step 3: Create `src/components/onboarding/GoalStep.tsx` (representative pattern — repeat for other steps)**

```tsx
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

      <div className="flex flex-col gap-3 mt-2">
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
            <span className="text-text-muted">→</span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

**Step 4: Create `src/components/onboarding/InjuryStep.tsx` — critical for user context**

```tsx
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
  const { updateData, nextStep } = useOnboardingStore()
  const [selected, setSelected] = useState<string[]>(['left_shoulder', 'left_hip'])
  const [painScale, setPainScale] = useState<Record<string, number>>({
    left_shoulder: 5,
    left_hip: 4,
  })

  const toggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const handleNext = () => {
    const injuries = selected.map((bodyPart) => ({
      bodyPart,
      painScale: painScale[bodyPart] ?? 5,
      avoidMovements: [],  // AI will populate during program generation
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
                {active && <span className="text-accent-text text-xs">Active</span>}
              </button>

              {active && (
                <div className="px-4 py-2 bg-bg-elevated border border-border border-t-0 rounded-b-md">
                  <p className="text-text-muted text-xs mb-2">Pain level: {painScale[injury.value] ?? 5}/10</p>
                  <input
                    type="range" min={1} max={10}
                    value={painScale[injury.value] ?? 5}
                    onChange={(e) => setPainScale((p) => ({ ...p, [injury.value]: +e.target.value }))}
                    className="w-full accent-orange-500"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={handleNext}
        className="w-full bg-accent text-white font-semibold rounded-md py-4 text-sm mt-auto"
      >
        Continue →
      </button>
    </div>
  )
}
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: onboarding flow with 5-step interview and injury declaration"
```

---

## Task 5: Groq Program Generation

**Files:**
- Create: `src/lib/groq.ts`
- Create: `src/lib/generateProgram.ts`
- Create: `src/components/onboarding/ProgramGeneratingStep.tsx`

**Step 1: Create `src/lib/groq.ts`**

```ts
import Groq from 'groq-sdk'

export const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,  // OK for MVP; move to Edge Function for production
})
```

**Step 2: Create `src/lib/generateProgram.ts` — the core AI prompt**

```ts
import { groq } from './groq'
import type { OnboardingData } from '../store/onboardingStore'

export async function generateProgram(data: OnboardingData): Promise<GeneratedProgram> {
  const injuryContext = data.injuries.length > 0
    ? data.injuries.map(i =>
        `${i.bodyPart.replace('_', ' ')} injury (pain ${i.painScale}/10)`
      ).join(', ')
    : 'no injuries'

  const prompt = `You are an expert strength and conditioning coach. Generate a personalized 4-week workout program in JSON format.

USER PROFILE:
- Goal: ${data.goal}
- Available days per week: ${data.daysPerWeek}
- Equipment: ${data.gymType} gym
- Injuries: ${injuryContext}
- Experience: 4 months, trainer-led, no independent program knowledge

INJURY SAFETY RULES (CRITICAL):
- Left shoulder injury: AVOID overhead press, upright row, lateral raises behind plane, behind-the-neck press
- Left hip injury: AVOID deep squats past 90°, full range hip hinges, high-impact lunges
- For any active injury, provide a SAFER ALTERNATIVE exercise that works adjacent muscles

Return ONLY valid JSON matching this exact schema:
{
  "name": "program name",
  "weekCount": 4,
  "split": [
    {
      "dayOfWeek": 1,
      "label": "Push — Chest / Shoulders / Triceps",
      "exercises": [
        {
          "name": "Bench Press",
          "sets": 3,
          "repsMin": 8,
          "repsMax": 12,
          "startingWeightKg": 60,
          "restSeconds": 90,
          "injuryNote": null
        }
      ]
    }
  ]
}`

  const response = await groq.chat.completions.create({
    model: 'llama3-70b-8192',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  })

  return JSON.parse(response.choices[0].message.content!) as GeneratedProgram
}

export interface GeneratedProgram {
  name: string
  weekCount: number
  split: {
    dayOfWeek: number
    label: string
    exercises: {
      name: string
      sets: number
      repsMin: number
      repsMax: number
      startingWeightKg: number
      restSeconds: number
      injuryNote: string | null
    }[]
  }[]
}
```

**Step 3: Create `src/components/onboarding/ProgramGeneratingStep.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useOnboardingStore } from '../../store/onboardingStore'
import { generateProgram } from '../../lib/generateProgram'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

const GENERATING_STEPS = [
  'Analyzing your goals...',
  'Mapping injury constraints...',
  'Selecting exercises...',
  'Building your 4-week split...',
  'Finalizing program...',
]

export function ProgramGeneratingStep() {
  const { data } = useOnboardingStore()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((s) => Math.min(s + 1, GENERATING_STEPS.length - 1))
    }, 1200)

    generateProgram(data as any)
      .then(async (program) => {
        clearInterval(interval)
        // Save program to Supabase
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Upsert profile
        await supabase.from('profiles').upsert({
          id: user.id,
          goal: data.goal,
          days_per_week: data.daysPerWeek,
          gym_type: data.gymType,
          onboarded: true,
        })

        // Save injuries
        if (data.injuries?.length) {
          await supabase.from('injuries').insert(
            data.injuries.map((i) => ({ user_id: user.id, ...i }))
          )
        }

        // Save program
        const { data: prog } = await supabase.from('programs').insert({
          user_id: user.id,
          name: program.name,
          week_count: program.weekCount,
          active: true,
        }).select().single()

        // Save workout templates + exercises
        for (const day of program.split) {
          const { data: tmpl } = await supabase.from('workout_templates').insert({
            program_id: prog!.id,
            day_of_week: day.dayOfWeek,
            label: day.label,
            order_index: day.dayOfWeek,
          }).select().single()

          await supabase.from('template_exercises').insert(
            day.exercises.map((ex, i) => ({
              template_id: tmpl!.id,
              exercise_id: ex.name.toLowerCase().replace(/\s+/g, '-'),
              target_sets: ex.sets,
              target_reps_min: ex.repsMin,
              target_reps_max: ex.repsMax,
              target_weight: ex.startingWeightKg,
              rest_seconds: ex.restSeconds,
              order_index: i,
            }))
          )
        }

        navigate('/')
      })
      .catch((err) => {
        clearInterval(interval)
        setError('Failed to generate program. Please try again.')
        console.error(err)
      })

    return () => clearInterval(interval)
  }, [])

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="text-accent text-sm">Try again</button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-2 border-bg-elevated border-t-accent rounded-full"
      />
      <div className="text-center">
        <p className="text-text-primary font-medium">Building your program</p>
        <motion.p
          key={currentStep}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-text-muted text-sm mt-1"
        >
          {GENERATING_STEPS[currentStep]}
        </motion.p>
      </div>
    </div>
  )
}
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: groq program generation with injury-aware prompt and supabase persistence"
```

---

## Task 6: Dashboard

**Files:**
- Create: `src/pages/Dashboard.tsx`
- Create: `src/components/TodayCard.tsx`
- Create: `src/components/WeekStrip.tsx`

**Step 1: Create `src/pages/Dashboard.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { TodayCard } from '../components/TodayCard'
import { WeekStrip } from '../components/WeekStrip'
import { useAuthStore } from '../store/authStore'

export function Dashboard() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [todayTemplate, setTodayTemplate] = useState<any>(null)

  useEffect(() => {
    if (!user) return

    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => {
        if (!data?.onboarded) navigate('/onboarding')
        else setProfile(data)
      })

    // Detect today's workout
    const today = new Date().getDay() || 7  // 1=Mon, 7=Sun
    supabase
      .from('workout_templates')
      .select('*, workout_sessions(*), template_exercises(*, exercises(*))')
      .eq('day_of_week', today)
      .order('order_index', { referencedTable: 'template_exercises' })
      .single()
      .then(({ data }) => setTodayTemplate(data))
  }, [user])

  return (
    <div className="min-h-screen bg-bg-base">
      <header className="flex items-center justify-between px-6 pt-12 pb-6">
        <div>
          <h1 className="text-text-primary font-semibold text-lg">Rep Rx</h1>
          <p className="text-text-muted text-xs">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={signOut} className="text-text-muted text-xs">Sign out</button>
      </header>

      <main className="px-6 flex flex-col gap-4">
        <WeekStrip />
        {todayTemplate ? (
          <TodayCard template={todayTemplate} />
        ) : (
          <div className="bg-bg-surface border border-border rounded-md px-6 py-8 text-center">
            <p className="text-text-secondary text-sm">Rest day. Recovery is training.</p>
          </div>
        )}
      </main>
    </div>
  )
}
```

**Step 2: Create `src/components/TodayCard.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export function TodayCard({ template }: { template: any }) {
  const navigate = useNavigate()
  const exerciseCount = template.template_exercises?.length ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-surface border border-border rounded-md p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-accent-text text-xs font-medium uppercase tracking-widest mb-1">Today</p>
          <h2 className="text-text-primary font-semibold text-lg">{template.label}</h2>
          <p className="text-text-muted text-xs mt-1">{exerciseCount} exercises</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        {template.template_exercises?.slice(0, 4).map((te: any) => (
          <div key={te.id} className="flex items-center justify-between">
            <span className="text-text-secondary text-sm">{te.exercises?.name ?? te.exercise_id}</span>
            <span className="text-text-muted text-xs tabular">
              {te.target_sets}×{te.target_reps_min}–{te.target_reps_max}
            </span>
          </div>
        ))}
        {exerciseCount > 4 && (
          <p className="text-text-muted text-xs">+{exerciseCount - 4} more</p>
        )}
      </div>

      <button
        onClick={() => navigate(`/session/${template.id}`)}
        className="w-full bg-accent text-white font-semibold rounded-md py-4 text-sm"
      >
        Start Session →
      </button>
    </motion.div>
  )
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: dashboard with auto-detected today session and week strip"
```

---

## Task 7: Active Session — Exercise View with Media

**Files:**
- Create: `src/pages/SessionPage.tsx`
- Create: `src/components/session/ExerciseMediaCard.tsx`
- Create: `src/components/session/SetLogger.tsx`
- Create: `src/components/session/RestTimer.tsx`
- Create: `src/store/sessionStore.ts`

**Step 1: Create session store `src/store/sessionStore.ts`**

```ts
import { create } from 'zustand'

interface SetLog { exerciseId: string; setNumber: number; weightKg: number; reps: number }

interface SessionState {
  sessionId: string | null
  currentExerciseIndex: number
  currentSet: number
  setLogs: SetLog[]
  restActive: boolean
  restSecondsRemaining: number
  setSessionId: (id: string) => void
  logSet: (log: SetLog) => void
  startRest: (seconds: number) => void
  tickRest: () => void
  nextExercise: () => void
  dismissRest: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  currentExerciseIndex: 0,
  currentSet: 1,
  setLogs: [],
  restActive: false,
  restSecondsRemaining: 0,
  setSessionId: (id) => set({ sessionId: id }),
  logSet: (log) => set((s) => ({
    setLogs: [...s.setLogs, log],
    currentSet: s.currentSet + 1,
    restActive: true,
  })),
  startRest: (seconds) => set({ restActive: true, restSecondsRemaining: seconds }),
  tickRest: () => set((s) => {
    if (s.restSecondsRemaining <= 1) return { restActive: false, restSecondsRemaining: 0 }
    return { restSecondsRemaining: s.restSecondsRemaining - 1 }
  }),
  nextExercise: () => set((s) => ({
    currentExerciseIndex: s.currentExerciseIndex + 1,
    currentSet: 1,
    restActive: false,
  })),
  dismissRest: () => set({ restActive: false }),
}))
```

**Step 2: Create `src/components/session/ExerciseMediaCard.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Model from 'react-body-highlighter'

interface Props {
  exerciseName: string
  gifUrl: string | null
  primaryMuscle: string
  secondaryMuscles: string[]
  isNewExercise: boolean
}

// Map ExerciseDB muscle names to react-body-highlighter muscle IDs
const MUSCLE_MAP: Record<string, string> = {
  'chest': 'chest',
  'upper chest': 'chest',
  'lats': 'back-deltoids',
  'biceps': 'biceps',
  'triceps': 'triceps',
  'shoulders': 'front-deltoids',
  'delts': 'front-deltoids',
  'quads': 'quadriceps',
  'hamstrings': 'hamstring',
  'glutes': 'gluteal',
  'calves': 'calves',
  'abs': 'abs',
  'traps': 'trapezius',
}

export function ExerciseMediaCard({ exerciseName, gifUrl, primaryMuscle, secondaryMuscles, isNewExercise }: Props) {
  const [expanded, setExpanded] = useState(isNewExercise)

  useEffect(() => {
    if (isNewExercise) {
      setExpanded(true)
      const timer = setTimeout(() => setExpanded(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [isNewExercise, exerciseName])

  const primaryId = MUSCLE_MAP[primaryMuscle.toLowerCase()] ?? 'chest'
  const secondaryIds = secondaryMuscles.map(m => MUSCLE_MAP[m.toLowerCase()]).filter(Boolean)

  const muscleData = [
    { name: exerciseName, muscles: [primaryId, ...secondaryIds] }
  ]

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="expanded"
            initial={{ height: 64 }}
            animate={{ height: '45vw' }}
            exit={{ height: 64 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative overflow-hidden bg-bg-elevated cursor-pointer"
            onClick={() => setExpanded(false)}
          >
            <div className="flex h-full">
              {/* Anatomy SVG */}
              <div className="w-1/2 h-full flex items-center justify-center p-3">
                <Model
                  data={muscleData}
                  style={{ width: '100%', height: '100%' }}
                  highlightedColors={['#f97316', '#fb923c']}
                />
              </div>

              {/* Exercise GIF */}
              <div className="w-1/2 h-full flex items-center justify-center p-3 bg-bg-base">
                {gifUrl ? (
                  <img
                    src={gifUrl}
                    alt={exerciseName}
                    className="w-full h-full object-contain rounded"
                  />
                ) : (
                  <div className="text-text-muted text-xs text-center">No demo available</div>
                )}
              </div>
            </div>

            {/* Auto-collapse hint */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center">
              <span className="text-text-muted text-xs bg-bg-base/80 px-2 py-1 rounded">Tap to collapse</span>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            onClick={() => setExpanded(true)}
            className="w-full h-16 flex items-center gap-3 px-4 bg-bg-elevated"
          >
            {gifUrl && (
              <img src={gifUrl} alt="" className="h-10 w-10 object-contain rounded" />
            )}
            <div className="flex-1 text-left">
              <p className="text-text-primary text-sm font-medium">{exerciseName}</p>
              <p className="text-text-muted text-xs">{primaryMuscle} · Tap to view</p>
            </div>
            <span className="text-text-muted text-xs">▲</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
```

**Step 3: Create `src/components/session/SetLogger.tsx`**

```tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSessionStore } from '../../store/sessionStore'

interface Props {
  exerciseId: string
  targetSets: number
  targetRepsMin: number
  targetRepsMax: number
  targetWeight: number
  restSeconds: number
  previousSets?: { weightKg: number; reps: number }[]
}

export function SetLogger({ exerciseId, targetSets, targetRepsMin, targetRepsMax, targetWeight, restSeconds, previousSets }: Props) {
  const { currentSet, logSet, startRest } = useSessionStore()
  const [weight, setWeight] = useState(targetWeight)
  const [reps, setReps] = useState(targetRepsMax)
  const [confirmed, setConfirmed] = useState(false)

  const handleLog = () => {
    logSet({ exerciseId, setNumber: currentSet, weightKg: weight, reps })
    startRest(restSeconds)
    setConfirmed(true)
    setTimeout(() => setConfirmed(false), 300)
  }

  const Stepper = ({ value, onChange, step, suffix }: { value: number; onChange: (v: number) => void; step: number; suffix: string }) => (
    <div className="flex flex-col items-center gap-1">
      <p className="text-text-muted text-xs uppercase tracking-wider">{suffix}</p>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onChange(Math.max(0, value - step))}
          className="w-14 h-14 bg-bg-elevated border border-border rounded-md text-text-primary text-xl font-light flex items-center justify-center"
        >
          −
        </button>
        <span className="tabular text-3xl font-bold text-text-primary w-20 text-center">{value}</span>
        <button
          onClick={() => onChange(value + step)}
          className="w-14 h-14 bg-bg-elevated border border-border rounded-md text-text-primary text-xl font-light flex items-center justify-center"
        >
          +
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Set indicator */}
      <div className="flex items-center gap-2">
        {Array.from({ length: targetSets }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < currentSet - 1 ? 'bg-accent' : i === currentSet - 1 ? 'bg-accent/50' : 'bg-bg-elevated'}`}
          />
        ))}
        <span className="text-text-muted text-xs ml-1">Set {currentSet}/{targetSets}</span>
      </div>

      {/* Previous session reference */}
      {previousSets && previousSets[currentSet - 1] && (
        <p className="text-text-muted text-xs text-center">
          Last time: <span className="tabular text-text-secondary">{previousSets[currentSet - 1].weightKg}kg × {previousSets[currentSet - 1].reps}</span>
        </p>
      )}

      {/* Target */}
      <p className="text-text-muted text-xs text-center">
        Target: <span className="text-text-secondary">{targetRepsMin}–{targetRepsMax} reps</span>
      </p>

      {/* Steppers */}
      <Stepper value={weight} onChange={setWeight} step={2.5} suffix="kg" />
      <Stepper value={reps} onChange={setReps} step={1} suffix="reps" />

      {/* LOG SET */}
      <motion.button
        onClick={handleLog}
        animate={confirmed ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-full bg-accent text-white font-semibold rounded-md py-5 text-base"
      >
        Log Set
      </motion.button>
    </div>
  )
}
```

**Step 4: Create `src/components/session/RestTimer.tsx`**

```tsx
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSessionStore } from '../../store/sessionStore'

export function RestTimer() {
  const { restActive, restSecondsRemaining, tickRest, dismissRest } = useSessionStore()

  useEffect(() => {
    if (!restActive) return
    const interval = setInterval(tickRest, 1000)
    return () => clearInterval(interval)
  }, [restActive])

  return (
    <AnimatePresence>
      {restActive && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-border px-6 pt-4 pb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wider">Rest</p>
              <p className="tabular text-5xl font-bold text-text-primary mt-1">
                {String(Math.floor(restSecondsRemaining / 60)).padStart(1, '0')}:
                {String(restSecondsRemaining % 60).padStart(2, '0')}
              </p>
            </div>
            <button
              onClick={dismissRest}
              className="bg-bg-elevated border border-border rounded-md px-5 py-3 text-text-secondary text-sm"
            >
              Skip rest
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-bg-elevated mt-4 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent"
              initial={{ width: '100%' }}
              animate={{ width: `${(restSecondsRemaining / 90) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: exercise media card with auto-expand/collapse, set logger, rest timer"
```

---

## Task 8: Session Page — Full Assembly

**Files:**
- Create: `src/pages/SessionPage.tsx`
- Create: `src/components/session/SessionWrap.tsx`

**Step 1: Create `src/pages/SessionPage.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSessionStore } from '../store/sessionStore'
import { ExerciseMediaCard } from '../components/session/ExerciseMediaCard'
import { SetLogger } from '../components/session/SetLogger'
import { RestTimer } from '../components/session/RestTimer'
import { SessionWrap } from '../components/session/SessionWrap'
import { useAuthStore } from '../store/authStore'

export function SessionPage() {
  const { templateId } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { currentExerciseIndex, currentSet, setLogs, setSessionId, nextExercise } = useSessionStore()
  const [template, setTemplate] = useState<any>(null)
  const [sessionId, _setSessionId] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [prevSessionSets, setPrevSessionSets] = useState<any>({})

  useEffect(() => {
    if (!templateId || !user) return

    // Load template with exercises
    supabase
      .from('workout_templates')
      .select('*, template_exercises(*, exercises(*))')
      .eq('id', templateId)
      .order('order_index', { referencedTable: 'template_exercises' })
      .single()
      .then(({ data }) => setTemplate(data))

    // Create session record
    supabase.from('workout_sessions').insert({
      user_id: user.id,
      template_id: templateId,
    }).select().single().then(({ data }) => {
      if (data) { _setSessionId(data.id); setSessionId(data.id) }
    })
  }, [templateId, user])

  const exercises = template?.template_exercises ?? []
  const currentExercise = exercises[currentExerciseIndex]
  const isLastExercise = currentExerciseIndex >= exercises.length - 1
  const isLastSet = currentSet > (currentExercise?.target_sets ?? 3)

  const handleNextExercise = () => {
    if (isLastExercise) setDone(true)
    else nextExercise()
  }

  if (!template) return <div className="min-h-screen bg-bg-base" />
  if (done && sessionId) return <SessionWrap sessionId={sessionId} setLogs={setLogs} />

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-12 pb-4">
        <button onClick={() => navigate('/')} className="text-text-muted text-sm">← Exit</button>
        <p className="text-text-secondary text-sm">
          {currentExerciseIndex + 1} / {exercises.length}
        </p>
      </header>

      <main className="flex-1 flex flex-col px-6 gap-5 pb-32">
        {/* Exercise name */}
        <div>
          <h2 className="text-text-primary font-semibold text-lg">
            {currentExercise?.exercises?.name ?? currentExercise?.exercise_id}
          </h2>
          {currentExercise?.exercises?.muscle_group_primary && (
            <p className="text-text-muted text-xs mt-0.5">
              {currentExercise.exercises.muscle_group_primary}
            </p>
          )}
        </div>

        {/* Media card */}
        <ExerciseMediaCard
          exerciseName={currentExercise?.exercises?.name ?? ''}
          gifUrl={currentExercise?.exercises?.gif_url ?? null}
          primaryMuscle={currentExercise?.exercises?.muscle_group_primary ?? 'chest'}
          secondaryMuscles={currentExercise?.exercises?.muscle_group_secondary ?? []}
          isNewExercise={true}
        />

        {/* Set logger or next exercise */}
        {isLastSet ? (
          <button
            onClick={handleNextExercise}
            className="w-full bg-accent text-white font-semibold rounded-md py-5 text-base"
          >
            {isLastExercise ? 'Finish Session →' : 'Next Exercise →'}
          </button>
        ) : (
          <SetLogger
            exerciseId={currentExercise?.exercise_id}
            targetSets={currentExercise?.target_sets ?? 3}
            targetRepsMin={currentExercise?.target_reps_min ?? 8}
            targetRepsMax={currentExercise?.target_reps_max ?? 12}
            targetWeight={currentExercise?.target_weight ?? 20}
            restSeconds={currentExercise?.rest_seconds ?? 90}
          />
        )}
      </main>

      <RestTimer />
    </div>
  )
}
```

**Step 2: Add route in `App.tsx`**

```tsx
// Add to Routes:
<Route path="/session/:templateId" element={user ? <SessionPage /> : <Navigate to="/auth" />} />
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: full session page assembling media card, set logger, rest timer"
```

---

## Task 9: Session Wrap + AI Note

**Files:**
- Create: `src/components/session/SessionWrap.tsx`
- Create: `src/lib/generateSessionNote.ts`

**Step 1: Create `src/lib/generateSessionNote.ts`**

```ts
import { groq } from './groq'

export async function generateSessionNote(summary: {
  exerciseCount: number
  totalVolumeKg: number
  durationMins: number
  prs: string[]
}): Promise<string> {
  const prompt = `You are a terse fitness coach. In ONE sentence (max 15 words), give a notable observation about this workout session. Be specific, not generic. No filler phrases like "Great job!".

Session: ${summary.exerciseCount} exercises, ${summary.totalVolumeKg}kg total volume, ${summary.durationMins} minutes${summary.prs.length ? `, PRs: ${summary.prs.join(', ')}` : ''}`

  const response = await groq.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 40,
  })

  return response.choices[0].message.content?.trim() ?? ''
}
```

**Step 2: Create `src/components/session/SessionWrap.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { generateSessionNote } from '../../lib/generateSessionNote'

interface Props { sessionId: string; setLogs: any[] }

export function SessionWrap({ sessionId, setLogs }: Props) {
  const navigate = useNavigate()
  const [aiNote, setAiNote] = useState<string | null>(null)
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    const endedAt = new Date()
    const totalVolume = setLogs.reduce((sum, s) => sum + s.weightKg * s.reps, 0)
    const prs = setLogs.filter((s) => s.is_pr).map((s) => s.exerciseId)

    // Persist set logs
    supabase.from('set_logs').insert(
      setLogs.map((s) => ({
        session_id: sessionId,
        exercise_id: s.exerciseId,
        set_number: s.setNumber,
        weight_kg: s.weightKg,
        reps: s.reps,
      }))
    )

    // Update session record
    const durationMins = Math.round((endedAt.getTime() - Date.now()) / 60000) + 1
    supabase.from('workout_sessions').update({
      ended_at: endedAt.toISOString(),
      total_volume_kg: totalVolume,
      duration_mins: durationMins,
    }).eq('id', sessionId)

    setSummary({ totalVolume, prs, durationMins, exerciseCount: new Set(setLogs.map(s => s.exerciseId)).size })

    generateSessionNote({
      exerciseCount: new Set(setLogs.map(s => s.exerciseId)).size,
      totalVolumeKg: totalVolume,
      durationMins,
      prs,
    }).then((note) => {
      setAiNote(note)
      supabase.from('workout_sessions').update({ ai_note: note }).eq('id', sessionId)
    })
  }, [])

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm flex flex-col gap-6"
      >
        <div>
          <p className="text-accent-text text-xs uppercase tracking-widest mb-1">Session complete</p>
          <h2 className="text-text-primary text-2xl font-bold">Done.</h2>
        </div>

        {summary && (
          <div className="bg-bg-surface border border-border rounded-md divide-y divide-border">
            <div className="flex justify-between px-4 py-3">
              <span className="text-text-muted text-sm">Volume</span>
              <span className="tabular text-text-primary text-sm font-semibold">{summary.totalVolume}kg</span>
            </div>
            <div className="flex justify-between px-4 py-3">
              <span className="text-text-muted text-sm">Duration</span>
              <span className="tabular text-text-primary text-sm font-semibold">{summary.durationMins}m</span>
            </div>
            <div className="flex justify-between px-4 py-3">
              <span className="text-text-muted text-sm">Exercises</span>
              <span className="tabular text-text-primary text-sm font-semibold">{summary.exerciseCount}</span>
            </div>
            {summary.prs.length > 0 && (
              <div className="px-4 py-3">
                <span className="text-green-400 text-sm font-semibold">🏆 PR on {summary.prs.length} exercise{summary.prs.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        )}

        {aiNote && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-text-secondary text-sm border-l-2 border-accent pl-4"
          >
            {aiNote}
          </motion.p>
        )}

        <button
          onClick={() => navigate('/')}
          className="w-full bg-accent text-white font-semibold rounded-md py-4 text-sm"
        >
          Back to Dashboard
        </button>
      </motion.div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: session wrap with volume stats, PR detection, and groq session note"
```

---

## Task 10: ExerciseDB Cache + Exercise Lookup

**Files:**
- Create: `src/lib/exerciseDb.ts`
- Create: `supabase/functions/cache-exercises/index.ts`

**Step 1: Create `src/lib/exerciseDb.ts`**

```ts
import { supabase } from './supabase'

export async function getExerciseByName(name: string) {
  // Check cache first
  const { data } = await supabase
    .from('exercises')
    .select('*')
    .ilike('name', name)
    .single()

  if (data) return data

  // Fetch from ExerciseDB and cache
  const response = await fetch(
    `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(name)}`,
    {
      headers: {
        'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
      },
    }
  )

  const exercises = await response.json()
  if (!exercises.length) return null

  const ex = exercises[0]
  const mapped = {
    id: ex.id,
    name: ex.name,
    muscle_group_primary: ex.target,
    muscle_group_secondary: ex.secondaryMuscles,
    equipment: ex.equipment,
    gif_url: ex.gifUrl,
    instructions: ex.instructions,
    injury_contraindications: [],
  }

  await supabase.from('exercises').upsert(mapped)
  return mapped
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: exercisedb lookup with supabase cache fallback"
```

---

## Task 11: Final Polish + PWA Install Prompt

**Files:**
- Modify: `src/pages/Dashboard.tsx`
- Create: `src/components/InstallPrompt.tsx`
- Create: `public/icon-192.png`, `public/icon-512.png` (use a placeholder for now)

**Step 1: Create `src/components/InstallPrompt.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setPrompt(e); setVisible(true) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-border px-6 pt-4 pb-8 flex items-center justify-between"
        >
          <div>
            <p className="text-text-primary text-sm font-medium">Add to Home Screen</p>
            <p className="text-text-muted text-xs">Fast access, offline support</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setVisible(false)} className="text-text-muted text-sm px-3 py-2">Later</button>
            <button onClick={install} className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-md">Install</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

**Step 2: Final build verification**

```bash
npm run build
npm run preview
```
Expected: Production build runs at `http://localhost:4173`, PWA manifest loads, app installs on mobile.

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: PWA install prompt and production build verification"
```

---

## Environment Variables Summary

```
VITE_SUPABASE_URL          — from Supabase dashboard > Settings > API
VITE_SUPABASE_ANON_KEY     — from Supabase dashboard > Settings > API
VITE_GROQ_API_KEY          — from console.groq.com > API Keys
VITE_RAPIDAPI_KEY          — from rapidapi.com > My Apps > exercisedb subscription
```

---

## Implementation Order Summary

| Task | Description | Est. commits |
|---|---|---|
| 1 | Project scaffold | 1 |
| 2 | Supabase schema + RLS | 1 |
| 3 | Auth flow | 1 |
| 4 | Onboarding interview | 1 |
| 5 | Groq program generation | 1 |
| 6 | Dashboard | 1 |
| 7 | Exercise media + set logger + rest timer | 1 |
| 8 | Session page assembly | 1 |
| 9 | Session wrap + AI note | 1 |
| 10 | ExerciseDB cache | 1 |
| 11 | PWA install + final build | 1 |

---

*End of Implementation Plan v1.0*
