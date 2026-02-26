/**
 * Callback OAuth tratado no SERVIDOR - evita AuthPKCECodeVerifierMissingError.
 * O code verifier do PKCE é lido dos cookies da requisição (setados pelo createBrowserClient).
 */
import { createServerClient } from '@supabase/ssr'
import { setAuthCookies } from '../../../lib/auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.redirect(302, `${APP_URL}/?error=method`)
  }

  const { code, error: oauthError } = req.query || {}

  if (oauthError) {
    const msg = oauthError === 'provider_not_enabled' || String(oauthError).includes('not enabled')
      ? 'provider_not_enabled'
      : oauthError
    return res.redirect(302, `${APP_URL}/auth/callback?error=${encodeURIComponent(msg)}`)
  }

  if (!code) {
    return res.redirect(302, `${APP_URL}/auth/callback?error=no_code`)
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.redirect(302, `${APP_URL}/auth/callback?error=config`)
  }

  const cookieHeader = req.headers.cookie || ''

  const getAll = () => {
    if (!cookieHeader) return []
    return cookieHeader.split(';').map((c) => {
      const [name, ...rest] = c.trim().split('=')
      return { name: name?.trim() || '', value: decodeURIComponent(rest.join('=').trim() || '') }
    }).filter((c) => c.name)
  }

  const setAll = (cookies) => {
    const existing = res.getHeader('Set-Cookie') || []
    const arr = Array.isArray(existing) ? existing : [existing]
    const secure = process.env.NODE_ENV === 'production'
    const path = '/'
    const sameSite = 'Lax'

    for (const { name, value, options = {} } of cookies) {
      const opts = { path, sameSite, secure, ...options }
      let cookie = `${name}=${encodeURIComponent(value)}`
      if (opts.path) cookie += `; Path=${opts.path}`
      if (opts.httpOnly !== false) cookie += '; HttpOnly'
      if (opts.secure) cookie += '; Secure'
      if (opts.sameSite) cookie += `; SameSite=${opts.sameSite}`
      if (opts.maxAge) cookie += `; Max-Age=${opts.maxAge}`
      if (opts.expires) cookie += `; Expires=${opts.expires.toUTCString()}`
      arr.push(cookie)
    }
    res.setHeader('Set-Cookie', arr)
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll,
      setAll
    }
  })

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('OAuth callback error:', error.message)
    return res.redirect(302, `${APP_URL}/auth/callback?error=${encodeURIComponent(error.message)}`)
  }

  if (!data?.session) {
    return res.redirect(302, `${APP_URL}/auth/callback?error=no_session`)
  }

  setAuthCookies(res, data.session)

  return res.redirect(302, APP_URL + '/')
}
