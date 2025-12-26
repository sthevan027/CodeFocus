import { createServerClient } from '../../../lib/supabase'
import { requireAuth } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const supabase = createServerClient()

  try {
    const userId = await requireAuth(req)
    const { skip = 0, limit = 50 } = req.query

    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(parseInt(skip), parseInt(skip) + parseInt(limit) - 1)

    if (error) {
      console.error('Erro ao buscar relatórios:', error)
      return res.status(500).json({ error: 'Erro ao buscar relatórios' })
    }

    return res.status(200).json(reports || [])
  } catch (error) {
    if (error.message === 'Token não fornecido' || error.message === 'Token inválido') {
      return res.status(401).json({ error: error.message })
    }
    console.error('Erro:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

