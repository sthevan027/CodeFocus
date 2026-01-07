import { z } from 'zod'
import { createServerClient } from '../../../../lib/supabase'
import { requireAuth } from '../../../../lib/auth'

const querySchema = z.object({
  date: z.string().optional() // YYYY-MM-DD
})

const startOfDayUtc = (dateStr) => {
  const d = dateStr ? new Date(`${dateStr}T00:00:00.000Z`) : new Date()
  // se dateStr inválido, Date vira Invalid Date; tratar no caller
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0))
}

const endOfDayUtc = (dateStr) => {
  const start = startOfDayUtc(dateStr)
  return new Date(start.getTime() + 24 * 60 * 60 * 1000)
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const supabase = createServerClient()

  try {
    const userId = await requireAuth(req)
    const { date } = querySchema.parse(req.query)

    if (date) {
      const parsed = new Date(`${date}T00:00:00.000Z`)
      if (Number.isNaN(parsed.getTime())) {
        return res.status(400).json({ error: 'Data inválida. Use o formato YYYY-MM-DD' })
      }
    }

    const from = startOfDayUtc(date).toISOString()
    const to = endOfDayUtc(date).toISOString()

    const { data: cycles, error } = await supabase
      .from('cycles')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', from)
      .lt('created_at', to)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar ciclos diários:', error)
      return res.status(500).json({ error: 'Erro ao buscar estatísticas diárias' })
    }

    const list = cycles || []
    const totalCycles = list.length
    const completedCycles = list.filter((c) => c.completed).length
    const interruptedCycles = list.filter((c) => c.interrupted).length

    // Backend padroniza duration em MINUTOS
    const totalFocusMinutes = list
      .filter((c) => c.phase === 'focus' && c.completed)
      .reduce((sum, c) => sum + (c.duration || 0), 0)

    const totalBreakMinutes = list
      .filter((c) => ['shortBreak', 'longBreak'].includes(c.phase) && c.completed)
      .reduce((sum, c) => sum + (c.duration || 0), 0)

    // Score simples diário 0-100
    let productivityScore = 0
    if (totalCycles > 0) {
      const completionRate = completedCycles / totalCycles
      const focusEfficiency = (totalFocusMinutes + totalBreakMinutes) > 0
        ? totalFocusMinutes / (totalFocusMinutes + totalBreakMinutes)
        : 0
      productivityScore = Math.round((completionRate * 0.6 + focusEfficiency * 0.4) * 100)
    }

    return res.status(200).json({
      date: date || startOfDayUtc().toISOString().slice(0, 10),
      total_cycles: totalCycles,
      completed_cycles: completedCycles,
      interrupted_cycles: interruptedCycles,
      total_focus_minutes: totalFocusMinutes,
      total_break_minutes: totalBreakMinutes,
      productivity_score: productivityScore,
      cycles: list
    })
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

