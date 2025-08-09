"use client"

import useSWR from 'swr'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { Card } from '@/components/ui/Card'

async function fetchDashboards() {
  const api = await apiClient()
  const { data } = await api.get('/api/dashboards')
  return data as { id: number; title: string }[]
}

export default function DashboardsPage() {
  const { data, error, isLoading } = useSWR('dashboards', fetchDashboards)

  return (
    <main className="max-w-5xl mx-auto py-16 px-6 space-y-6">
      <h1 className="text-3xl font-semibold">Meus dashboards</h1>
      {isLoading && <p>Carregando…</p>}
      {error && <p className="text-red-300">Erro ao carregar</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data?.map(d => (
          <Link key={d.id} href={`/dashboards/${d.id}`}>
            <Card className="hover:bg-white/15 transition cursor-pointer">
              <h2 className="text-xl font-medium">{d.title}</h2>
              <p className="text-white/70 text-sm">Clique para visualizar</p>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}