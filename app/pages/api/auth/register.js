import { createAnonServerClient, createRlsServerClient } from '../../../lib/supabase'
import { setAuthCookies } from '../../../lib/auth'
import { registerSchema } from '../../../lib/validations'
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
      key: `auth:register:${ip}`,
      limit: 5,
      windowMs: 60 * 60 * 1000
    })
    if (!rl.ok) {
      res.setHeader('Retry-After', String(Math.ceil(rl.retryAfterMs / 1000)))
      return res.status(429).json({ error: 'Muitas tentativas. Tente novamente mais tarde.' })
    }

    // Validar dados
    const validatedData = registerSchema.parse(req.body)

    const supabase = createAnonServerClient()

    // Signup via Supabase Auth (email confirmation é controlado no dashboard do Supabase)
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          full_name: validatedData.full_name || '',
          username: validatedData.username || '',
          avatar_url: validatedData.avatar_url || ''
        }
      }
    })

    if (error || !data?.user) {
      // Ex: "User already registered"
      const msg = error?.message?.toLowerCase?.().includes('already') ? 'Email já registrado' : 'Erro ao criar usuário'
      log('warn', 'Erro no signup Supabase', { requestId, ip, error: error?.message })
      return res.status(400).json({ error: msg })
    }

    // Se o Supabase retornar session, já logamos e setamos cookies
    if (data.session) {
      setAuthCookies(res, data.session)
      const rls = createRlsServerClient(data.session.access_token)
      const { data: profile } = await rls
        .from('profiles')
        .select('id, email, username, full_name, avatar_url')
        .eq('id', data.user.id)
        .single()

      return res.status(201).json({
        user: {
          id: data.user.id,
          email: data.user.email,
          username: profile?.username || null,
          full_name: profile?.full_name || null,
          avatar_url: profile?.avatar_url || null
        }
      })
    }

    // Caso típico: confirmação de email habilitada → session é null
    return res.status(201).json({
      needs_verification: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: validatedData.full_name || null
      }
    })
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message })
    }
    log('error', 'Erro no registro', { requestId, error: error?.message || String(error) })
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

