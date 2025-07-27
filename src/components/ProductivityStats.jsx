import React, { useState } from 'react';

const ProductivityStats = ({ stats, onRefresh }) => {
  const [timeRange, setTimeRange] = useState('week');

  const getTimeRangeData = () => {
    const now = new Date();
    let startDate, endDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate };
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Filtros de Tempo */}
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-bold text-white">Estatísticas Detalhadas</h2>
        <div className="flex bg-white/10 rounded-lg p-1">
          {[
            { value: 'week', label: 'Semana' },
            { value: 'month', label: 'Mês' },
            { value: 'year', label: 'Ano' }
          ].map(range => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range.value
                  ? 'bg-blue-600 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Tempo Focado</h3>
            <span className="text-2xl">⏱️</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatTime(stats.totalFocusTime)}
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Total acumulado
          </p>
        </div>

        <div className="bg-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Sessões</h3>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.totalSessions}
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Sessões completadas
          </p>
        </div>

        <div className="bg-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Média/Sessão</h3>
            <span className="text-2xl">📈</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.averageSessionLength}m
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Duração média
          </p>
        </div>

        <div className="bg-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Meta Semanal</h3>
            <span className="text-2xl">🎯</span>
          </div>
          <div className="text-2xl font-bold text-white">
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
      </div>

      {/* Estatísticas por Tag */}
      {Object.keys(stats.tags).length > 0 && (
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Tempo por Tag</h3>
          <div className="space-y-3">
            {Object.entries(stats.tags)
              .sort(([,a], [,b]) => b.time - a.time)
              .map(([tag, data]) => (
                <div key={tag} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-400 font-medium">#{tag}</span>
                    <span className="text-white/60 text-sm">
                      {data.sessions} sessões
                    </span>
                  </div>
                  <div className="text-white font-semibold">
                    {formatTime(data.time)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Resumo de Atividades */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Atividades Recentes</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {stats.recentActivities.slice(0, 10).map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-blue-400">
                  {activity.type === 'session' ? '⏱️' : '📝'}
                </span>
                <div>
                  <p className="text-white font-medium">
                    {activity.name || 'Sessão de Foco'}
                  </p>
                  <p className="text-white/60 text-sm">
                    {formatDate(activity.timestamp)}
                  </p>
                </div>
              </div>
              <div className="text-white/60 text-sm">
                {activity.duration ? formatTime(activity.duration) : activity.message}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Atualizar
        </button>
        <button
          onClick={() => {
            // Exportar dados
            const data = {
              stats,
              exportDate: new Date().toISOString(),
              timeRange
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `codefocus-stats-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          📊 Exportar
        </button>
      </div>
    </div>
  );
};

export default ProductivityStats; 