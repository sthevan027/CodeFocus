import { createServerClient } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { email } = req.query

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' })
    }

    const supabase = createServerClient()

    // Verificar se o usuário existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name, username')
      .eq('email', email)
      .single()

    if (userError || !user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Gerar código de verificação
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000) // 5 minutos

    // Salvar código no banco
    const { error: updateError } = await supabase
      .from('users')
      .update({
        verification_code: verificationCode,
        verification_code_expires: verificationCodeExpires.toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Erro ao atualizar código:', updateError)
      return res.status(500).json({ error: 'Erro ao gerar código de verificação' })
    }

    // TODO: Enviar email via Resend
    // await sendVerificationEmail(email, verificationCode, user.full_name || user.username)

    return res.status(200).json({ message: 'Código de verificação enviado com sucesso' })
  } catch (error) {
    console.error('Erro ao enviar verificação:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

