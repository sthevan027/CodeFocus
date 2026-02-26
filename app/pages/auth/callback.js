import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase-browser'

const API_BASE = typeof window !== 'undefined' ? '/api' : ''

export default function AuthCallbackPage() {
  const router = useRouter()
  const { code, error: oauthError } = router.query
  const [status, setStatus] = useState('Processando login...')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!router.isReady) return

    // Suporta error vindo de query (?error=xxx) - redirecionamento do API route
    const err = oauthError || router.query.error

    if (err) {
      const msg = err === 'provider_not_enabled' || String(err).includes('not enabled')
        ? 'Provedor (Google/GitHub) não habilitado. Habilite em Supabase > Authentication > Providers.'
        : `Erro de autenticação: ${err}`
      setStatus(msg)
      setFailed(true)
      return
    }

    if (!code) {
      setStatus('Nenhum código de autorização recebido.')
      setFailed(true)
      return
    }

    const exchangeAndSetCookies = async () => {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          console.error('Erro ao trocar código por sessão:', error)
          setStatus('Falha ao completar o login. Tente novamente.')
          setFailed(true)
          return
        }

        if (!data?.session) {
          setStatus('Sessão não retornada.')
          setFailed(true)
          return
        }

        setStatus('Finalizando...')

        const resp = await fetch(`${API_BASE}/auth/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
          })
        })

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}))
          throw new Error(err.error || 'Erro ao salvar sessão')
        }

        router.replace('/')
      } catch (err) {
        console.error('Erro no callback OAuth:', err)
        setStatus(err.message || 'Erro ao completar login.')
        setFailed(true)
      }
    }

    exchangeAndSetCookies()
  }, [router.isReady, code, oauthError, router.query.error, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 flex items-center justify-center">
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 border border-white/10 text-center">
        {!failed ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
            <p className="text-white">{status}</p>
          </>
        ) : (
          <>
            <p className="text-red-400 mb-6">{status}</p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Voltar ao início
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
