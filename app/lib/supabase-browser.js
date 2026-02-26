/**
 * Cliente Supabase APENAS para o browser (client-side).
 * Usa @supabase/ssr createBrowserClient que armazena PKCE verifier em cookies,
 * evitando AuthPKCECodeVerifierMissingError no redirect OAuth.
 *
 * Importe este arquivo APENAS em componentes/páginas que rodam no cliente.
 *
 * Inicialização lazy: não lança durante build/SSR (client só é criado no primeiro uso).
 */
import { createBrowserClient } from '@supabase/ssr'

let _client = null

function getSupabase() {
  if (_client) return _client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  _client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return _client
}

export const supabase = new Proxy({}, {
  get(_, prop) {
    return getSupabase()[prop]
  }
})
