import { createRlsServerClient } from '../../../lib/supabase'
import { requireAuth } from '../../../lib/auth'
import { settingsUpdateSchema } from '../../../lib/validations'

export default async function handler(req, res) {
  try {
    const { userId, accessToken } = await requireAuth(req)
    const supabase = createRlsServerClient(accessToken)

    if (req.method === 'GET') {
      // Obter configurações
      let { data: settings, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      // Se não existir, nosso trigger em auth.users deve criar automaticamente.
      // Ainda assim, mantemos fallback criando via RLS (permitido pela policy).
      if (error && error.code === 'PGRST116') {
        const { data: newSettings, error: createError } = await supabase
          .from('user_settings')
          .insert({ user_id: userId })
          .select()
          .single()
        if (createError) return res.status(500).json({ error: 'Erro ao criar configurações' })
        return res.status(200).json(newSettings)
      }

      if (error) {
        console.error('Erro ao buscar configurações:', error)
        return res.status(500).json({ error: 'Erro ao buscar configurações' })
      }

      return res.status(200).json(settings)
    }

    if (req.method === 'PUT') {
      // Atualizar configurações
      const validatedData = settingsUpdateSchema.parse(req.body)

      // Verificar se existe
      const { data: existing } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', userId)
        .single()

      let settings
      if (!existing) {
        // Criar se não existir
        const { data: newSettings, error: createError } = await supabase
          .from('user_settings')
          .insert({ user_id: userId, ...validatedData })
          .select()
          .single()

        if (createError) {
          console.error('Erro ao criar configurações:', createError)
          return res.status(500).json({ error: 'Erro ao criar configurações' })
        }

        settings = newSettings
      } else {
        // Atualizar
        const { data: updatedSettings, error: updateError } = await supabase
          .from('user_settings')
          .update(validatedData)
          .eq('user_id', userId)
          .select()
          .single()

        if (updateError) {
          console.error('Erro ao atualizar configurações:', updateError)
          return res.status(500).json({ error: 'Erro ao atualizar configurações' })
        }

        settings = updatedSettings
      }

      return res.status(200).json(settings)
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

