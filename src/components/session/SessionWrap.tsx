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

    setSummary({
      totalVolume,
      durationMins,
      exerciseCount: uniqueExercises,
      prs,
    })

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
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm flex flex-col gap-6"
      >
        <div>
          <p className="text-accent-text text-xs uppercase tracking-widest mb-1">
            Session complete
          </p>
          <h2 className="text-text-primary text-3xl font-bold">Done.</h2>
        </div>

        {summary && (
          <div className="bg-bg-surface border border-border rounded-md overflow-hidden">
            <div className="flex justify-between px-4 py-3 border-b border-border">
              <span className="text-text-muted text-sm">Volume</span>
              <span className="tabular text-text-primary text-sm font-semibold">
                {Math.round(summary.totalVolume)} kg
              </span>
            </div>
            <div className="flex justify-between px-4 py-3 border-b border-border">
              <span className="text-text-muted text-sm">Duration</span>
              <span className="tabular text-text-primary text-sm font-semibold">
                {summary.durationMins} min
              </span>
            </div>
            <div className="flex justify-between px-4 py-3 border-b border-border">
              <span className="text-text-muted text-sm">Exercises</span>
              <span className="tabular text-text-primary text-sm font-semibold">
                {summary.exerciseCount}
              </span>
            </div>
            {summary.prs > 0 && (
              <div className="px-4 py-3">
                <span className="text-green-400 text-sm font-semibold">
                  PR on {summary.prs} exercise{summary.prs > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        )}

        {aiNote && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-text-secondary text-sm border-l-2 border-accent pl-4 italic"
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
