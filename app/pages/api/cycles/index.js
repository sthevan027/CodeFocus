import { createServerClient } from '../../../lib/supabase'
import { requireAuth } from '../../../lib/auth'
import { cycleSchema } from '../../../lib/validations'

export default async function handler(req, res) {
  const supabase = createServerClient()

  try {
    const userId = await requireAuth(req)

    if (req.method === 'POST') {
      // Criar ciclo
      const validatedData = cycleSchema.parse(req.body)

      const { data: cycle, error } = await supabase
        .from('cycles')
        .insert({
          user_id: userId,
          name: validatedData.name,
          duration: validatedData.duration,
          phase: validatedData.phase,
          git_commit: validatedData.git_commit,
          git_files: validatedData.git_files
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar ciclo:', error)
        return res.status(500).json({ error: 'Erro ao criar ciclo' })
      }

      return res.status(201).json(cycle)
    }

    if (req.method === 'GET') {
      // Listar ciclos
      const { skip = 0, limit = 100 } = req.query

      const { data: cycles, error } = await supabase
        .from('cycles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(parseInt(skip), parseInt(skip) + parseInt(limit) - 1)

      if (error) {
        console.error('Erro ao buscar ciclos:', error)
        return res.status(500).json({ error: 'Erro ao buscar ciclos' })
      }

      return res.status(200).json(cycles || [])
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

