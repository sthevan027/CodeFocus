import React, { useState, useEffect, useCallback } from 'react';
import ProgressCharts from './ProgressCharts';
import QuickNotes from './QuickNotes';
import { useAuth } from '../context/AuthContext';
import TagManager from './TagManager';
import apiService from '../services/apiService';

const Dashboard = ({ onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingOfflineFallback, setUsingOfflineFallback] = useState(false);
  const [stats, setStats] = useState({
    todayFocus: 0,
    weekFocus: 0,
    totalCycles: 0,
    productivity: 0,
    totalFocusTime: 0,
    totalSessions: 0,
    averageSessionLength: 0,
    weeklyProgress: 0,
    weeklyGoal: 40,
    tags: {},
    recentActivities: [],
    recentCommits: [],
    dailyBreakdown: []
  });

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setUsingOfflineFallback(false);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [overview, daily, weekly, cycles] = await Promise.all([
        apiService.getCycleStats(),
        apiService.getDailyStats(today),
        apiService.getWeeklyStats(),
        apiService.getCycles(0, 20)
      ]);

      const todayFocus = daily?.total_focus_minutes ?? 0;
      const weekFocus = weekly?.total_focus_minutes ?? 0;
      const weeklyGoal = 40;
      const weeklyProgress = Math.min(Math.round((weekFocus / (weeklyGoal * 60)) * 100), 100);

      const recentActivities = (cycles || []).map((c) => ({
        id: c.id,
        name: c.name,
        phase: c.phase,
        duration: (c.duration || 0) * 60,
        timestamp: c.created_at,
        tags: []
      }));

      const recentCommits = (cycles || [])
        .filter((c) => c.git_commit)
        .slice(0, 15)
        .map((c) => ({
          id: c.id,
          message: c.git_commit,
          cycleName: c.name,
          timestamp: c.created_at
        }));

      setStats({
        todayFocus: Math.round(todayFocus),
        weekFocus: Math.round(weekFocus),
        totalCycles: overview?.total_cycles ?? 0,
        productivity: overview?.productivity_score ?? 0,
        totalFocusTime: (overview?.total_focus_minutes ?? 0) * 60,
        totalSessions: overview?.total_cycles ?? 0,
        averageSessionLength: Math.round(overview?.average_cycle_duration ?? 0),
        weeklyProgress,
        weeklyGoal,
        tags: {},
        recentActivities,
        recentCommits,
        dailyBreakdown: weekly?.daily_breakdown ?? []
      });
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      // Fallback: dados locais quando API falha (offline, 401, etc.)
      try {
        const userKey = user?.id ? `codefocus-history-${user.id}` : 'codefocus-history';
        const raw = localStorage.getItem(userKey) || '[]';
        const history = JSON.parse(raw);
        const sessions = Array.isArray(history) ? history.filter((s) => s?.type === 'session') : [];
        const today = new Date().toDateString();
        const todaySessions = sessions.filter((s) => new Date(s.timestamp).toDateString() === today);
        const todayFocus = Math.round(todaySessions.reduce((t, s) => t + (s.duration || 0), 0) / 60);
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const weekSessions = sessions.filter((s) => new Date(s.timestamp) >= weekStart);
        const weekFocus = Math.round(weekSessions.reduce((t, s) => t + (s.duration || 0), 0) / 60);
        const weeklyGoal = 40;
        const weeklyProgress = Math.min(Math.round((weekFocus / (weeklyGoal * 60)) * 100), 100);
        const recentActivities = sessions.slice(0, 20).map((s) => ({
          id: s.id,
          name: s.name || `${s.phase} session`,
          phase: s.phase,
          duration: s.duration || 0,
          timestamp: s.timestamp,
          tags: s.tags || []
        }));
        setStats({
          todayFocus,
          weekFocus,
          totalCycles: sessions.length,
          productivity: Math.min(100, Math.round((sessions.length / 4) * 25)),
          totalFocusTime: sessions.reduce((t, s) => t + (s.duration || 0), 0),
          totalSessions: sessions.length,
          averageSessionLength: sessions.length ? Math.round(sessions.reduce((t, s) => t + (s.duration || 0), 0) / sessions.length / 60) : 0,
          weeklyProgress,
          weeklyGoal,
          tags: {},
          recentActivities,
          recentCommits: [],
          dailyBreakdown: []
        });
        setError(null);
        setUsingOfflineFallback(true);
        setLoading(false);
        return;
      } catch (fallbackErr) {
        console.error('Fallback localStorage falhou:', fallbackErr);
      }
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p className="text-white/60">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: '📊' },
    { id: 'charts', label: 'Gráficos', icon: '📈' },
    { id: 'notes', label: 'Notas', icon: '📝' },
    { id: 'tags', label: 'Tags', icon: '🏷️' },
  ];

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard de Produtividade</h1>
        <p className="text-white/60 text-lg">Acompanhe seu progresso e melhore sua performance</p>
        {usingOfflineFallback && (
          <p className="mt-2 px-4 py-2 bg-amber-500/20 text-amber-200 rounded-lg text-sm">
            Modo offline — exibindo dados locais. Reconecte para sincronizar com o Supabase.
          </p>
        )}
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Foco Hoje</span>
            <span className="text-2xl">⏱️</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.todayFocus} min</p>
          <p className="text-white/40 text-sm mt-1">
            {stats.todayFocus > 120 ? '🔥 Excelente!' : stats.todayFocus > 60 ? '👍 Bom progresso' : '💪 Continue assim'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Produtividade</span>
            <span className="text-2xl">📈</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.productivity}%</p>
          <div className="mt-2 bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.productivity}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Ciclos Completos</span>
            <span className="text-2xl">🎯</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalCycles}</p>
          <p className="text-white/40 text-sm mt-1">Total de sessões</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Média por Sessão</span>
            <span className="text-2xl">⏳</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.averageSessionLength} min</p>
          <p className="text-white/40 text-sm mt-1">Duração média</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Weekly Progress */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                <span>📊</span> Progresso Semanal
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Meta: {stats.weeklyGoal} horas</span>
                  <span className="text-white font-medium">{Math.round(stats.weekFocus / 60)} horas concluídas</span>
                </div>
                <div className="bg-white/10 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-400 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${stats.weeklyProgress}%` }}
                  />
                </div>
                <p className="text-white/40 text-sm">
                  {stats.weeklyProgress >= 100 ? '🎉 Meta alcançada!' : `${100 - stats.weeklyProgress}% restante para a meta`}
                </p>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                <span>🕐</span> Atividades Recentes
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
                {stats.recentActivities.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
                    <p className="text-white font-medium mb-2">Ainda sem atividades</p>
                    <p className="text-white/50 text-sm">
                      Inicie seu primeiro ciclo no Timer para ver estatísticas e histórico aqui.
                    </p>
                  </div>
                ) : (
                  stats.recentActivities.slice(0, 10).map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.phase === 'focus' ? 'bg-red-400' : 
                          activity.phase === 'shortBreak' ? 'bg-blue-400' : 'bg-green-400'
                        }`} />
                        <div>
                          <p className="text-white font-medium">{activity.name}</p>
                          <p className="text-white/40 text-sm">
                            {new Date(activity.timestamp).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(activity.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{Math.round(activity.duration / 60)} min</p>
                        {activity.tags && activity.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {activity.tags.map((tag, i) => (
                              <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded-full text-white/60">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Commits Registrados */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                <span>💾</span> Commits Registrados
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
                {stats.recentCommits.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
                    <p className="text-white font-medium mb-2">Nenhum commit registrado</p>
                    <p className="text-white/50 text-sm">
                      Ao finalizar um ciclo de foco (ou antes, com &quot;Salvar progresso&quot;), registre o commit para acompanhar aqui.
                    </p>
                  </div>
                ) : (
                  stats.recentCommits.map((commit) => (
                    <div
                      key={commit.id}
                      className="flex items-start gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-300">📝</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{commit.message}</p>
                        <p className="text-white/50 text-sm mt-1">
                          {commit.cycleName && <span className="text-white/60">{commit.cycleName} • </span>}
                          {new Date(commit.timestamp).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(commit.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'charts' && (
          <ProgressCharts stats={stats} />
        )}

        {activeTab === 'notes' && (
          <QuickNotes />
        )}

        {activeTab === 'tags' && (
          <TagManager />
        )}
      </div>
    </div>
  );
};

export default Dashboard; 