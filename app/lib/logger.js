import crypto from 'crypto'

export function getRequestId(req) {
  const headerId = req.headers['x-request-id']
  if (typeof headerId === 'string' && headerId.trim()) return headerId.trim()
  try {
    return crypto.randomUUID()
  } catch {
    return `req_${Date.now()}_${Math.random().toString(16).slice(2)}`
  }
}

export function log(level, message, meta = {}) {
  const payload = {
    level,
    message,
    time: new Date().toISOString(),
    ...meta
  }
  const line = JSON.stringify(payload)
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

