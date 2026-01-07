import { createServerClient } from '../../../lib/supabase'
import { requireAuth } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const supabase = createServerClient()

  try {
    const userId = await requireAuth(req)

    // Resetar para valores padrão
    const defaultSettings = {
      focus_time: 25,
      short_break_time: 5,
      long_break_time: 15,
      cycles_before_long_break: 4,
      auto_start_breaks: false,
      auto_start_pomodoros: false,
      sound_enabled: true,
      notifications_enabled: true,
      auto_commit: false,
      auto_push: false,
      git_commit_template: 'feat: {cycle_name} ({duration}min)',
      theme: 'dark',
      accent_color: '#3B82F6',
      notification_sound: 'default',
      notification_volume: 50,
      auto_generate_reports: true,
      report_format: 'txt',
      oauth_preferences: {}
    }

    const { error } = await supabase
      .from('user_settings')
      .update(defaultSettings)
      .eq('user_id', userId)

    if (error) {
      console.error('Erro ao resetar configurações:', error)
      return res.status(500).json({ error: 'Erro ao resetar configurações' })
    }

    return res.status(200).json({ message: 'Configurações resetadas para os valores padrão' })
  } catch (error) {
    if (error.message === 'Token não fornecido' || error.message === 'Token inválido') {
      return res.status(401).json({ error: error.message })
    }
    console.error('Erro:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

