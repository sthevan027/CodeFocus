// Lista issues de um repositório
import { requireAuth } from '../../../lib/auth'
import { createClient } from '@supabase/supabase-js'
import { getRequestId, log } from '../../../lib/logger'

export default async function handler(req, res) {
  const requestId = getRequestId(req)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { owner, repo } = req.query || {}
  if (!owner || !repo) {
    return res.status(400).json({ error: 'owner e repo são obrigatórios' })
  }

  let userId
  try {
    const auth = await requireAuth(req)
    userId = auth.userId
  } catch {
    return res.status(401).json({ error: 'Não autenticado' })
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return res.status(500).json({ error: 'Configuração inválida' })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: settings } = await admin
    .from('user_settings')
    .select('github_access_token')
    .eq('user_id', userId)
    .single()

  if (!settings?.github_access_token) {
    return res.status(400).json({ error: 'GitHub não conectado', needs_connect: true })
  }

  try {
    const resp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=50`,
      {
        headers: {
          Authorization: `Bearer ${settings.github_access_token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )

    if (!resp.ok) {
      if (resp.status === 401) {
        return res.status(400).json({ error: 'Token expirado', needs_connect: true })
      }
      throw new Error(`GitHub API: ${resp.status}`)
    }

    const issues = await resp.json()
    const list = issues
      .filter((i) => !i.pull_request)
      .map((i) => ({
        id: i.id,
        number: i.number,
        title: i.title,
        state: i.state,
        html_url: i.html_url,
      }))

    return res.status(200).json({ issues: list })
  } catch (err) {
    log('error', 'Erro ao listar issues', { requestId, error: err?.message })
    return res.status(500).json({ error: 'Erro ao buscar issues' })
  }
}
