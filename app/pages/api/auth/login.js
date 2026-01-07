import { createServerClient } from '../../../lib/supabase'
import { verifyPassword, createToken } from '../../../lib/auth'
import { loginSchema } from '../../../lib/validations'
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
      key: `auth:login:${ip}`,
      limit: 10,
      windowMs: 60 * 1000
    })
    if (!rl.ok) {
      res.setHeader('Retry-After', String(Math.ceil(rl.retryAfterMs / 1000)))
      return res.status(429).json({ error: 'Muitas tentativas. Tente novamente em alguns segundos.' })
    }

    // Validar dados
    const validatedData = loginSchema.parse(req.body)

    const supabase = createServerClient()

    // Buscar usuário
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', validatedData.email)
      .single()

    if (userError || !user) {
      log('warn', 'Login inválido (email não encontrado)', { requestId, ip })
      return res.status(401).json({ error: 'Email ou senha incorretos' })
    }

    // Verificar senha
    const isValidPassword = await verifyPassword(validatedData.password, user.hashed_password)
    if (!isValidPassword) {
      log('warn', 'Login inválido (senha incorreta)', { requestId, ip, userId: user.id })
      return res.status(401).json({ error: 'Email ou senha incorretos' })
    }

    // Verificar se está ativo
    if (!user.is_active) {
      return res.status(400).json({ error: 'Usuário inativo' })
    }

    // Verificar se o email foi verificado
    if (!user.is_verified) {
      log('warn', 'Login bloqueado (email não verificado)', { requestId, ip, userId: user.id })
      return res.status(400).json({ error: 'Email não verificado. Verifique seu email primeiro.' })
    }

    // Atualizar último login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    // Gerar token
    const token = createToken({ userId: user.id })

    return res.status(200).json({
      access_token: token,
      token_type: 'bearer',
      expires_in: 30 * 60, // 30 minutos
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        provider: user.provider,
        is_active: user.is_active,
        is_verified: user.is_verified,
        created_at: user.created_at,
        last_login: user.last_login
      }
    })
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message })
    }
    log('error', 'Erro no login', { requestId, error: error?.message || String(error) })
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

