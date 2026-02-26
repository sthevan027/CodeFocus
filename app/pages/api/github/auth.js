// Inicia fluxo OAuth para conectar GitHub (acesso a repositórios)
import { requireAuth } from '../../../lib/auth'

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    await requireAuth(req)
  } catch {
    return res.status(401).json({ error: 'Não autenticado' })
  }

  if (!GITHUB_CLIENT_ID) {
    return res.status(500).json({
      error: 'GitHub OAuth não configurado. Defina GITHUB_CLIENT_ID no ambiente.',
    })
  }

  const scope = 'repo read:user'
  const redirectUri = `${APP_URL}/api/github/callback`
  const state = Buffer.from(JSON.stringify({ ts: Date.now() })).toString('base64')
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`

  res.redirect(302, url)
}
