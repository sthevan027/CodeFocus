import { z } from 'zod'
import { createServerClient } from '../../../lib/supabase'
import { requireAuth } from '../../../lib/auth'

const updateMeSchema = z.object({
  email: z.string().email().optional(),
  full_name: z.string().max(255).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  // tolerância para payload antigo do frontend
  name: z.string().max(255).optional(),
  avatar: z.string().url().optional().or(z.literal(''))
})

export default async function handler(req, res) {
  const supabase = createServerClient()

  try {
    const userId = await requireAuth(req)

    if (req.method === 'PUT') {
      const validated = updateMeSchema.parse(req.body || {})

      const nextEmail = validated.email
      const nextFullName = validated.full_name ?? validated.name
      const nextAvatarUrl = validated.avatar_url ?? validated.avatar

      // Buscar usuário atual
      const { data: currentUser, error: currentUserError } = await supabase
        .from('users')
        .select('id, email, is_verified')
        .eq('id', userId)
        .single()

      if (currentUserError || !currentUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      const updates = {}
      if (nextFullName !== undefined) updates.full_name = nextFullName
      if (nextAvatarUrl !== undefined) updates.avatar_url = nextAvatarUrl

      const isEmailChanging =
        typeof nextEmail === 'string' &&
        nextEmail.trim().length > 0 &&
        nextEmail.trim().toLowerCase() !== (currentUser.email || '').toLowerCase()

      if (isEmailChanging) {
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
        const verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000) // 5 minutos

        updates.email = nextEmail.trim().toLowerCase()
        updates.is_verified = false
        updates.verified_at = null
        updates.verification_code = verificationCode
        updates.verification_code_expires = verificationCodeExpires.toISOString()

        // TODO: enviar email via Resend
        // await sendVerificationEmail(updates.email, verificationCode, nextFullName)
      }

      if (Object.keys(updates).length === 0) {
        // nada pra atualizar
        const { data: user, error } = await supabase
          .from('users')
          .select('id, email, username, full_name, avatar_url, provider, is_active, is_verified, created_at, updated_at, last_login')
          .eq('id', userId)
          .single()

        if (error || !user) return res.status(404).json({ error: 'Usuário não encontrado' })
        return res.status(200).json({ user })
      }

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select('id, email, username, full_name, avatar_url, provider, is_active, is_verified, created_at, updated_at, last_login')
        .single()

      if (updateError) {
        // email pode colidir com unique
        if (updateError.code === '23505') {
          return res.status(400).json({ error: 'Email já está em uso' })
        }
        console.error('Erro ao atualizar perfil:', updateError)
        return res.status(500).json({ error: 'Erro ao atualizar perfil' })
      }

      return res.status(200).json({ user: updatedUser })
    }

    if (req.method === 'DELETE') {
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (deleteError) {
        console.error('Erro ao deletar usuário:', deleteError)
        return res.status(500).json({ error: 'Erro ao deletar usuário' })
      }

      return res.status(200).json({ message: 'Conta removida com sucesso' })
    }

    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error) {
    if (error.message === 'Token não fornecido' || error.message === 'Token inválido') {
      return res.status(401).json({ error: error.message })
    }
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message })
    }
    console.error('Erro em /users/me:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

