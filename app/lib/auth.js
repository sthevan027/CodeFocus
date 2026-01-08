import { parseCookies, serializeCookie } from './cookies'
import { createAnonServerClient } from './supabase'

// Cookies httpOnly para sessão Supabase (MVP)
export const ACCESS_COOKIE_NAME = 'codefocus_access'
export const REFRESH_COOKIE_NAME = 'codefocus_refresh'

export function getAccessTokenFromRequest(req) {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  const cookies = parseCookies(req.headers.cookie)
  return cookies[ACCESS_COOKIE_NAME] || null
}

export function getRefreshTokenFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie)
  return cookies[REFRESH_COOKIE_NAME] || null
}

export function setAuthCookies(res, session) {
  // session: { access_token, refresh_token, expires_in }
  const secure = process.env.NODE_ENV === 'production'
  const maxAge = typeof session?.expires_in === 'number' ? session.expires_in : 60 * 60

  const access = serializeCookie(ACCESS_COOKIE_NAME, session.access_token, {
    httpOnly: true,
    sameSite: 'Lax',
    secure,
    path: '/',
    maxAge
  })
  const refresh = serializeCookie(REFRESH_COOKIE_NAME, session.refresh_token, {
    httpOnly: true,
    sameSite: 'Lax',
    secure,
    path: '/',
    // refresh token costuma durar mais; mantendo 30 dias
    maxAge: 30 * 24 * 60 * 60
  })

  res.setHeader('Set-Cookie', [access, refresh])
}

export function clearAuthCookies(res) {
  const secure = process.env.NODE_ENV === 'production'
  res.setHeader('Set-Cookie', [
    serializeCookie(ACCESS_COOKIE_NAME, '', { httpOnly: true, sameSite: 'Lax', secure, path: '/', expires: new Date(0) }),
    serializeCookie(REFRESH_COOKIE_NAME, '', { httpOnly: true, sameSite: 'Lax', secure, path: '/', expires: new Date(0) })
  ])
}

// Valida a sessão Supabase e retorna o userId (auth.uid()) e o accessToken
export async function requireAuth(req) {
  const accessToken = getAccessTokenFromRequest(req)
  if (!accessToken) throw new Error('Token não fornecido')

  const supabase = createAnonServerClient()
  const { data, error } = await supabase.auth.getUser(accessToken)
  if (error || !data?.user?.id) throw new Error('Token inválido')

  return { userId: data.user.id, accessToken }
}

