import { createAnonServerClient } from '../../../lib/supabase'
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
      key: `auth:send_verification:${ip}`,
      limit: 5,
      windowMs: 10 * 60 * 1000
    })
    if (!rl.ok) {
      res.setHeader('Retry-After', String(Math.ceil(rl.retryAfterMs / 1000)))
      return res.status(429).json({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' })
    }

    const { email } = req.query

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' })
    }

    const supabase = createAnonServerClient()

    // Reenvia email de confirmação do Supabase Auth (link de verificação)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: String(email)
    })

    if (error) {
      log('error', 'Erro ao reenviar confirmação (supabase)', { requestId, ip, error: error.message })
      return res.status(400).json({ error: 'Não foi possível reenviar o email de verificação' })
    }

    return res.status(200).json({ message: 'Código de verificação enviado com sucesso' })
  } catch (error) {
    log('error', 'Erro ao enviar verificação', { requestId, error: error?.message || String(error) })
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

