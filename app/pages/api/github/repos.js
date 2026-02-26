// Lista repositórios do usuário no GitHub
import { requireAuth } from '../../../lib/auth'
import { createClient } from '@supabase/supabase-js'
import { getRequestId, log } from '../../../lib/logger'

export default async function handler(req, res) {
  const requestId = getRequestId(req)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
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
    return res.status(400).json({
      error: 'GitHub não conectado',
      needs_connect: true,
    })
  }

  try {
    const resp = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        Authorization: `Bearer ${settings.github_access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!resp.ok) {
      if (resp.status === 401) {
        return res.status(400).json({
          error: 'Token GitHub expirado',
          needs_connect: true,
        })
      }
      throw new Error(`GitHub API: ${resp.status}`)
    }

    const repos = await resp.json()
    const list = repos.map((r) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      owner: r.owner?.login,
      private: r.private,
      html_url: r.html_url,
    }))

    return res.status(200).json({ repos: list })
  } catch (err) {
    log('error', 'Erro ao listar repos GitHub', { requestId, error: err?.message })
    return res.status(500).json({ error: 'Erro ao buscar repositórios' })
  }
}
