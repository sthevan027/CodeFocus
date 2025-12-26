import { createServerClient } from '../../../lib/supabase'
import { requireAuth } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const userId = await requireAuth(req)
    const supabase = createServerClient()

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, full_name, avatar_url, provider, is_active, is_verified, created_at, updated_at, last_login')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    return res.status(200).json(user)
  } catch (error) {
    if (error.message === 'Token não fornecido' || error.message === 'Token inválido') {
      return res.status(401).json({ error: error.message })
    }
    console.error('Erro ao buscar usuário:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

