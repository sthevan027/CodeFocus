import { createRlsServerClient } from '../../../../lib/supabase'
import { requireAuth } from '../../../../lib/auth'

const startOfWeekUtc = () => {
  const now = new Date()
  const day = now.getUTCDay()
  const diff = day === 0 ? 6 : day - 1 // Segunda como início da semana
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() - diff)
  monday.setUTCHours(0, 0, 0, 0)
  return monday
}

const endOfTodayUtc = () => {
  const now = new Date()
  const end = new Date(now)
  end.setUTCHours(23, 59, 59, 999)
  return end
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { userId, accessToken } = await requireAuth(req)
    const supabase = createRlsServerClient(accessToken)

    const from = startOfWeekUtc().toISOString()
    const to = endOfTodayUtc().toISOString()

    const { data: cycles, error } = await supabase
      .from('cycles')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', from)
      .lte('created_at', to)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar ciclos semanais:', error)
      return res.status(500).json({ error: 'Erro ao buscar estatísticas semanais' })
    }

    const list = cycles || []

    const totalFocusMinutes = list
      .filter((c) => c.phase === 'focus' && c.completed)
      .reduce((sum, c) => sum + (c.duration || 0), 0)

    // Breakdown por dia (últimos 7 dias) - UTC
    const dailyBreakdown = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setUTCDate(d.getUTCDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const dayStart = new Date(`${dateStr}T00:00:00.000Z`)
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

      const dayCycles = list.filter((c) => {
        const created = new Date(c.created_at)
        return created >= dayStart && created < dayEnd
      })
      const dayFocus = dayCycles
        .filter((c) => c.phase === 'focus' && c.completed)
        .reduce((sum, c) => sum + (c.duration || 0), 0)

      dailyBreakdown.push({
        date: dateStr,
        total_focus_minutes: dayFocus,
        sessions: dayCycles.filter((c) => c.phase === 'focus').length
      })
    }

    return res.status(200).json({
      total_focus_minutes: totalFocusMinutes,
      daily_breakdown: dailyBreakdown
    })
  } catch (error) {
    if (error.message === 'Token não fornecido' || error.message === 'Token inválido') {
      return res.status(401).json({ error: error.message })
    }
    console.error('Erro:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
