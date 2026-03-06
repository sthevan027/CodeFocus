/**
 * Serviço de Ciclos - SOLID: Single Responsibility
 * Responsável por persistir ciclos e obter estatísticas diárias.
 * Abstrai a fonte de dados (API Supabase) para os consumidores.
 */

import apiService from './apiService'

/**
 * Cria um ciclo no Supabase (persistência).
 * @param {Object} params
 * @param {string} params.name - Nome do ciclo
 * @param {number} params.durationSeconds - Duração em segundos (será convertida para minutos)
 * @param {string} params.phase - focus | shortBreak | longBreak
 * @param {string} [params.gitCommit] - Commit Git opcional (git_commit na API)
 * @param {string} [params.gitFiles] - Arquivos Git opcional (git_files na API)
 * @returns {Promise<Object|null>} Ciclo criado ou null em caso de erro
 */
export async function createCycle({ name, durationSeconds, phase, gitCommit, gitFiles }) {
  const durationMinutes = Math.max(1, Math.round(durationSeconds / 60))
  const payload = {
    name: name || `${phase} session`,
    duration: durationMinutes,
    phase,
    git_commit: gitCommit || undefined,
    git_files: gitFiles || undefined,
    completed: true
  }
  try {
    return await apiService.createCycle(payload)
  } catch (err) {
    console.error('Erro ao persistir ciclo no Supabase:', err)
    return null
  }
}

/**
 * Obtém estatísticas do dia atual da API.
 * @param {string} date - Data no formato YYYY-MM-DD
 * @returns {Promise<{sessions: number, minutes: number}>}
 * @throws {Error} Em caso de falha na API (para permitir fallback no consumidor)
 */
export async function getTodayStatsFromApi(date) {
  const data = await apiService.getDailyStats(date)
  const totalFocusMinutes = data?.total_focus_minutes ?? 0
  const totalBreakMinutes = data?.total_break_minutes ?? 0
  const totalCycles = data?.total_cycles ?? 0
  return {
    sessions: totalCycles,
    minutes: Math.round(totalFocusMinutes + totalBreakMinutes)
  }
}
