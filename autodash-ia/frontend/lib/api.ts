import axios from 'axios'
import { getSupabaseClient } from '@/lib/supabaseClient'

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL as string

export async function apiClient() {
  const instance = axios.create({ baseURL })
  try {
    const supabase = getSupabaseClient()
    const session = (await supabase.auth.getSession()).data.session
    const token = session?.access_token
    instance.interceptors.request.use((config) => {
      if (token) {
        config.headers = config.headers ?? {}
        config.headers['Authorization'] = `Bearer ${token}`
      }
      return config
    })
  } catch (_) {
    // ignore missing supabase during build/SSR
  }
  return instance
}