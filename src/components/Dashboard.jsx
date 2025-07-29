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
    recentActivities: []
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
        recentActivities: history.slice(0, 20) // Últimas 20 atividades
      });
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (!user) return null; // Ensure user is logged in

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📊</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard de Produtividade</h1>
              <p className="text-gray-400 text-sm">Análise completa do seu foco</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {[
            { id: 'overview', name: 'Visão Geral', icon: '📈' },
            { id: 'stats', name: 'Estatísticas', icon: '📊' },
            { id: 'tags', name: 'Tags', icon: '🏷️' },
            { id: 'notes', name: 'Notas', icon: '📝' },
            { id: 'charts', name: 'Gráficos', icon: '📉' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Cards de Estatísticas */}
              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Tempo Total Focado</h3>
                  <span className="text-2xl">⏱️</span>
                </div>
                <div className="text-3xl font-bold text-white">
                  {Math.round(stats.totalFocusTime / 3600)}h {Math.round((stats.totalFocusTime % 3600) / 60)}m
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  {stats.totalSessions} sessões completadas
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Meta Semanal</h3>
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="text-3xl font-bold text-white">
                  {stats.weeklyProgress}%
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(stats.weeklyProgress, 100)}%` }}
                  ></div>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  {stats.weeklyGoal}h por semana
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Sessão Média</h3>
                  <span className="text-2xl">📊</span>
                </div>
                <div className="text-3xl font-bold text-white">
                  {stats.averageSessionLength}m
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Duração média por sessão
                </p>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <ProductivityStats stats={stats} onRefresh={loadDashboardData} />
          )}

          {activeTab === 'tags' && (
            <TagManager 
              tags={stats.tags} 
              onUpdate={loadDashboardData}
              userId={user?.id}
            />
          )}

          {activeTab === 'notes' && (
            <QuickNotes 
              activities={stats.recentActivities}
              onUpdate={loadDashboardData}
              userId={user?.id}
            />
          )}

          {activeTab === 'charts' && (
            <ProgressCharts stats={stats} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 