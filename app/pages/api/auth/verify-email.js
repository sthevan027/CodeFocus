import { createServerClient } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
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
    if (user.verification_code_expires) {
      const expiresAt = new Date(user.verification_code_expires)
      const now = new Date()
      if (now > expiresAt) {
        return res.status(400).json({ error: 'Código de verificação expirado' })
      }
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
      console.error('Erro ao verificar email:', updateError)
      return res.status(500).json({ error: 'Erro ao verificar email' })
    }

    // TODO: Enviar email de boas-vindas
    // await sendWelcomeEmail(email, user.full_name || user.username)

    return res.status(200).json({ message: 'Email verificado com sucesso' })
  } catch (error) {
    console.error('Erro ao verificar email:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

