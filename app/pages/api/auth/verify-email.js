import { createServerClient } from '../../../lib/supabase'
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

    const { email, code } = req.query

    if (!email || !code) {
      return res.status(400).json({ error: 'Email e código são obrigatórios' })
    }

    const supabase = createServerClient()

    // Buscar usuário
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (userError || !user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Verificar código
    if (!user.verification_code || user.verification_code !== code) {
      return res.status(400).json({ error: 'Código de verificação inválido' })
    }

    // Verificar se expirou (5 minutos)
    if (!user.verification_code_expires) {
      return res.status(400).json({ error: 'Código de verificação expirado. Solicite um novo código.' })
    }
    const expiresAt = new Date(user.verification_code_expires)
    const now = new Date()
    if (now > expiresAt) {
      return res.status(400).json({ error: 'Código de verificação expirado. Solicite um novo código.' })
    }

    // Marcar como verificado
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_verified: true,
        verification_code: null,
        verification_code_expires: null,
        verified_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      log('error', 'Erro ao verificar email (update)', { requestId, ip, error: updateError?.message || String(updateError) })
      return res.status(500).json({ error: 'Erro ao verificar email' })
    }

    // TODO: Enviar email de boas-vindas
    // await sendWelcomeEmail(email, user.full_name || user.username)

    return res.status(200).json({ message: 'Email verificado com sucesso' })
  } catch (error) {
    log('error', 'Erro ao verificar email', { requestId, error: error?.message || String(error) })
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

