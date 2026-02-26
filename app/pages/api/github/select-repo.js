// Salva repositório selecionado
import { requireAuth } from '../../../lib/auth'
import { createRlsServerClient } from '../../../lib/supabase'
import { getRequestId, log } from '../../../lib/logger'

export default async function handler(req, res) {
  const requestId = getRequestId(req)
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  let userId, accessToken
  try {
    const auth = await requireAuth(req)
    userId = auth.userId
    accessToken = auth.accessToken
  } catch {
    return res.status(401).json({ error: 'Não autenticado' })
  }

  const { owner, repo, full_name, linked_issue_id } = req.body || {}

  if (!owner || !repo) {
    return res.status(400).json({ error: 'owner e repo são obrigatórios' })
  }

  const selectedRepo = { owner, repo, full_name: full_name || `${owner}/${repo}` }

  try {
    const rls = createRlsServerClient(accessToken)
    const { error } = await rls
      .from('user_settings')
      .update({
        selected_repo: selectedRepo,
        linked_issue_id: linked_issue_id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (error) throw error

    return res.status(200).json({ ok: true })
  } catch (err) {
    log('error', 'Erro ao salvar repo', { requestId, error: err?.message })
    return res.status(500).json({ error: 'Erro ao salvar' })
  }
}
