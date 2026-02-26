/**
 * Cliente Supabase APENAS para o browser (client-side).
 * Usa @supabase/ssr createBrowserClient que armazena PKCE verifier em cookies,
 * evitando AuthPKCECodeVerifierMissingError no redirect OAuth.
 *
 * Importe este arquivo APENAS em componentes/páginas que rodam no cliente.
 */
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
