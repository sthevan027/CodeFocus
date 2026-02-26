import { createRlsServerClient } from '../../../lib/supabase'
import { requireAuth } from '../../../lib/auth'

export default async function handler(req, res) {
  try {
    const { userId, accessToken } = await requireAuth(req)
    const supabase = createRlsServerClient(accessToken)
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ error: 'ID da tag é obrigatório' })
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        console.error('Erro ao deletar tag:', error)
        return res.status(500).json({ error: 'Erro ao deletar tag' })
      }

      return res.status(204).end()
    }

    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error) {
    if (error.message === 'Token não fornecido' || error.message === 'Token inválido') {
      return res.status(401).json({ error: error.message })
    }
    console.error('Erro:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
