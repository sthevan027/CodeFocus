import { createRlsServerClient } from '../../../lib/supabase'
import { requireAuth } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { userId, accessToken } = await requireAuth(req)
    const rls = createRlsServerClient(accessToken)

    const { data: profile, error } = await rls
      .from('profiles')
      .select('id, email, username, full_name, avatar_url, created_at, updated_at')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    return res.status(200).json(profile)
  } catch (error) {
    if (error.message === 'Token não fornecido' || error.message === 'Token inválido') {
      return res.status(401).json({ error: error.message })
    }
    console.error('Erro ao buscar usuário:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

