import { createRlsServerClient } from '../../../lib/supabase'
import { requireAuth } from '../../../lib/auth'
import { taskSchema } from '../../../lib/validations'

export default async function handler(req, res) {
  try {
    const { userId, accessToken } = await requireAuth(req)
    const supabase = createRlsServerClient(accessToken)

    if (req.method === 'POST') {
      const validatedData = taskSchema.parse(req.body)

      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          text: validatedData.text.trim(),
          tags: validatedData.tags || [],
          completed: validatedData.completed ?? false,
          pomodoro_count: validatedData.pomodoro_count ?? 0
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar tarefa:', error)
        return res.status(500).json({ error: 'Erro ao criar tarefa' })
      }

      return res.status(201).json(task)
    }

    if (req.method === 'GET') {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar tarefas:', error)
        return res.status(500).json({ error: 'Erro ao buscar tarefas' })
      }

      const normalizedTasks = (tasks || []).map((t) => ({
        id: t.id,
        text: t.text,
        tags: Array.isArray(t.tags) ? t.tags : [],
        completed: t.completed ?? false,
        pomodoroCount: t.pomodoro_count ?? 0,
        createdAt: t.created_at
      }))

      return res.status(200).json(normalizedTasks)
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
