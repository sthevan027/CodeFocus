import { createAnonServerClient, createRlsServerClient } from '../../../lib/supabase'
import { loginSchema } from '../../../lib/validations'
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit'
import { getRequestId, log } from '../../../lib/logger'
import { setAuthCookies } from '../../../lib/auth'

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

    const supabase = createAnonServerClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password
    })

    if (error || !data?.session || !data?.user) {
      log('warn', 'Login inválido (supabase)', { requestId, ip, error: error?.message })
      return res.status(401).json({ error: 'Email ou senha incorretos' })
    }

    // Set cookie httpOnly com access + refresh
    setAuthCookies(res, data.session)

    // Buscar profile via RLS
    const rls = createRlsServerClient(data.session.access_token)
    const { data: profile } = await rls
      .from('profiles')
      .select('id, email, username, full_name, avatar_url, created_at, updated_at')
      .eq('id', data.user.id)
      .single()

    return res.status(200).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        username: profile?.username || null,
        full_name: profile?.full_name || null,
        avatar_url: profile?.avatar_url || null
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

