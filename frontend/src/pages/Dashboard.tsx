import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { FiPlus, FiBarChart2, FiClock, FiCheckCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Dashboard {
  id: number
  title: string
  description: string
  is_active: boolean
  created_at: string
  charts_config: any[]
}

interface PlanLimits {
  plan: string
  active_limit: number
  total_limit: number
  current_active: number
  current_total: number
  can_create: boolean
  can_activate: boolean
}

export function Dashboard() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [limits, setLimits] = useState<PlanLimits | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [dashboardsRes, limitsRes] = await Promise.all([
        api.get('/dashboards'),
        api.get('/dashboards/limits/check')
      ])
      
      setDashboards(dashboardsRes.data)
      setLimits(limitsRes.data)
    } catch (error) {
      toast.error('Erro ao carregar dashboards')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Meus Dashboards</h1>
        <p className="text-gray-400">Gerencie seus dashboards automáticos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card variant="glass">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/20 rounded-lg">
              <FiBarChart2 className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Dashboards</p>
              <p className="text-2xl font-bold text-white">
                {limits?.current_total || 0} / {limits?.total_limit || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="glass">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Dashboards Ativos</p>
              <p className="text-2xl font-bold text-white">
                {limits?.current_active || 0} / {limits?.active_limit || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="glass">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <FiClock className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Plano Atual</p>
              <p className="text-2xl font-bold text-white capitalize">
                {limits?.plan || 'Free'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Dashboards Recentes</h2>
        <Link to="/upload">
          <Button disabled={!limits?.can_create}>
            <FiPlus className="w-4 h-4 mr-2" />
            Novo Dashboard
          </Button>
        </Link>
      </div>

      {/* Dashboards Grid */}
      {dashboards.length === 0 ? (
        <Card variant="glass" className="text-center py-12">
          <FiBarChart2 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Nenhum dashboard ainda
          </h3>
          <p className="text-gray-400 mb-6">
            Faça upload de seus dados para criar seu primeiro dashboard
          </p>
          <Link to="/upload">
            <Button>
              <FiPlus className="w-4 h-4 mr-2" />
              Criar Dashboard
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard, index) => (
            <motion.div
              key={dashboard.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/dashboard/${dashboard.id}`}>
                <Card variant="glass" hover className="h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      {dashboard.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        dashboard.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {dashboard.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  
                  {dashboard.description && (
                    <p className="text-sm text-gray-400 mb-4">
                      {dashboard.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{dashboard.charts_config.length} gráficos</span>
                    <span>
                      {new Date(dashboard.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upgrade CTA */}
      {limits && limits.plan === 'free' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card variant="glass" className="text-center gradient-accent p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Precisa de mais dashboards?
            </h3>
            <p className="text-gray-200 mb-6">
              Faça upgrade para o plano Pro e tenha até 8 dashboards ativos
            </p>
            <Link to="/pricing">
              <Button variant="secondary" size="lg">
                Ver Planos
              </Button>
            </Link>
          </Card>
        </motion.div>
      )}
    </div>
  )
}