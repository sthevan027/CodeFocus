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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Bem-vindo ao CodeFocus</h2>
            <p className="mt-1 text-white/60">
              Complete 3 passos rápidos para começar. ({completedSteps}/3)
            </p>
          </div>
          <button
            onClick={finish}
            className="rounded-lg px-3 py-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Fechar onboarding"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 p-6">
          {/* Step 1 */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-white font-semibold">
                  {settingsClicked ? '✅' : '1.'} Configurações
                </p>
                <p className="text-white/60 text-sm">
                  Ajuste tempos de foco, pausas e notificações no menu lateral.
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
                className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
              >
                Ir para Configurações
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-white font-semibold">
                  {hasTags ? '✅' : '2.'} Tarefas
                </p>
                <p className="text-white/60 text-sm">
                  Crie tags para organizar seus focos (ex.: projeto, tipo de atividade).
                </p>
              </div>
              <button
                onClick={onGoToTags}
                className="shrink-0 rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20 transition-colors"
              >
                Ir para Tarefas
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-white font-semibold">
                  {hasFirstCycle ? '✅' : '3.'} Timer
                </p>
                <p className="text-white/60 text-sm">
                  Inicie seu primeiro ciclo: dê um nome ao foco e clique em "Iniciar Foco".
                </p>
              </div>
              <button
                onClick={onGoToTimer}
                className="shrink-0 rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20 transition-colors"
              >
                Ir para Timer
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/10 p-6">
          <button
            onClick={finish}
            className="rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20 transition-colors"
          >
            Pular
          </button>
          <button
            onClick={finish}
            disabled={completedSteps < 3}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-blue-700"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  )
}

