import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (client) return client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    // Avoid crashing during Next.js build/SSR; only enforce in browser
    if (typeof window === 'undefined') {
      throw new Error('Supabase env not set on server build')
    }
    throw new Error('Supabase env not set')
  }
  client = createClient(supabaseUrl, supabaseAnonKey)
  return client
}