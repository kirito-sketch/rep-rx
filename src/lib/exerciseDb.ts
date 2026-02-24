import { supabase } from './supabase'

// ExerciseDB via RapidAPI — returns animated GIFs + muscle data
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY as string | undefined
const EXERCISEDB_BASE = 'https://exercisedb.p.rapidapi.com'

interface ExerciseDBResult {
  gifUrl: string | null
  muscleGroupPrimary: string | null
  muscleGroupSecondary: string[]
}

async function fetchExerciseDB(name: string): Promise<ExerciseDBResult> {
  if (!RAPIDAPI_KEY) return { gifUrl: null, muscleGroupPrimary: null, muscleGroupSecondary: [] }
  try {
    const res = await fetch(
      `${EXERCISEDB_BASE}/exercises/name/${encodeURIComponent(name.toLowerCase())}?limit=1`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
        },
        signal: AbortSignal.timeout(6000),
      }
    )
    if (!res.ok) return { gifUrl: null, muscleGroupPrimary: null, muscleGroupSecondary: [] }
    const data: Array<{ gifUrl: string; target: string; secondaryMuscles: string[] }> = await res.json()
    if (!data.length) return { gifUrl: null, muscleGroupPrimary: null, muscleGroupSecondary: [] }
    const ex = data[0]
    return {
      gifUrl: ex.gifUrl ?? null,
      muscleGroupPrimary: ex.target ?? null,
      muscleGroupSecondary: ex.secondaryMuscles ?? [],
    }
  } catch {
    return { gifUrl: null, muscleGroupPrimary: null, muscleGroupSecondary: [] }
  }
}

// wger.de — free fallback for images only (no muscle data, often blocked by proxy)
const WGER_BASE = 'https://wger.de/api/v2'

async function fetchWgerImage(name: string): Promise<string | null> {
  try {
    const searchRes = await fetch(
      `${WGER_BASE}/exercise/search/?term=${encodeURIComponent(name)}&language=english&format=json`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!searchRes.ok) return null
    const searchData = await searchRes.json()
    const suggestions: Array<{ id: number; name: string }> = searchData.suggestions ?? []
    if (!suggestions.length) return null

    const exerciseId = suggestions[0].id
    const infoRes = await fetch(
      `${WGER_BASE}/exerciseinfo/${exerciseId}/?format=json`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!infoRes.ok) return null
    const info = await infoRes.json()
    const images: Array<{ image: string }> = info.images ?? []
    return images[0]?.image ?? null
  } catch {
    return null
  }
}

export async function getOrCacheExercise(
  name: string,
  muscleGroupPrimary?: string | null,
  muscleGroupSecondary?: string[]
) {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  // 1. Check Supabase cache first
  const { data: cached } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', slug)
    .single()

  if (cached) {
    // Back-fill muscle data if the cached row has nulls but we now have data from the LLM
    const needsUpdate =
      (muscleGroupPrimary && !cached.muscle_group_primary) ||
      (muscleGroupSecondary?.length && !cached.muscle_group_secondary?.length)
    if (needsUpdate) {
      await supabase
        .from('exercises')
        .update({
          muscle_group_primary: muscleGroupPrimary ?? cached.muscle_group_primary,
          muscle_group_secondary: muscleGroupSecondary ?? cached.muscle_group_secondary,
        })
        .eq('id', slug)
    }
    return {
      ...cached,
      muscle_group_primary: muscleGroupPrimary ?? cached.muscle_group_primary,
      muscle_group_secondary: muscleGroupSecondary ?? cached.muscle_group_secondary,
    }
  }

  // 2. Try ExerciseDB (RapidAPI) — animated GIFs + accurate muscle data
  const dbResult = await fetchExerciseDB(name)

  // 3. Fall back to wger.de image if no GIF from ExerciseDB
  const gifUrl = dbResult.gifUrl ?? (await fetchWgerImage(name))

  // 4. Merge muscle data: prefer ExerciseDB > LLM-provided > null
  const resolvedPrimary = dbResult.muscleGroupPrimary ?? muscleGroupPrimary ?? null
  const resolvedSecondary =
    dbResult.muscleGroupSecondary.length > 0
      ? dbResult.muscleGroupSecondary
      : (muscleGroupSecondary ?? [])

  const record = {
    id: slug,
    name,
    muscle_group_primary: resolvedPrimary,
    muscle_group_secondary: resolvedSecondary,
    equipment: null as string | null,
    gif_url: gifUrl,
    instructions: [] as string[],
    injury_contraindications: [] as string[],
  }

  // 5. Upsert into Supabase cache
  const { error } = await supabase.from('exercises').upsert(record)
  if (error) {
    console.warn(`Exercise cache write failed for "${name}":`, error.message)
  }

  return record
}
