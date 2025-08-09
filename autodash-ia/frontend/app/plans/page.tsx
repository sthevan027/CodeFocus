"use client"

import useSWR from 'swr'
import { apiClient } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

async function fetchPlans() {
  const api = await apiClient()
  const { data } = await api.get('/api/plans')
  return data as { id: number; name: string; active_dashboard_limit: number; total_dashboard_limit: number }[]
}

export default function PlansPage() {
  const { data, error, isLoading } = useSWR('plans', fetchPlans)

  return (
    <main className="max-w-5xl mx-auto py-16 px-6 space-y-8">
      <h1 className="text-3xl font-semibold">Planos</h1>
      {isLoading && <p>Carregando…</p>}
      {error && <p className="text-red-300">Erro ao carregar</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data?.map(p => (
          <Card key={p.id} className="space-y-3">
            <h2 className="text-xl font-semibold">{p.name}</h2>
            <p className="text-white/80 text-sm">Ativos: {p.active_dashboard_limit} • Totais: {p.total_dashboard_limit}</p>
            <Button disabled>Escolher (em breve)</Button>
          </Card>
        ))}
      </div>
    </main>
  )
}