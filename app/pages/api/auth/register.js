import { createServerClient } from '../../../lib/supabase'
import { hashPassword, createToken } from '../../../lib/auth'
import { registerSchema } from '../../../lib/validations'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Validar dados
    const validatedData = registerSchema.parse(req.body)

    const supabase = createServerClient()

    // Verificar se o email já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', validatedData.email)
      .single()

    if (existingUser) {
      return res.status(400).json({ error: 'Email já registrado' })
    }

    // Hash da senha
    const hashedPassword = await hashPassword(validatedData.password)

    // Gerar código de verificação
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000) // 5 minutos

    // Criar usuário
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: validatedData.email,
        username: validatedData.username,
        full_name: validatedData.full_name,
        hashed_password: hashedPassword,
        avatar_url: validatedData.avatar_url,
        provider: validatedData.provider,
        is_verified: false,
        verification_code: verificationCode,
        verification_code_expires: verificationCodeExpires.toISOString()
      })
      .select()
      .single()

    if (userError) {
      console.error('Erro ao criar usuário:', userError)
      return res.status(500).json({ error: 'Erro ao criar usuário' })
    }

    // Criar configurações padrão
    await supabase.from('user_settings').insert({
      user_id: user.id
    })

    // TODO: Enviar email de verificação via Resend
    // await sendVerificationEmail(user.email, verificationCode, user.full_name || user.username)

    // Gerar token
    const token = createToken({ userId: user.id })

    return res.status(201).json({
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
        created_at: user.created_at
      }
    })
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message })
    }
    console.error('Erro no registro:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

