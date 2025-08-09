"use client"

import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { apiClient } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Line, Pie, Doughnut, Radar, Scatter } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, ArcElement, BarElement, LineElement, PointElement, RadialLinearScale, Tooltip, Legend, Filler)

async function fetchDashboard(id: string) {
  const api = await apiClient()
  const { data } = await api.get(`/api/dashboards/${id}`)
  return data as { id: number; title: string; charts_json: string }
}

function ChartRenderer({ chart }: { chart: any }) {
  const type = chart.type as string
  const data = chart.data
  const options = chart.options || { responsive: true }
  switch (type) {
    case 'bar':
      return <Bar data={data} options={options} />
    case 'line':
      return <Line data={data} options={options} />
    case 'pie':
      return <Pie data={data} options={options} />
    case 'doughnut':
      return <Doughnut data={data} options={options} />
    case 'radar':
      return <Radar data={data} options={options} />
    case 'scatter':
      return <Scatter data={data} options={options} />
    default:
      return <p>Tipo de gráfico não suportado: {type}</p>
  }
}

export default function DashboardDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const { data, error, isLoading } = useSWR(id ? `dashboard-${id}` : null, () => fetchDashboard(id))

  if (!id) return null

  return (
    <main className="max-w-5xl mx-auto py-16 px-6 space-y-6">
      {isLoading && <p>Carregando…</p>}
      {error && <p className="text-red-300">Erro ao carregar</p>}
      {data && (
        <>
          <h1 className="text-3xl font-semibold">{data.title}</h1>
          <div className="space-y-6">
            {(() => {
              let charts: any[] = []
              try { charts = JSON.parse(data.charts_json) } catch { charts = [] }
              return charts.map((c, idx) => (
                <Card key={idx}>
                  <ChartRenderer chart={c} />
                </Card>
              ))
            })()}
          </div>
        </>
      )}
    </main>
  )
}