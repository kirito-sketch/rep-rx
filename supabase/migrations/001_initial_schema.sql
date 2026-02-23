-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
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
CREATE TABLE IF NOT EXISTS injuries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id) ON DELETE CASCADE,
  body_part       text NOT NULL,
  pain_scale      int CHECK (pain_scale BETWEEN 1 AND 10),
  avoid_movements text[],
  active          boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

-- Exercise library (populated from ExerciseDB cache)
CREATE TABLE IF NOT EXISTS exercises (
  id                       text PRIMARY KEY,
  name                     text NOT NULL,
  muscle_group_primary     text,
  muscle_group_secondary   text[],
  equipment                text,
  gif_url                  text,
  instructions             text[],
  injury_contraindications text[],
  cached_at                timestamptz DEFAULT now()
);

-- Programs
CREATE TABLE IF NOT EXISTS programs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name         text,
  week_count   int DEFAULT 4,
  active       boolean DEFAULT true,
  generated_by text DEFAULT 'groq-llama3',
  created_at   timestamptz DEFAULT now()
);

-- Workout templates (days within a program)
CREATE TABLE IF NOT EXISTS workout_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id  uuid REFERENCES programs(id) ON DELETE CASCADE,
  day_of_week int CHECK (day_of_week BETWEEN 1 AND 7),
  label       text,
  order_index int
);

-- Exercises within a template
CREATE TABLE IF NOT EXISTS template_exercises (
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
CREATE TABLE IF NOT EXISTS workout_sessions (
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
CREATE TABLE IF NOT EXISTS set_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id text REFERENCES exercises(id),
  set_number  int,
  weight_kg   numeric,
  reps        int,
  is_pr       boolean DEFAULT false,
  logged_at   timestamptz DEFAULT now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE injuries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises         ENABLE ROW LEVEL SECURITY;

-- ─── Policies ─────────────────────────────────────────────────────────────────
CREATE POLICY "own profile"    ON profiles    FOR ALL USING (auth.uid() = id);
CREATE POLICY "own injuries"   ON injuries    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own programs"   ON programs    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own sessions"   ON workout_sessions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "own set logs"   ON set_logs    FOR ALL USING (
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

-- Exercises: anyone authenticated can read; any authenticated user can upsert (cache)
CREATE POLICY "public exercises read"   ON exercises FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated exercises write" ON exercises FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated exercises upsert" ON exercises FOR UPDATE USING (auth.role() = 'authenticated');

-- ─── PR detection trigger ─────────────────────────────────────────────────────
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

CREATE OR REPLACE TRIGGER set_pr_flag
BEFORE INSERT ON set_logs
FOR EACH ROW EXECUTE FUNCTION check_pr();
