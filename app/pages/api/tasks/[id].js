import { createRlsServerClient } from '../../../lib/supabase'
import { requireAuth } from '../../../lib/auth'
import { taskUpdateSchema } from '../../../lib/validations'

export default async function handler(req, res) {
  try {
    const { userId, accessToken } = await requireAuth(req)
    const supabase = createRlsServerClient(accessToken)
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ error: 'ID da tarefa é obrigatório' })
    }

    if (req.method === 'PUT') {
      const validatedData = taskUpdateSchema.parse(req.body)
      const updates = {}

      if (validatedData.text !== undefined) updates.text = validatedData.text.trim()
      if (validatedData.tags !== undefined) updates.tags = validatedData.tags
      if (validatedData.completed !== undefined) updates.completed = validatedData.completed
      if (validatedData.pomodoro_count !== undefined) updates.pomodoro_count = validatedData.pomodoro_count

      const { data: task, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar tarefa:', error)
        return res.status(500).json({ error: 'Erro ao atualizar tarefa' })
      }

      return res.status(200).json({
        id: task.id,
        text: task.text,
        tags: Array.isArray(task.tags) ? task.tags : [],
        completed: task.completed ?? false,
        pomodoroCount: task.pomodoro_count ?? 0,
        createdAt: task.created_at
      })
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        console.error('Erro ao deletar tarefa:', error)
        return res.status(500).json({ error: 'Erro ao deletar tarefa' })
      }

      return res.status(204).end()
    }

    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error) {
    if (error.message === 'Token não fornecido' || error.message === 'Token inválido') {
      return res.status(401).json({ error: error.message })
    }
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0]?.message || 'Dados inválidos' })
    }
    console.error('Erro:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
