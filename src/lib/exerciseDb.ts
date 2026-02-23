import { supabase } from './supabase'

export async function getOrCacheExercise(name: string) {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  // Check Supabase cache first
  const { data: cached } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', slug)
    .single()

  if (cached) return cached

  // Try RapidAPI ExerciseDB
  try {
    const response = await fetch(
      `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(name.toLowerCase())}`,
      {
        headers: {
          'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY as string,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
        },
      }
    )

    if (!response.ok) throw new Error('ExerciseDB API error')
    const exercises = await response.json()
    if (!exercises.length) throw new Error('No exercise found')

    const ex = exercises[0]
    const mapped = {
      id: slug,
      name: ex.name ?? name,
      muscle_group_primary: ex.target ?? null,
      muscle_group_secondary: ex.secondaryMuscles ?? [],
      equipment: ex.equipment ?? null,
      gif_url: ex.gifUrl ?? null,
      instructions: ex.instructions ?? [],
      injury_contraindications: [],
    }

    await supabase.from('exercises').upsert(mapped)
    return mapped
  } catch {
    // Fallback: create minimal record so template_exercises FK is satisfied
    const fallback = {
      id: slug,
      name,
      muscle_group_primary: null,
      muscle_group_secondary: [],
      equipment: null,
      gif_url: null,
      instructions: [],
      injury_contraindications: [],
    }
    await supabase.from('exercises').upsert(fallback)
    return fallback
  }
}
