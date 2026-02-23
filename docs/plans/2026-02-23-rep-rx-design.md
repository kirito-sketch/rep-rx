# Rep Rx — Full Design Specification
**Date:** 2026-02-23
**Architect:** Senior Product Designer + Full-Stack Engineer
**Status:** Awaiting approval before implementation

---

## 0. Context & North Star

**User:** 4 months training, trainer-led (no program literacy), left shoulder + left hip injuries actively healing.
**Core problem:** Trainer carried all cognitive load. User needs an app that replaces that load — knowing what to do, when to do it, how heavy, how long to rest — without being a chatbot that slows them down mid-lift.
**Design principle:** AI decides everything upfront and in the background. The session UI is a pure speed tool. AI speaks only when it earns the right to.

---

## 1. User Flows

### 1.1 The Onboarding Loop

```
App Install
  └── Welcome Screen ("Built for you. Not for everyone.")
        └── Auth (Magic Link / Google SSO)
              └── AI Interview — 5 screens, one question each
                    ├── Q1: Primary goal (strength / muscle / fat loss / general fitness)
                    ├── Q2: Days per week available
                    ├── Q3: Equipment audit (commercial gym / home / limited)
                    ├── Q4: Injury declaration → "Left shoulder, left hip — pain scale 1-10, movements to avoid"
                    └── Q5: Experience framing → "Trainer-led 4 months, no program knowledge"
                          └── Groq Llama 3 70B: Generate 4-week program
                                └── Program Preview (weekly split, exercises, injury substitutions flagged in orange)
                                      ├── [Adjust] → AI refine loop (max 2 rounds)
                                      └── [Confirm] → Dashboard
```

### 1.2 The Active Session

```
Dashboard (auto-detects today's session from weekly split)
  └── Session Start Screen
        · Day label (e.g., "Push — Chest / Shoulders / Triceps")
        · Exercise count + estimated duration
        · [Begin] CTA
              └── Exercise View (per exercise)
                    · Exercise name + target: 3×10 @ 60kg
                    · MEDIA: Auto-plays full-screen for 5s on first visit to this exercise
                          → Anatomy diagram (targeted muscle highlighted, red primary / orange secondary)
                          → Technique GIF / video loop
                          → Collapses to thumbnail strip after 5s (or on tap)
                    · Injury flag check: if movement hits flagged joint → swap suggestion banner
                    · Set Logger (big hit targets):
                          [Weight −] [Weight display] [Weight +]
                          [Reps −]   [Reps display]   [Reps +]
                          [LOG SET] — full-width, primary action
                    · Set history strip: previous session's sets shown as reference
                    · Rest Timer: auto-starts after LOG SET, shows countdown
                          → Dismissible with one tap
                          → Ambient pulse animation (non-distracting)
                    · After all sets complete → [Next Exercise] or [Finish Session]

              └── Session Wrap Screen
                    · Total volume (kg lifted)
                    · Duration
                    · PRs hit (highlighted)
                    · AI Nudge: 1 sentence max, only if something notable
                          e.g., "You hit a PR on bench. Volume is up 12% this week."
                    · [Done] → Dashboard
```

### 1.3 The Weekly Review

```
Dashboard → Review Tab
  └── Weekly Volume Chart (bar, per muscle group)
  └── PR Timeline (personal records set this week)
  └── AI Weekly Note (3 bullets max):
        · What improved
        · What to watch (injury proximity, volume spikes)
        · Next week adjustment
  └── [Accept Adjustments] → program updated silently
  └── [Keep Current] → no change
```

---

## 2. Exercise Media Strategy

