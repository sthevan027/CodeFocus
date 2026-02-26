import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Clientes servidor - NÃO use no browser. Para OAuth use lib/supabase-browser.js

// Cliente Supabase admin para uso no servidor (API Routes) - BYPASSA RLS
// Use APENAS para healthchecks/admin (ex: deletar usuário do auth).
export const createAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Cliente Supabase no servidor usando ANON key (não bypassa RLS)
export const createAnonServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Cliente Supabase no servidor "como o usuário" (RLS ativo)
export const createRlsServerClient = (accessToken) => {
  if (!accessToken) {
    throw new Error('Missing Supabase access token')
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

