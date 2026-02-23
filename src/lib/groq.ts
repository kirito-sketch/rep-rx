import Groq from 'groq-sdk'

// Note: dangerouslyAllowBrowser is OK for MVP.
// Move API calls to a Supabase Edge Function for production.
export const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY as string,
  dangerouslyAllowBrowser: true,
})
