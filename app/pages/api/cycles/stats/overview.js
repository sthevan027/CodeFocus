import { createRlsServerClient } from '../../../../lib/supabase'
import { requireAuth } from '../../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { userId, accessToken } = await requireAuth(req)
    const supabase = createRlsServerClient(accessToken)

    // Buscar todos os ciclos do usuário
    const { data: cycles, error } = await supabase
      .from('cycles')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Erro ao buscar ciclos:', error)
      return res.status(500).json({ error: 'Erro ao buscar estatísticas' })
    }

    const totalCycles = cycles?.length || 0
    const completedCycles = cycles?.filter(c => c.completed).length || 0
    const interruptedCycles = cycles?.filter(c => c.interrupted).length || 0

    const totalFocusTime = cycles
      ?.filter(c => c.phase === 'focus' && c.completed)
      .reduce((sum, c) => sum + c.duration, 0) || 0

    const totalBreakTime = cycles
      ?.filter(c => ['shortBreak', 'longBreak'].includes(c.phase) && c.completed)
      .reduce((sum, c) => sum + c.duration, 0) || 0

    const averageDuration = completedCycles > 0
      ? cycles
          ?.filter(c => c.completed)
          .reduce((sum, c) => sum + c.duration, 0) / completedCycles || 0
      : 0

    // Calcular score de produtividade (0-100)
    let productivityScore = 0
    if (totalCycles > 0) {
      const completionRate = completedCycles / totalCycles
      const focusEfficiency = (totalFocusTime + totalBreakTime) > 0
        ? totalFocusTime / (totalFocusTime + totalBreakTime)
        : 0
      productivityScore = Math.round((completionRate * 0.6 + focusEfficiency * 0.4) * 100)
    }

    return res.status(200).json({
      total_cycles: totalCycles,
      completed_cycles: completedCycles,
      interrupted_cycles: interruptedCycles,
      // duration é em MINUTOS (manter compat com clientes antigos)
      total_focus_time: totalFocusTime,
      total_break_time: totalBreakTime,
      total_focus_minutes: totalFocusTime,
      total_break_minutes: totalBreakTime,
      average_cycle_duration: averageDuration,
      productivity_score: productivityScore
    })
  } catch (error) {
    if (error.message === 'Token não fornecido' || error.message === 'Token inválido') {
      return res.status(401).json({ error: error.message })
    }
    console.error('Erro:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

