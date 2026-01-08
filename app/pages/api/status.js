import { createAdminClient } from '../../lib/supabase'
import { getRequestId, log } from '../../lib/logger'

export default async function handler(req, res) {
  const requestId = getRequestId(req)
  res.setHeader('x-request-id', requestId)

  try {
    const supabase = createAdminClient()
    const startedAt = Date.now()

    // Ping simples no banco (service role) para validar conectividade
    const { error } = await supabase.from('profiles').select('id').limit(1)
    const latencyMs = Date.now() - startedAt

    if (error) {
      log('error', 'Status check falhou', { requestId, error: error.message })
      return res.status(503).json({
        ok: false,
        service: 'codefocus',
        supabase: { ok: false, error: error.message },
        time: new Date().toISOString()
      })
    }

    return res.status(200).json({
      ok: true,
      service: 'codefocus',
      supabase: { ok: true, latency_ms: latencyMs },
      time: new Date().toISOString()
    })
  } catch (e) {
    log('error', 'Status check erro inesperado', { requestId, error: e?.message || String(e) })
    return res.status(503).json({
      ok: false,
      service: 'codefocus',
      time: new Date().toISOString()
    })
  }
}

