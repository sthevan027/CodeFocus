"use client"

import { useState } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const supabase = getSupabaseClient()
      if (isRegister) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
      router.push('/upload')
    } catch (err: any) {
      setError(err.message ?? 'Falha na autenticação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex items-center justify-center py-24 px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card>
          <h1 className="text-2xl font-semibold mb-6">{isRegister ? 'Criar conta' : 'Entrar'}</h1>
          <form onSubmit={submit} className="space-y-4">
            <input
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 outline-none"
              placeholder="E-mail"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 outline-none"
              placeholder="Senha"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-300 text-sm">{error}</p>}
            <div className="flex items-center gap-3">
              <Button disabled={loading} type="submit">{loading ? 'Aguarde…' : isRegister ? 'Registrar' : 'Entrar'}</Button>
              <button type="button" className="text-white/70 underline" onClick={() => setIsRegister(v => !v)}>
                {isRegister ? 'Já tenho conta' : 'Criar conta'}
              </button>
            </div>
          </form>
        </Card>
      </motion.div>
    </main>
  )
}