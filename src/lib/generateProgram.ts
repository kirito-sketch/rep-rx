import { groq } from './groq'
import type { OnboardingData } from '../store/onboardingStore'

export interface GeneratedExercise {
  name: string
  sets: number
  repsMin: number
  repsMax: number
  startingWeightKg: number
  restSeconds: number
  injuryNote: string | null
}

export interface GeneratedDay {
  dayOfWeek: number
  label: string
  exercises: GeneratedExercise[]
}

export interface GeneratedProgram {
  name: string
  weekCount: number
  split: GeneratedDay[]
}

export async function generateProgram(data: OnboardingData): Promise<GeneratedProgram> {
  const injuryContext =
    data.injuries && data.injuries.length > 0
      ? data.injuries
          .map((i) => `${i.bodyPart.replace(/_/g, ' ')} injury (pain ${i.painScale}/10)`)
          .join(', ')
      : 'no injuries'

  const prompt = `You are an expert strength and conditioning coach. Generate a personalized 4-week workout program in JSON format.

USER PROFILE:
- Goal: ${data.goal}
- Available days per week: ${data.daysPerWeek}
- Equipment: ${data.gymType} gym
- Injuries: ${injuryContext}
- Experience: ${data.experienceNote} — trainer-led background, no independent program knowledge

INJURY SAFETY RULES (CRITICAL — follow strictly):
- Left shoulder injury: AVOID overhead press, upright row, lateral raises behind the plane of the body, behind-the-neck press, Arnold press. Use cable chest flyes, low-incline press, face pulls instead.
- Left hip injury: AVOID deep squats past 90 degrees, full-range Romanian deadlifts, high-impact lunges. Use leg press, step-ups, hip abduction machine instead.
- Right shoulder/hip: same substitution logic, mirrored.
- For ANY injury: always provide a safer alternative that trains adjacent muscles.

PROGRAMMING RULES:
- Assign workouts to specific days: 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday, 7=Sunday
- Use a logical split (Push/Pull/Legs or Upper/Lower) appropriate for the frequency
- Starting weights should be conservative and realistic for a beginner-intermediate
- 3-4 exercises per day, 3-4 sets, 8-15 rep ranges for muscle/general goals, 3-6 for strength
- Rest 60-90s for hypertrophy, 2-3min for strength

Return ONLY valid JSON (no markdown, no explanation) matching this exact schema:
{
  "name": "4-Week Push/Pull/Legs",
  "weekCount": 4,
  "split": [
    {
      "dayOfWeek": 1,
      "label": "Push — Chest / Shoulders / Triceps",
      "exercises": [
        {
          "name": "Barbell Bench Press",
          "sets": 3,
          "repsMin": 8,
          "repsMax": 12,
          "startingWeightKg": 50,
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

  const content = response.choices[0].message.content
  if (!content) throw new Error('Empty response from Groq')

  return JSON.parse(content) as GeneratedProgram
}
