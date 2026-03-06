/**
 * Hook useTodayStats - SOLID: Dependency Inversion
 * Encapsula a lógica de obter estatísticas do dia.
 * Prioriza API (Supabase) com fallback para localStorage.
 */

import { useState, useCallback, useEffect } from 'react'
import { getTodayStatsFromApi } from '../services/cycleService'

/**
 * Obtém estatísticas do localStorage (fallback quando usuário não está autenticado ou API falha).
 * @param {string|undefined} userId
 * @returns {{sessions: number, minutes: number}}
 */
function getTodayStatsFromLocalStorage(userId) {
  if (typeof window === 'undefined') return { sessions: 0, minutes: 0 }
  try {
    const userKey = userId ? `codefocus-history-${userId}` : 'codefocus-history'
    const raw = localStorage.getItem(userKey) || '[]'
    const history = JSON.parse(raw)
    const today = new Date().toDateString()
    const todaySessions = Array.isArray(history)
      ? history.filter((s) => s?.type === 'session' && new Date(s.timestamp).toDateString() === today)
      : []
    const totalSeconds = todaySessions.reduce((t, s) => t + (s.duration || 0), 0)
    return {
      sessions: todaySessions.length,
      minutes: Math.round(totalSeconds / 60)
    }
  } catch {
    return { sessions: 0, minutes: 0 }
  }
}

/**
 * Hook que retorna Quick Stats (Sessões hoje / Tempo total).
 * Usa API quando usuário está autenticado, fallback para localStorage.
 * @param {{id: string}|null} user - Usuário autenticado
 * @param {boolean} triggerRefresh - Quando muda, força refresh (ex: após completar sessão)
 */
export function useTodayStats(user, triggerRefresh = false) {
  const [stats, setStats] = useState({ sessions: 0, minutes: 0 })

  const refresh = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10)
    if (user?.id) {
      try {
        const apiStats = await getTodayStatsFromApi(today)
        setStats(apiStats)
      } catch {
        setStats(getTodayStatsFromLocalStorage(user.id))
      }
    } else {
      setStats(getTodayStatsFromLocalStorage(user?.id))
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) {
      setStats(getTodayStatsFromLocalStorage(user?.id))
      return
    }
    refresh()
  }, [user?.id, refresh, triggerRefresh])

  return [stats, refresh]
}
