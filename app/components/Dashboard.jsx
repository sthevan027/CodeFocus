import React, { useState, useEffect } from 'react';
import ProductivityStats from './ProductivityStats';
import ProgressCharts from './ProgressCharts';
import QuickNotes from './QuickNotes';
import { useAuth } from '../context/AuthContext';
import TagManager from './TagManager';

const Dashboard = ({ onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
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
    recentCommits: []
  });

  // Função para carregar dados do dashboard
  const loadDashboardData = React.useCallback(() => {
    try {
      const userKey = user ? `codefocus-history-${user.id}` : 'codefocus-history';
      const history = JSON.parse(localStorage.getItem(userKey) || '[]');
      
      const today = new Date().toDateString();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const todaySessions = history.filter(session => 
        new Date(session.timestamp).toDateString() === today && session.type === 'session'
      );
      
      const weekSessions = history.filter(session => 
        new Date(session.timestamp) >= weekAgo && session.type === 'session'
      );
      
      const todayFocus = todaySessions.reduce((total, session) => total + (session.duration || 0), 0);
      const weekFocus = weekSessions.reduce((total, session) => total + (session.duration || 0), 0);

      // Carregar commits registrados (salvos pelo GitCommitModal)
      const commitsKey = user ? `codefocus-commits-${user.id}` : 'codefocus-commits';
      const commits = JSON.parse(localStorage.getItem(commitsKey) || '[]');
      
      // Calcular produtividade
      const focusSessions = todaySessions.filter(s => s.phase === 'focus');
      const productivity = focusSessions.length > 0 ? (focusSessions.length / (focusSessions.length + 1)) * 100 : 0;

      // Calcular estatísticas completas
      const totalFocusTime = history.reduce((total, session) => total + (session.duration || 0), 0);
      const totalSessions = history.filter(s => s.type === 'session').length;
      const averageSessionLength = totalSessions > 0 ? Math.round(totalFocusTime / totalSessions / 60) : 0;

      // Calcular progresso semanal (simplificado)
      const weeklyProgress = Math.min(Math.round((weekFocus / (40 * 60)) * 100), 100);

      // Calcular tags
      const tags = {};
      history.forEach(session => {
        if (session.tags && Array.isArray(session.tags)) {
          session.tags.forEach(tag => {
            if (!tags[tag]) {
              tags[tag] = { time: 0, sessions: 0 };
            }
            tags[tag].time += session.duration || 0;
            tags[tag].sessions += 1;
          });
        }
      });

      setStats({
        todayFocus: Math.round(todayFocus / 60), // em minutos
        weekFocus: Math.round(weekFocus / 60),
        totalCycles: history.filter(s => s.type === 'session').length,
        productivity: Math.round(productivity),
        totalFocusTime,
        totalSessions,
        averageSessionLength,
        weeklyProgress,
        weeklyGoal: 40,
        tags,
        recentActivities: history.slice(0, 20), // Últimas 20 atividades
        recentCommits: Array.isArray(commits) ? commits.slice(0, 15) : [] // Últimos 15 commits
      });
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (!user) return null; // Ensure user is logged in

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