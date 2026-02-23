-- ─── Drop existing policies (safe if they don't exist) ───────────────────────
DROP POLICY IF EXISTS "own profile"    ON profiles;
DROP POLICY IF EXISTS "own injuries"   ON injuries;
DROP POLICY IF EXISTS "own programs"   ON programs;
DROP POLICY IF EXISTS "own sessions"   ON workout_sessions;
DROP POLICY IF EXISTS "own set logs"   ON set_logs;
DROP POLICY IF EXISTS "own template exercises" ON template_exercises;
DROP POLICY IF EXISTS "own workout templates"  ON workout_templates;
DROP POLICY IF EXISTS "public exercises read"  ON exercises;
DROP POLICY IF EXISTS "authenticated exercises write"  ON exercises;
DROP POLICY IF EXISTS "authenticated exercises upsert" ON exercises;

-- ─── Re-create policies ────────────────────────────────────────────────────────
CREATE POLICY "own profile"    ON profiles    FOR ALL USING (auth.uid() = id);
CREATE POLICY "own injuries"   ON injuries    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own programs"   ON programs    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own sessions"   ON workout_sessions FOR ALL USING (auth.uid() = user_id);

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

-- Exercises: any authenticated user (including anonymous) can read + write (for caching)
CREATE POLICY "public exercises read"          ON exercises FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated exercises write"  ON exercises FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated exercises upsert" ON exercises FOR UPDATE USING (auth.role() = 'authenticated');
