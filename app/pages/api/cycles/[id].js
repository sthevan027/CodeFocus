import { createRlsServerClient } from '../../../lib/supabase'
import { requireAuth } from '../../../lib/auth'
import { cycleUpdateSchema } from '../../../lib/validations'

export default async function handler(req, res) {
  try {
    const { userId, accessToken } = await requireAuth(req)
    const supabase = createRlsServerClient(accessToken)
    const { id } = req.query

    if (req.method === 'GET') {
      // Obter ciclo específico
      const { data: cycle, error } = await supabase
        .from('cycles')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (error || !cycle) {
        return res.status(404).json({ error: 'Ciclo não encontrado' })
      }

      return res.status(200).json(cycle)
    }

    if (req.method === 'PUT') {
      // Atualizar ciclo
      const validatedData = cycleUpdateSchema.parse(req.body)

      // Verificar se o ciclo existe e pertence ao usuário
      const { data: existingCycle } = await supabase
        .from('cycles')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (!existingCycle) {
        return res.status(404).json({ error: 'Ciclo não encontrado' })
      }

      const updateData = { ...validatedData }
      if (validatedData.completed && !validatedData.end_time) {
        updateData.end_time = new Date().toISOString()
      }

      const { data: cycle, error } = await supabase
        .from('cycles')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar ciclo:', error)
        return res.status(500).json({ error: 'Erro ao atualizar ciclo' })
      }

      return res.status(200).json(cycle)
    }

    if (req.method === 'DELETE') {
      // Deletar ciclo
      const { error } = await supabase
        .from('cycles')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        console.error('Erro ao deletar ciclo:', error)
        return res.status(500).json({ error: 'Erro ao deletar ciclo' })
      }

      return res.status(200).json({ message: 'Ciclo deletado com sucesso' })
    }

    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error) {
    if (error.message === 'Token não fornecido' || error.message === 'Token inválido') {
      return res.status(401).json({ error: error.message })
    }
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message })
    }
    console.error('Erro:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

