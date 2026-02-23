import { supabase } from './supabase'

// wger.de — free, no API key, CORS-friendly fitness database
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

export async function getOrCacheExercise(name: string) {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  // 1. Check Supabase cache first
  const { data: cached } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', slug)
    .single()

  if (cached) return cached

  // 2. Try wger.de (free, no key, CORS-safe)
  const gifUrl = await fetchWgerImage(name)

  const record = {
    id: slug,
    name,
    muscle_group_primary: null as string | null,
    muscle_group_secondary: [] as string[],
    equipment: null as string | null,
    gif_url: gifUrl,
    instructions: [] as string[],
    injury_contraindications: [] as string[],
  }

  // 3. Upsert into Supabase cache
  const { error } = await supabase.from('exercises').upsert(record)
  if (error) {
    console.warn(`Exercise cache write failed for "${name}":`, error.message)
  }

  return record
}
