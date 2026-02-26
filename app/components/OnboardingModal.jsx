import { useEffect, useMemo, useState } from 'react'
import apiService from '../services/apiService'

const getKey = (userId, suffix) => `codefocus-onboarding-${suffix}-${userId || 'anon'}`
const getCompletedKey = (userId) => `codefocus-onboarding-completed-${userId || 'anon'}`

export default function OnboardingModal({
  isOpen,
  userId,
  onClose,
  onGoToSettings,
  onGoToTags,
  onGoToTimer,
}) {
  const [settingsClicked, setSettingsClicked] = useState(false)
  const [hasTags, setHasTags] = useState(false)
  const [hasFirstCycle, setHasFirstCycle] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    try {
      setSettingsClicked(localStorage.getItem(getKey(userId, 'settings_clicked')) === 'true')
    } catch {}
  }, [isOpen, userId])

  useEffect(() => {
    if (!isOpen) return

    const refreshTags = () => {
      if (!userId) {
        setHasTags(false)
        return
      }
      apiService
        .getTags()
        .then((tags) => {
          const arr = Array.isArray(tags) ? tags : []
          setHasTags(arr.length > 0)
        })
        .catch(() => setHasTags(false))
    }

    const refreshHistory = () => {
      try {
        const historyKey = userId ? `codefocus-history-${userId}` : 'codefocus-history'
        const history = JSON.parse(localStorage.getItem(historyKey) || '[]')
        setHasFirstCycle(Array.isArray(history) && history.some((h) => h.type === 'session'))
      } catch {
        setHasFirstCycle(false)
      }
    }

    const refresh = () => {
      refreshTags()
      refreshHistory()
    }

    refresh()
    const id = window.setInterval(refresh, 3000)
    return () => window.clearInterval(id)
  }, [isOpen, userId])

  const completedSteps = useMemo(() => {
    return [settingsClicked, hasTags, hasFirstCycle].filter(Boolean).length
  }, [settingsClicked, hasTags, hasFirstCycle])

  if (!isOpen) return null

  const finish = () => {
    try {
      localStorage.setItem(getCompletedKey(userId), 'true')
    } catch {}
    onClose?.()
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm animate-fade-in">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
          <div>
            <h2 className="text-sm font-bold text-white">Bem-vindo</h2>
            <p className="text-xs text-white/60">
              {completedSteps}/3 passos
            </p>
          </div>
          <button
            onClick={finish}
            className="rounded-lg px-2 py-1 text-white/60 hover:bg-white/10 hover:text-white transition-colors text-sm"
            aria-label="Fechar onboarding"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 p-4">
          {/* Step 1 */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {settingsClicked ? '✅' : '1.'} Configurações
              </p>
              <p className="text-white/60 text-xs truncate">
                Ajuste tempos no menu lateral
              </p>
            </div>
            <button
              onClick={() => {
                try {
                  localStorage.setItem(getKey(userId, 'settings_clicked'), 'true')
                } catch {}
                setSettingsClicked(true)
                onGoToSettings?.()
              }}
              className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-white text-sm hover:bg-blue-700 transition-colors"
            >
              Ir
            </button>
          </div>

          {/* Step 2 */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {hasTags ? '✅' : '2.'} Tarefas
              </p>
              <p className="text-white/60 text-xs truncate">
                Crie tags para seus focos
              </p>
            </div>
            <button
              onClick={onGoToTags}
              className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-white text-sm hover:bg-white/20 transition-colors"
            >
              Ir
            </button>
          </div>

          {/* Step 3 */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {hasFirstCycle ? '✅' : '3.'} Timer
              </p>
              <p className="text-white/60 text-xs truncate">
                Inicie seu 1º ciclo
              </p>
            </div>
            <button
              onClick={onGoToTimer}
              className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-white text-sm hover:bg-white/20 transition-colors"
            >
              Ir
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/10 px-4 py-2">
          <button
            onClick={finish}
            className="rounded-lg px-3 py-1.5 text-white/70 text-sm hover:bg-white/10 transition-colors"
          >
            Pular
          </button>
          <button
            onClick={finish}
            disabled={completedSteps < 3}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1.5 text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-blue-700"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  )
}

