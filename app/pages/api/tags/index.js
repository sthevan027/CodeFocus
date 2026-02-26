import { createRlsServerClient } from '../../../lib/supabase'
import { requireAuth } from '../../../lib/auth'
import { tagSchema } from '../../../lib/validations'

export default async function handler(req, res) {
  try {
    const { userId, accessToken } = await requireAuth(req)
    const supabase = createRlsServerClient(accessToken)

    if (req.method === 'POST') {
      const validatedData = tagSchema.parse(req.body)

      const { data: tag, error } = await supabase
        .from('tags')
        .insert({
          user_id: userId,
          name: validatedData.name.trim()
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: 'Tag já existe' })
        }
        console.error('Erro ao criar tag:', error)
        return res.status(500).json({ error: 'Erro ao criar tag' })
      }

      return res.status(201).json(tag)
    }

    if (req.method === 'GET') {
      const { data: tags, error } = await supabase
        .from('tags')
        .select('id, name, created_at')
        .eq('user_id', userId)
        .order('name', { ascending: true })

      if (error) {
        console.error('Erro ao buscar tags:', error)
        return res.status(500).json({ error: 'Erro ao buscar tags' })
      }

      return res.status(200).json(tags || [])
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
