import { createServerClient } from '../../../lib/supabase'
import { requireAuth } from '../../../lib/auth'
import { reportGenerateSchema } from '../../../lib/validations'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const supabase = createServerClient()

  try {
    const userId = await requireAuth(req)
    const validatedData = reportGenerateSchema.parse(req.body)

    // Buscar ciclos no período
    const { data: cycles, error: cyclesError } = await supabase
      .from('cycles')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', validatedData.start_date)
      .lte('start_time', validatedData.end_date)

    if (cyclesError) {
      console.error('Erro ao buscar ciclos:', cyclesError)
      return res.status(500).json({ error: 'Erro ao gerar relatório' })
    }

    // Calcular estatísticas
    const totalCycles = cycles?.length || 0
    const completedCycles = cycles?.filter(c => c.completed).length || 0
    const interruptedCycles = cycles?.filter(c => c.interrupted).length || 0
    // duration no banco é em MINUTOS
    const totalFocusMinutes = cycles
      ?.filter(c => c.phase === 'focus' && c.completed)
      .reduce((sum, c) => sum + c.duration, 0) || 0
    const totalBreakMinutes = cycles
      ?.filter(c => ['shortBreak', 'longBreak'].includes(c.phase) && c.completed)
      .reduce((sum, c) => sum + c.duration, 0) || 0

    // Calcular score de produtividade
    let productivityScore = 0
    if (totalCycles > 0) {
      const completionRate = completedCycles / totalCycles
      const focusEfficiency = (totalFocusMinutes + totalBreakMinutes) > 0
        ? totalFocusMinutes / (totalFocusMinutes + totalBreakMinutes)
        : 0
      productivityScore = Math.round((completionRate * 0.6 + focusEfficiency * 0.4) * 100)
    }

    // Preparar dados dos ciclos
    const cyclesData = cycles?.map(c => ({
      id: c.id,
      name: c.name,
      duration: c.duration,
      phase: c.phase,
      completed: c.completed,
      interrupted: c.interrupted,
      git_commit: c.git_commit,
      start_time: c.start_time,
      end_time: c.end_time
    })) || []

    // Criar relatório
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        report_type: validatedData.report_type,
        report_date: validatedData.start_date,
        total_cycles: totalCycles,
        completed_cycles: completedCycles,
        interrupted_cycles: interruptedCycles,
        total_focus_time: totalFocusMinutes,
        total_break_time: totalBreakMinutes,
        productivity_score: productivityScore,
        include_git_data: validatedData.include_git_data,
        include_statistics: validatedData.include_statistics,
        include_charts: validatedData.include_charts,
        cycles_data: cyclesData
      })
      .select()
      .single()

    if (reportError) {
      console.error('Erro ao criar relatório:', reportError)
      return res.status(500).json({ error: 'Erro ao criar relatório' })
    }

    // TODO: Gerar arquivo do relatório se necessário

    return res.status(201).json(report)
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