### Source
- **Exercise GIFs + metadata:** [ExerciseDB API](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb) — GIF per exercise, `bodyPart`, `target`, `secondaryMuscles` fields.
- **Anatomy overlays:** [`react-body-highlighter`](https://github.com/chr-ge/react-body-highlighter) — MIT licensed, drop-in React component. Front/back SVG body map with named muscle regions highlighted via props. Zero custom SVG work. Primary muscle = orange-500, secondary = orange-400 at 50% opacity.
- **Fallback:** If ExerciseDB GIF unavailable, show static anatomy SVG only with written instructions.

### Behavior on Exercise Load
1. Exercise card appears → media auto-expands full-screen (or 80vh card).
2. GIF loops + anatomy SVG shows highlighted muscles.
3. After 5 seconds OR on any user tap → media collapses to a 64px thumbnail strip pinned to top of exercise card.
4. Thumbnail tap → re-expands on demand.
5. On subsequent sets of same exercise → media stays collapsed (user already saw it).

### Data stored per exercise
```
exercise_id, name, muscle_group_primary, muscle_group_secondary[],
gif_url, video_url, instructions[], equipment_required,
injury_contraindications[]  ← populated by AI during program generation
```

---

## 3. Database Schema (Supabase / Postgres)

### 3.1 Users & Profile
```sql
-- Core auth handled by Supabase Auth (auth.users)

profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users,
  display_name    text,
  goal            text,          -- 'strength' | 'muscle' | 'fat_loss' | 'general'
  days_per_week   int,
  gym_type        text,          -- 'commercial' | 'home' | 'limited'
  created_at      timestamptz DEFAULT now()
)

injuries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id),
  body_part       text,          -- 'left_shoulder' | 'left_hip' etc.
  pain_scale      int,           -- 1-10
  avoid_movements text[],        -- ['overhead_press', 'lateral_raise']
  active          boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
)
```

### 3.2 Programs & Splits
```sql
programs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id),
  name            text,          -- e.g., "4-Week Push/Pull/Legs"
  generated_by    text DEFAULT 'groq-llama3-70b',
  week_count      int,
  active          boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
)

workout_templates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id      uuid REFERENCES programs(id),
  day_of_week     int,           -- 1=Mon ... 7=Sun
  label           text,          -- 'Push — Chest / Shoulders / Triceps'
  order_index     int
)

template_exercises (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id     uuid REFERENCES workout_templates(id),
  exercise_id     text,          -- foreign key to exercises lookup table
  target_sets     int,
  target_reps_min int,
  target_reps_max int,
  target_weight   numeric,       -- kg, AI-suggested starting weight
  rest_seconds    int DEFAULT 90,
  order_index     int,
  injury_substitute_for uuid REFERENCES template_exercises(id) -- if this was swapped
)
```

### 3.3 Exercise Library
```sql
exercises (
  id                      text PRIMARY KEY,  -- from ExerciseDB
  name                    text,
  muscle_group_primary    text,
  muscle_group_secondary  text[],
  equipment               text,
  gif_url                 text,
  instructions            text[],
  injury_contraindications text[]
)
```

### 3.4 Session Logs
```sql
workout_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id),
  template_id     uuid REFERENCES workout_templates(id),
  started_at      timestamptz DEFAULT now(),
  ended_at        timestamptz,
  total_volume_kg numeric,       -- computed on session end
  duration_mins   int,           -- computed on session end
  ai_note         text           -- 1-sentence Groq summary
)

set_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      uuid REFERENCES workout_sessions(id),
  exercise_id     text REFERENCES exercises(id),
  set_number      int,
  weight_kg       numeric,
  reps            int,
  is_pr           boolean DEFAULT false,  -- computed on insert
  logged_at       timestamptz DEFAULT now()
)
```

### 3.5 Row Level Security (RLS)
```sql
-- All tables: users can only SELECT/INSERT/UPDATE their own rows
-- profiles: user can read/write own row
-- set_logs, workout_sessions: user_id must match auth.uid()
-- exercises: public read, no write from client
```

---

## 4. Design Tokens

### 4.1 Color Palette

```
-- Base surfaces
--color-bg-base:      #020617   /* slate-950 — app background */
--color-bg-surface:   #0f172a   /* slate-900 — cards, panels */
--color-bg-elevated:  #1e293b   /* slate-800 — modals, tooltips */
--color-border:       #1e293b   /* slate-800 — 1px borders */
--color-border-subtle:#0f172a   /* slate-900 — dividers within cards */

-- Text
--color-text-primary:  #f8fafc  /* slate-50 */
--color-text-secondary:#94a3b8  /* slate-400 */
--color-text-muted:    #475569  /* slate-600 */

-- Accent — Safety Orange (gym-native, high visibility on dark)
--color-accent:        #f97316  /* orange-500 */
--color-accent-dim:    #431407  /* orange-950 — accent bg fills */
--color-accent-text:   #fdba74  /* orange-300 — accent text on dark */

-- Semantic
--color-success:       #22c55e  /* green-500 — PRs, completion */
--color-warning:       #eab308  /* yellow-500 — injury warnings */
--color-danger:        #ef4444  /* red-500 — skip/fail states */

-- Muscle anatomy SVG
--color-muscle-primary:   #f97316  /* orange-500 */
--color-muscle-secondary: #fb923c  /* orange-400 at 50% opacity */
--color-muscle-inactive:  #1e293b  /* slate-800 */
```

### 4.2 Typography

```
Font stack:   'Geist', 'Inter', system-ui, sans-serif
Mono stack:   'Geist Mono', 'JetBrains Mono', monospace
              ↳ All weights/reps/kg values use mono for tabular alignment

Scale (rem, base 16px):
  --text-xs:    0.75rem   / 12px  — set history, timestamps
  --text-sm:    0.875rem  / 14px  — labels, secondary info
  --text-base:  1rem      / 16px  — body, instructions
  --text-lg:    1.125rem  / 18px  — exercise name
  --text-xl:    1.25rem   / 20px  — section headers
  --text-2xl:   1.5rem    / 24px  — weight/reps display (MONO)
  --text-4xl:   2.25rem   / 36px  — rest timer countdown (MONO)
  --text-7xl:   4.5rem    / 72px  — PR celebration number

Weight scale:
  400 — body text
  500 — labels, secondary headings
  600 — exercise names, card titles
  700 — weight/reps numbers, CTAs
```

### 4.3 Spacing (4px base grid)

```
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px   ← component internal padding
--space-5:   20px
--space-6:   24px   ← card padding
--space-8:   32px   ← section gap
--space-12:  48px   ← page vertical rhythm
--space-16:  64px   ← large section separation
```

### 4.4 Component Tokens

```
-- Cards / containers
--radius-sm:    6px
--radius-md:    10px
--radius-lg:    14px
border:         1px solid var(--color-border)
shadow:         0 1px 3px rgba(0,0,0,0.4)   ← subtle, not decorative

-- Hit targets (thumb-zone law)
--hit-target-min:     48px   ← smallest interactive element
--hit-target-primary: 64px   ← LOG SET button height
--hit-target-stepper: 56px   ← weight/rep ± buttons

-- Rest timer
--timer-size:   200px   ← circular progress, centered
--timer-font:   var(--text-4xl) + mono

-- Media card
--media-expanded-height:  80vh
--media-collapsed-height: 64px
--media-transition:       300ms ease-out
```

### 4.5 Motion Principles

```
Philosophy: purposeful, never decorative. Motion communicates state change.

Transitions:
  --duration-fast:    150ms   ← micro interactions (tap feedback)
  --duration-normal:  250ms   ← panel transitions, toasts
  --duration-slow:    400ms   ← media expand/collapse, screen transitions
  --easing-default:   cubic-bezier(0.4, 0, 0.2, 1)  ← material standard
  --easing-snap:      cubic-bezier(0.34, 1.56, 0.64, 1)  ← set log confirmation pop

Framer Motion usage:
  · Media auto-expand → AnimatePresence height: 0 → 80vh
  · LOG SET confirmation → scale 1 → 1.04 → 1 (snap easing, 150ms)
  · Rest timer → circular SVG stroke-dashoffset animation
  · PR celebration → confetti burst + number scale-up (one-shot)
  · Screen transitions → x-axis slide (next exercise: slide left)
  · AI nudge toast → slide up from bottom, auto-dismiss 4s
```

---

## 5. Thumb-Zone Interaction Map

```
Phone screen (375px wide reference):

┌─────────────────────────┐  ← Status bar
│  ← Back    Exercise 2/6 │  ← Secondary nav (top, one-hand reachable)
│  Bench Press             │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │  MEDIA STRIP (64px) │ │  ← Thumbnail after auto-collapse
│ │  [GIF] Chest · Tri  │ │  ← Tap to re-expand
│ └─────────────────────┘ │
│                          │
│  Target: 3 sets × 10    │  ← Reference text (sm, muted)
│  Last session: 60kg × 9 │  ← Previous data (sm, secondary)
│                          │
├─────────────────────────┤
│  SET 2 of 3              │
│                          │
│  ┌──────┐   ┌──────┐    │
│  │  −   │   │  +   │    │  ← 56px hit target
│  └──────┘   └──────┘    │
│       65 kg              │  ← 36px mono, center
│                          │
│  ┌──────┐   ┌──────┐    │
│  │  −   │   │  +   │    │  ← 56px hit target
│  └──────┘   └──────┘    │
│        10 reps           │  ← 36px mono, center
│                          │
├─────────────────────────┤
│                          │
│  ┌─────────────────────┐ │
│  │      LOG SET        │ │  ← 64px height, full width, accent bg
│  └─────────────────────┘ │
│                          │
└─────────────────────────┘  ← Home indicator
```

Everything primary (weight adjust, rep adjust, LOG SET) lives in the bottom 60% of the screen — natural thumb reach zone. Navigation and context live at the top where accidental taps are less costly.

---

## 6. AI Integration Points

| Trigger | Model | Action | Max latency |
|---|---|---|---|
| Onboarding complete | Llama 3 70B | Generate full 4-week program | async, show loader |
| Program confirmed | Llama 3 70B | Pre-compute injury substitutions for all exercises | background |
| Session end | Llama 3 8B | Generate 1-sentence session note | <2s |
| Weekly review | Llama 3 70B | Generate 3-bullet adjustment note | async |
| Injury flag triggered | Llama 3 8B | Suggest exercise swap inline | <1s |
| Progressive overload | Edge Function (no AI) | Auto-increment weight when 3×target reps hit | instant |

---

## 7. PWA Requirements

```
manifest.json:
  display: standalone
  theme_color: #020617
  background_color: #020617
  orientation: portrait

Service Worker:
  · Cache exercise GIFs for current week's program (offline-first)
  · Cache exercise library data
  · Queue set logs when offline → sync on reconnect

Install prompt:
  · Triggered after first completed session
  · "Add to Home Screen" — bottom sheet, dismissible
```

---

## 8. Open Questions for Implementation Phase

1. **ExerciseDB API** — free tier limits. Need to cache all exercise data to Supabase on program generation, not call on every session.
2. **Anatomy SVG** — build custom or license? Recommend building a single front/back SVG with muscle group IDs that can be styled via CSS classes. One-time effort, full control.
3. **Weight unit preference** — kg vs lbs. Store in kg always, display in user preference. Add to profile.
4. **Left shoulder / left hip specifics** — during onboarding AI needs to be prompted with a specific list of contraindicated movements (overhead press, upright row, lateral raise for shoulder; squats, hip hinges at deep range for hip). This prompt engineering is critical and needs its own spec during implementation.

---

*End of Design Specification v1.0*
