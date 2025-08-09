"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const api = await apiClient()
      const form = new FormData()
      form.append('file', file)
      const res = await api.post('/api/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      const dashboardId = res.data?.dashboard?.id
      if (dashboardId) router.push(`/dashboards/${dashboardId}`)
      else router.push('/dashboards')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Falha no upload')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto py-16 px-6">
      <Card>
        <h1 className="text-2xl font-semibold mb-6">Upload de dados</h1>
        <form onSubmit={onUpload} className="space-y-4">
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:text-white file:px-4 file:py-2 file:cursor-pointer"
          />
          {error && <p className="text-red-300 text-sm">{error}</p>}
          <Button disabled={!file || loading} type="submit">{loading ? 'Processando…' : 'Enviar e gerar dashboard'}</Button>
        </form>
      </Card>
    </main>
  )
}