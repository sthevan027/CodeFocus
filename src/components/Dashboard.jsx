import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProductivityStats from './ProductivityStats';
import ActivityHistory from './ActivityHistory';
import TagManager from './TagManager';
import QuickNotes from './QuickNotes';
import ProgressCharts from './ProgressCharts';

const Dashboard = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalFocusTime: 0,
    totalSessions: 0,
    averageSessionLength: 0,
    weeklyGoal: 25, // horas por semana
    weeklyProgress: 0,
    tags: {},
    recentActivities: []
  });

  useEffect(() => {
    if (isOpen) {
      loadDashboardData();
    }
  }, [isOpen, user]);

  const loadDashboardData = () => {
    try {
      // Carregar dados do localStorage
      const history = JSON.parse(localStorage.getItem(`codefocus-history-${user?.id}`) || '[]');
      const notes = JSON.parse(localStorage.getItem(`codefocus-notes-${user?.id}`) || '[]');
      const tags = JSON.parse(localStorage.getItem(`codefocus-tags-${user?.id}`) || '{}');

      // Calcular estatísticas
      const totalFocusTime = history.reduce((total, session) => {
        return total + (session.duration || 0);
      }, 0);

      const totalSessions = history.length;
      const averageSessionLength = totalSessions > 0 ? Math.round(totalFocusTime / totalSessions / 60) : 0;

      // Calcular progresso semanal
      const now = new Date();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const weeklySessions = history.filter(session => {
        const sessionDate = new Date(session.timestamp);
        return sessionDate >= weekStart && sessionDate < weekEnd;
      });

      const weeklyTime = weeklySessions.reduce((total, session) => {
        return total + (session.duration || 0);
      }, 0);

      const weeklyProgress = Math.round((weeklyTime / (stats.weeklyGoal * 3600)) * 100);

      // Processar tags
      const tagStats = {};
      history.forEach(session => {
        if (session.tags && session.tags.length > 0) {
          session.tags.forEach(tag => {
            if (!tagStats[tag]) {
              tagStats[tag] = { time: 0, sessions: 0 };
            }
            tagStats[tag].time += session.duration || 0;
            tagStats[tag].sessions += 1;
          });
        }
      });

      // Atividades recentes (últimas 10)
      const recentActivities = [...history, ...notes]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

      setStats({
        totalFocusTime,
        totalSessions,
        averageSessionLength,
        weeklyGoal: stats.weeklyGoal,
        weeklyProgress,
        tags: tagStats,
        recentActivities
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  };

  if (!isOpen) return null;

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