const getStore = () => {
  if (!globalThis.__codefocus_rate_limit_store) {
    globalThis.__codefocus_rate_limit_store = new Map()
  }
  return globalThis.__codefocus_rate_limit_store
}

export function getClientIp(req) {
  const xf = req.headers['x-forwarded-for']
  if (typeof xf === 'string' && xf.length > 0) {
    return xf.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}

export function checkRateLimit({ key, limit, windowMs }) {
  const store = getStore()
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfterMs: 0 }
  }

  const nextCount = entry.count + 1
  entry.count = nextCount
  store.set(key, entry)

  if (nextCount > limit) {
    return { ok: false, remaining: 0, retryAfterMs: Math.max(entry.resetAt - now, 0) }
  }

  return { ok: true, remaining: Math.max(limit - nextCount, 0), retryAfterMs: 0 }
}

