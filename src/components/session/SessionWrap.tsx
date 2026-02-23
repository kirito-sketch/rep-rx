import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { groq } from '../../lib/groq'
import type { SetLog } from '../../store/sessionStore'

interface Props {
  sessionId: string
  setLogs: SetLog[]
  startedAt: Date
}

async function generateSessionNote(summary: {
  exerciseCount: number
  totalVolumeKg: number
  durationMins: number
  prs: number
}): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'user',
          content: `You are a terse fitness coach. In ONE sentence (max 15 words), give a sharp, specific observation about this workout. No filler like "Great job!". Be direct.

Session: ${summary.exerciseCount} exercises, ${Math.round(summary.totalVolumeKg)}kg total volume, ${summary.durationMins} minutes${summary.prs > 0 ? `, ${summary.prs} personal record${summary.prs > 1 ? 's' : ''}` : ''}.`,
        },
      ],
      temperature: 0.5,
      max_tokens: 40,
    })
    return response.choices[0].message.content?.trim() ?? ''
  } catch {
    return ''
  }
}

function StatBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex-1 rounded-xl p-3 text-center ${highlight ? 'bg-success-dim' : 'bg-bg-elevated'}`}>
      <p className={`tabular text-2xl font-extrabold ${highlight ? 'text-success' : 'text-text-primary'}`}>
        {value}
      </p>
      <p className={`text-[11px] font-medium mt-0.5 ${highlight ? 'text-success-text' : 'text-text-muted'}`}>
        {label}
      </p>
    </div>
  )
}

export function SessionWrap({ sessionId, setLogs, startedAt }: Props) {
  const navigate = useNavigate()
  const [aiNote, setAiNote] = useState<string | null>(null)
  const [summary, setSummary] = useState<{
    totalVolume: number
    durationMins: number
    exerciseCount: number
    prs: number
  } | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const endedAt = new Date()
    const durationMins = Math.max(
      1,
      Math.round((endedAt.getTime() - startedAt.getTime()) / 60000)
    )
    const totalVolume = setLogs.reduce((sum, s) => sum + s.weightKg * s.reps, 0)
    const uniqueExercises = new Set(setLogs.map((s) => s.exerciseId)).size
    const prs = setLogs.filter((s) => s.isPr).length

    setSummary({ totalVolume, durationMins, exerciseCount: uniqueExercises, prs })

    // Persist set logs
    const logsToInsert = setLogs.map((s) => ({
      session_id: sessionId,
      exercise_id: s.exerciseId,
      set_number: s.setNumber,
      weight_kg: s.weightKg,
      reps: s.reps,
    }))
    supabase.from('set_logs').insert(logsToInsert)

    // Update session record
    supabase
      .from('workout_sessions')
      .update({
        ended_at: endedAt.toISOString(),
        total_volume_kg: totalVolume,
        duration_mins: durationMins,
      })
      .eq('id', sessionId)

    // Generate AI note
    generateSessionNote({
      exerciseCount: uniqueExercises,
      totalVolumeKg: totalVolume,
      durationMins,
      prs,
    }).then((note) => {
      if (note) {
        setAiNote(note)
        supabase
          .from('workout_sessions')
          .update({ ai_note: note })
          .eq('id', sessionId)
      }
    })
  }, [])

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm flex flex-col gap-5"
      >
        {/* Header */}
        <div>
          <p className="text-accent text-[11px] font-bold uppercase tracking-widest mb-1">
            Session complete
          </p>
          <h2 className="text-text-primary text-4xl font-extrabold">Done.</h2>
        </div>

        {summary && (
          <>
            <div className="flex gap-2">
              <StatBox
                label="volume"
                value={`${Math.round(summary.totalVolume).toLocaleString()} kg`}
              />
              <StatBox label="duration" value={`${summary.durationMins} min`} />
              <StatBox label="exercises" value={`${summary.exerciseCount}`} />
            </div>

            {summary.prs > 0 && (
              <div className="bg-success-dim rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <p className="text-success-text text-sm font-bold">
                  {summary.prs} personal record{summary.prs > 1 ? 's' : ''} today
                </p>
              </div>
            )}
          </>
        )}

        {aiNote && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-card px-4 py-3 border-l-4 border-accent"
          >
            <p className="text-text-secondary text-sm italic leading-relaxed">{aiNote}</p>
          </motion.div>
        )}

        <button
          onClick={() => navigate('/')}
          className="w-full bg-accent text-white font-extrabold rounded-xl py-4 text-sm tracking-wide active:opacity-80 transition-opacity"
        >
          Back to Home
        </button>
      </motion.div>
    </div>
  )
}
