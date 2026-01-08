import { z } from 'zod'
import { createAdminClient, createRlsServerClient } from '../../../lib/supabase'
import { requireAuth } from '../../../lib/auth'

const updateMeSchema = z.object({
  full_name: z.string().max(255).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  username: z.string().max(255).optional(),
  // tolerância para payload antigo do frontend
  name: z.string().max(255).optional(),
  avatar: z.string().url().optional().or(z.literal(''))
})

export default async function handler(req, res) {
  try {
    const { userId, accessToken } = await requireAuth(req)
    const rls = createRlsServerClient(accessToken)

    if (req.method === 'PUT') {
      const validated = updateMeSchema.parse(req.body || {})

      const nextFullName = validated.full_name ?? validated.name
      const nextAvatarUrl = validated.avatar_url ?? validated.avatar
      const nextUsername = validated.username

      const updates = {}
      if (nextFullName !== undefined) updates.full_name = nextFullName
      if (nextAvatarUrl !== undefined) updates.avatar_url = nextAvatarUrl
      if (nextUsername !== undefined) updates.username = nextUsername

      if (Object.keys(updates).length === 0) {
        // nada pra atualizar
        const { data: profile, error } = await rls
          .from('profiles')
          .select('id, email, username, full_name, avatar_url, created_at, updated_at')
          .eq('id', userId)
          .single()

        if (error || !profile) return res.status(404).json({ error: 'Usuário não encontrado' })
        return res.status(200).json({ user: profile })
      }

      const { data: updatedProfile, error: updateError } = await rls
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select('id, email, username, full_name, avatar_url, created_at, updated_at')
        .single()

      if (updateError) {
        // username pode colidir com unique
        if (updateError.code === '23505') {
          return res.status(400).json({ error: 'Username já está em uso' })
        }
        console.error('Erro ao atualizar perfil:', updateError)
        return res.status(500).json({ error: 'Erro ao atualizar perfil' })
      }

      return res.status(200).json({ user: updatedProfile })
    }

    if (req.method === 'DELETE') {
      // Deletar usuário do Supabase Auth (admin) — cascata remove profile/settings/cycles/reports
      const admin = createAdminClient()
      const { error: deleteAuthError } = await admin.auth.admin.deleteUser(userId)
      if (deleteAuthError) {
        console.error('Erro ao deletar usuário (auth):', deleteAuthError)
        return res.status(500).json({ error: 'Erro ao deletar conta' })
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

