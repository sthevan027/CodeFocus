import { useState, useEffect } from 'react'
import apiService from '../services/apiService'
import notificationManager from '../utils/notificationUtils'

const RepoSelector = ({ isOpen, onClose, selectedRepo, onSelect, settings }) => {
  const [repos, setRepos] = useState([])
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingIssues, setLoadingIssues] = useState(false)
  const [error, setError] = useState('')
  const [pickedRepo, setPickedRepo] = useState(selectedRepo || null)
  const [pickedIssue, setPickedIssue] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadRepos()
      setPickedRepo(selectedRepo || null)
      setPickedIssue(null)
    }
  }, [isOpen, selectedRepo])

  useEffect(() => {
    const owner = pickedRepo?.owner
    const repo = pickedRepo?.name ?? pickedRepo?.repo
    if (owner && repo) {
      loadIssues(owner, repo)
    } else {
      setIssues([])
    }
  }, [pickedRepo])

  const loadRepos = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiService.getGithubRepos()
      setRepos(data.repos || [])
    } catch (err) {
      if (err.message?.includes('GitHub não conectado') || err.message?.includes('Token expirado')) {
        setError('Conecte sua conta GitHub primeiro.')
        if (typeof window !== 'undefined') {
          window.location.href = apiService.getConnectGithubUrl()
        }
      } else {
        setError(err.message || 'Erro ao carregar repositórios')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadIssues = async (owner, repo) => {
    setLoadingIssues(true)
    try {
      const data = await apiService.getGithubIssues(owner, repo)
      setIssues(data.issues || [])
    } catch (err) {
      setIssues([])
    } finally {
      setLoadingIssues(false)
    }
  }

  const handleSave = async () => {
    if (!pickedRepo) {
      notificationManager.showToast('Selecione um repositório', '', 'warning')
      return
    }
    setLoading(true)
    try {
      await apiService.selectRepo({
        owner: pickedRepo.owner,
        repo: pickedRepo.name ?? pickedRepo.repo,
        full_name: pickedRepo.full_name,
        linked_issue_id: pickedIssue?.number ?? null,
      })
      notificationManager.showToast('Repositório salvo!', pickedRepo.full_name, 'success')
      onSelect && onSelect({ ...pickedRepo, linkedIssue: pickedIssue })
      onClose()
    } catch (err) {
      setError(err.message || 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800/95 backdrop-blur-md border border-white/20 rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Selecionar repositório</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>

        <p className="text-white/70 text-sm mb-4">
          Escolha o repositório em que vai trabalhar hoje e, opcionalmente, vincule uma issue.
        </p>

        {error && <div className="text-red-400 text-sm mb-3">{error}</div>}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/70">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent mb-3" />
            <p className="text-sm">Carregando repositórios...</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-white/80 text-sm font-medium mb-2">Repositório</label>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-white/15 bg-white/5 space-y-1 p-2">
                {repos.length === 0 ? (
                  <p className="text-white/50 text-sm py-4 text-center">Nenhum repositório encontrado</p>
                ) : (
                  repos.map((r) => {
                    const isSelected = pickedRepo?.full_name === r.full_name
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setPickedRepo(r)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                          isSelected
                            ? 'bg-blue-500/30 border border-blue-400/50 text-white shadow-sm'
                            : 'border border-transparent text-white/90 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="text-lg" aria-hidden>📂</span>
                        <span className="font-mono text-sm truncate flex-1">{r.full_name}</span>
                        {r.private && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white/80">privado</span>
                        )}
                        {isSelected && (
                          <span className="text-blue-400" aria-hidden>✓</span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {pickedRepo && (
              <div className="mb-5">
                <label className="block text-white/80 text-sm font-medium mb-2">Issue vinculada (opcional)</label>
                {loadingIssues ? (
                  <p className="text-white/50 text-sm py-2 flex items-center gap-2">
                    <span className="animate-pulse">●</span> Carregando issues...
                  </p>
                ) : (
                  <select
                    value={pickedIssue ? pickedIssue.number : ''}
                    onChange={(e) => {
                      const num = e.target.value ? Number(e.target.value) : null
                      const i = issues.find((x) => x.number === num)
                      setPickedIssue(i || null)
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all"
                  >
                    <option value="" className="bg-gray-800">Nenhuma</option>
                    {issues.map((i) => (
                      <option key={i.id} value={i.number} className="bg-gray-800">
                        #{i.number} — {i.title.length > 45 ? i.title.slice(0, 45) + '…' : i.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 text-white/90 hover:bg-white/15 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!pickedRepo || loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Salvar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default RepoSelector
