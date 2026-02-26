// Callback OAuth GitHub - troca code por token e salva em user_settings
import { requireAuth } from '../../../lib/auth'
import { createRlsServerClient } from '../../../lib/supabase'
import { getRequestId, log } from '../../../lib/logger'

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export default async function handler(req, res) {
  const requestId = getRequestId(req)
  const { code, error: oauthError } = req.query || {}

  if (oauthError) {
    log('warn', 'GitHub OAuth error', { requestId, error: oauthError })
    return res.redirect(302, `${APP_URL}/?github_error=${encodeURIComponent(oauthError)}`)
  }

  if (!code) {
    return res.redirect(302, `${APP_URL}/?github_error=no_code`)
  }

  let userId
  try {
    const auth = await requireAuth(req)
    userId = auth.userId
  } catch {
    return res.redirect(302, `${APP_URL}/?github_error=not_authenticated`)
  }

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    log('error', 'GitHub OAuth não configurado', { requestId })
    return res.redirect(302, `${APP_URL}/?github_error=config`)
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${APP_URL}/api/github/callback`,
      }),
    })
    const tokenData = await tokenRes.json()

    if (tokenData.error) {
      log('warn', 'GitHub token exchange failed', { requestId, error: tokenData.error })
      return res.redirect(302, `${APP_URL}/?github_error=token_exchange`)
    }

    const accessToken = tokenData.access_token
    if (!accessToken) {
      return res.redirect(302, `${APP_URL}/?github_error=no_token`)
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return res.redirect(302, `${APP_URL}/?github_error=config`)
    }

    const { createClient } = await import('@supabase/supabase-js')
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { error } = await admin
      .from('user_settings')
      .update({
        github_access_token: accessToken,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (error) {
      log('error', 'Erro ao salvar token GitHub', { requestId, error: error.message })
      return res.redirect(302, `${APP_URL}/?github_error=save`)
    }

    return res.redirect(302, `${APP_URL}/?github_connected=1`)
  } catch (err) {
    log('error', 'Erro no callback GitHub', { requestId, error: err?.message || String(err) })
    return res.redirect(302, `${APP_URL}/?github_error=server`)
  }
}
