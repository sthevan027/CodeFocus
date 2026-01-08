import { createRlsServerClient } from '../../../lib/supabase'
import { requireAuth } from '../../../lib/auth'

export default async function handler(req, res) {
  try {
    const { userId, accessToken } = await requireAuth(req)
    const supabase = createRlsServerClient(accessToken)
    const { id } = req.query

    if (req.method === 'GET') {
      // Obter relatório específico
      const { data: report, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (error || !report) {
        return res.status(404).json({ error: 'Relatório não encontrado' })
      }

      return res.status(200).json(report)
    }

    if (req.method === 'DELETE') {
      // Deletar relatório
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        console.error('Erro ao deletar relatório:', error)
        return res.status(500).json({ error: 'Erro ao deletar relatório' })
      }

      return res.status(200).json({ message: 'Relatório deletado com sucesso' })
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

