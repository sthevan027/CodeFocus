import { checkRateLimit, getClientIp } from '../../../lib/rateLimit'
import { getRequestId, log } from '../../../lib/logger'

export default async function handler(req, res) {
  const requestId = getRequestId(req)
  res.setHeader('x-request-id', requestId)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const ip = getClientIp(req)
    const rl = checkRateLimit({
      key: `auth:verify_email:${ip}`,
      limit: 10,
      windowMs: 10 * 60 * 1000
    })
    if (!rl.ok) {
      res.setHeader('Retry-After', String(Math.ceil(rl.retryAfterMs / 1000)))
      return res.status(429).json({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' })
    }

    // Com Supabase Auth, a verificação acontece via link enviado por email.
    // O app pode checar o status chamando GET /api/auth/me depois de confirmar.
    return res.status(410).json({
      error: 'Verificação por código foi descontinuada. Verifique seu email pelo link enviado e tente entrar novamente.'
    })
  } catch (error) {
    log('error', 'Erro ao verificar email', { requestId, error: error?.message || String(error) })
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

