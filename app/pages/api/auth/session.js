// Recebe tokens OAuth (após exchangeCodeForSession) e define cookies httpOnly
import { setAuthCookies } from '../../../lib/auth'
import { createAnonServerClient } from '../../../lib/supabase'
import { getRequestId, log } from '../../../lib/logger'

export default async function handler(req, res) {
  const requestId = getRequestId(req)
  res.setHeader('x-request-id', requestId)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { access_token, refresh_token } = req.body || {}

    if (!access_token || !refresh_token) {
      return res.status(400).json({ error: 'access_token e refresh_token são obrigatórios' })
    }

    const supabase = createAnonServerClient()
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token
    })

    if (error || !data?.session) {
      log('warn', 'Sessão OAuth inválida', { requestId, error: error?.message })
      return res.status(401).json({ error: 'Sessão inválida. Tente novamente.' })
    }

    setAuthCookies(res, data.session)

    return res.status(200).json({ ok: true })
  } catch (error) {
    log('error', 'Erro ao definir sessão OAuth', { requestId, error: error?.message || String(error) })
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
