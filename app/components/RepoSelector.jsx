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
    if (pickedRepo?.owner && pickedRepo?.repo) {
      loadIssues(pickedRepo.owner, pickedRepo.repo)
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
        repo: pickedRepo.repo,
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
          <div className="text-white/70 py-8 text-center">Carregando repositórios...</div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-white/70 text-sm mb-2">Repositório</label>
              <select
                value={pickedRepo ? pickedRepo.full_name : ''}
                onChange={(e) => {
                  const full = e.target.value
                  const r = repos.find((x) => x.full_name === full)
                  setPickedRepo(r || null)
                }}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
              >
                <option value="">-- Selecione --</option>
                {repos.map((r) => (
                  <option key={r.id} value={r.full_name}>
                    {r.full_name}
                  </option>
                ))}
              </select>
            </div>

            {pickedRepo && (
              <div className="mb-4">
                <label className="block text-white/70 text-sm mb-2">Issue vinculada (opcional)</label>
                {loadingIssues ? (
                  <p className="text-white/50 text-sm">Carregando issues...</p>
                ) : (
                  <select
                    value={pickedIssue ? pickedIssue.number : ''}
                    onChange={(e) => {
                      const num = e.target.value ? Number(e.target.value) : null
                      const i = issues.find((x) => x.number === num)
                      setPickedIssue(i || null)
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  >
                    <option value="">Nenhuma</option>
                    {issues.map((i) => (
                      <option key={i.id} value={i.number}>
                        #{i.number} - {i.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!pickedRepo || loading}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
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
