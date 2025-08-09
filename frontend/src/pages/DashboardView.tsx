import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from 'chart.js'
import { Line, Bar, Pie, Doughnut, Radar, Scatter } from 'react-chartjs-2'
import { api } from '@/lib/api'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { FiArrowLeft, FiEdit2, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
)

interface DashboardData {
  id: number
  title: string
  description: string
  is_active: boolean
  created_at: string
  data: Array<{
    type: string
    title: string
    data: any
    options?: any
  }>
}

const chartComponents = {
  line: Line,
  bar: Bar,
  pie: Pie,
  doughnut: Doughnut,
  radar: Radar,
  scatter: Scatter,
}

export function DashboardView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [id])

  const loadDashboard = async () => {
    try {
      const response = await api.get(`/dashboards/${id}`)
      setDashboard(response.data)
    } catch (error) {
      toast.error('Erro ao carregar dashboard')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este dashboard?')) return

    try {
      await api.delete(`/dashboards/${id}`)
      toast.success('Dashboard excluído com sucesso')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Erro ao excluir dashboard')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!dashboard) {
    return null
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <FiArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">{dashboard.title}</h1>
            {dashboard.description && (
              <p className="text-gray-400 mt-1">{dashboard.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <FiEdit2 className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300"
          >
            <FiTrash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      {dashboard.data && dashboard.data.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dashboard.data.map((chart, index) => {
            const ChartComponent = chartComponents[chart.type as keyof typeof chartComponents] || Bar
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="glass" className="h-full">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {chart.title}
                  </h3>
                  <div className="h-80">
                    <ChartComponent
                      data={chart.data}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            labels: {
                              color: '#fff',
                            },
                          },
                          tooltip: {
                            backgroundColor: 'rgba(30, 27, 75, 0.9)',
                            borderColor: 'rgba(139, 92, 246, 0.3)',
                            borderWidth: 1,
                          },
                        },
                        scales: chart.type !== 'pie' && chart.type !== 'doughnut' && chart.type !== 'radar' ? {
                          x: {
                            ticks: {
                              color: '#9CA3AF',
                            },
                            grid: {
                              color: 'rgba(255, 255, 255, 0.1)',
                            },
                          },
                          y: {
                            ticks: {
                              color: '#9CA3AF',
                            },
                            grid: {
                              color: 'rgba(255, 255, 255, 0.1)',
                            },
                          },
                        } : undefined,
                        ...chart.options,
                      }}
                    />
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <Card variant="glass" className="text-center py-12">
          <p className="text-gray-400">Nenhum gráfico disponível</p>
        </Card>
      )}

      {/* Footer Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Dashboard criado em{' '}
          {new Date(dashboard.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>
  )
}