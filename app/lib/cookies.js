export function parseCookies(cookieHeader) {
  const out = {}
  if (!cookieHeader || typeof cookieHeader !== 'string') return out
  const parts = cookieHeader.split(';')
  for (const part of parts) {
    const [k, ...rest] = part.trim().split('=')
    if (!k) continue
    out[k] = decodeURIComponent(rest.join('=') || '')
  }
  return out
}

export function serializeCookie(name, value, options = {}) {
  const {
    httpOnly = true,
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'Lax',
    path = '/',
    maxAge, // seconds
    expires // Date
  } = options

  let cookie = `${name}=${encodeURIComponent(value)}`
  if (path) cookie += `; Path=${path}`
  if (httpOnly) cookie += '; HttpOnly'
  if (secure) cookie += '; Secure'
  if (sameSite) cookie += `; SameSite=${sameSite}`
  if (typeof maxAge === 'number') cookie += `; Max-Age=${maxAge}`
  if (expires instanceof Date) cookie += `; Expires=${expires.toUTCString()}`
  return cookie
}

