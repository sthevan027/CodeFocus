import { useState, useEffect } from 'react';

const ProgressCharts = ({ stats }) => {
  const [timeRange, setTimeRange] = useState('week');
  const [chartData, setChartData] = useState({
    daily: [],
    weekly: [],
    tags: []
  });

  useEffect(() => {
    generateChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, timeRange]);

  const generateChartData = () => {
    const tags = Object.entries(stats.tags || {}).map(([tag, data]) => ({
      name: tag,
      time: data.time,
      sessions: data.sessions
    }));

    const daily = (stats.dailyBreakdown || []).map((d) => {
      const date = new Date(d.date);
      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
      const timeSeconds = (d.total_focus_minutes || 0) * 60;
      return {
        day: dayName,
        time: timeSeconds,
        sessions: d.sessions || 0
      };
    });

    const weekly = [];
    setChartData({ daily, weekly, tags });
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getMaxValue = (data, key) => {
    return Math.max(...data.map(item => item[key]), 1);
  };

  const getBarHeight = (value, maxValue) => {
    return Math.max((value / maxValue) * 100, 5);
  };

  return (
    <div className="space-y-6">
      {/* Filtros de Tempo */}
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-bold text-white">Gráficos de Progresso</h2>
        <div className="flex bg-white/10 rounded-lg p-1">
          {[
            { value: 'week', label: 'Semana' },
            { value: 'month', label: 'Mês' },
            { value: 'tags', label: 'Tags' }
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

      {/* Gráfico Diário */}
      {timeRange === 'week' && (
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Atividade Diária (últimos 7 dias)</h3>
          {chartData.daily.length === 0 ? (
            <div className="py-12 text-center text-white/50">
              Nenhum dado de foco nos últimos 7 dias. Complete ciclos no Timer para ver estatísticas aqui.
            </div>
          ) : (
          <div className="flex items-end justify-between h-48 space-x-2">
            {chartData.daily.map((day, index) => {
              const maxTime = getMaxValue(chartData.daily, 'time');
              const barHeight = getBarHeight(day.time, maxTime);
              
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="text-white/60 text-xs mb-2 text-center">
                    {formatTime(day.time)}
                  </div>
                  <div className="w-full bg-gray-700 rounded-t-lg relative" style={{ height: '120px' }}>
                    <div
                      className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-500 hover:to-blue-300"
                      style={{ height: `${barHeight}%` }}
                    />
                  </div>
                  <div className="text-white/80 text-xs mt-2 text-center">
                    {day.day}
                  </div>
                  <div className="text-white/60 text-xs mt-1">
                    {day.sessions} sessões
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* Gráfico Semanal */}
      {timeRange === 'month' && (
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Atividade Semanal (últimas 4 semanas)</h3>
          {chartData.weekly.length === 0 ? (
            <div className="py-12 text-center text-white/50">
              Dados semanais ainda não disponíveis. Esta funcionalidade será implementada em breve.
            </div>
          ) : (
          <div className="flex items-end justify-between h-48 space-x-4">
            {chartData.weekly.map((week, index) => {
              const maxTime = getMaxValue(chartData.weekly, 'time');
              const barHeight = getBarHeight(week.time, maxTime);
              
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="text-white/60 text-xs mb-2 text-center">
                    {formatTime(week.time)}
                  </div>
                  <div className="w-full bg-gray-700 rounded-t-lg relative" style={{ height: '120px' }}>
                    <div
                      className="bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all duration-300 hover:from-green-500 hover:to-green-300"
                      style={{ height: `${barHeight}%` }}
                    />
                  </div>
                  <div className="text-white/80 text-xs mt-2 text-center">
                    {week.week}
                  </div>
                  <div className="text-white/60 text-xs mt-1">
                    {week.sessions} sessões
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* Gráfico de Tags */}
      {timeRange === 'tags' && (
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Tempo por Tag</h3>
          {chartData.tags.length === 0 ? (
            <div className="py-12 text-center text-white/50">
              Nenhuma tag registrada. As tags serão exibidas quando houver suporte no banco de dados.
            </div>
          ) : (
          <div className="space-y-4">
            {chartData.tags
              .sort((a, b) => b.time - a.time)
              .slice(0, 8)
              .map((tag, index) => {
                const maxTime = getMaxValue(chartData.tags, 'time');
                const barWidth = getBarHeight(tag.time, maxTime);
                const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
                
                return (
                  <div key={tag.name} className="flex items-center space-x-4">
                    <div className="w-20 text-white/80 text-sm">
                      #{tag.name}
                    </div>
                    <div className="flex-1 bg-gray-700 rounded-full h-4 relative">
                      <div
                        className="h-4 rounded-full transition-all duration-300"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: colors[index % colors.length]
                        }}
                      />
                    </div>
                    <div className="w-24 text-white/60 text-sm text-right">
                      {formatTime(tag.time)}
                    </div>
                    <div className="w-16 text-white/60 text-xs text-right">
                      {tag.sessions} sessões
                    </div>
                  </div>
                );
              })}
          </div>
          )}
        </div>
      )}

      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Melhor Dia</h3>
          {chartData.daily.length > 0 ? (() => {
            const bestDay = chartData.daily.reduce((best, current) => 
              current.time > best.time ? current : best
            );
            return (
              <div>
                <div className="text-2xl font-bold text-white">
                  {bestDay.day}
                </div>
                <p className="text-white/60 text-sm">
                  {formatTime(bestDay.time)} • {bestDay.sessions} sessões
                </p>
              </div>
            );
          })() : (
            <p className="text-white/50 text-sm">Sem dados</p>
          )}
        </div>

        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Média Diária</h3>
          {chartData.daily.length > 0 ? (() => {
            const avgTime = chartData.daily.reduce((sum, day) => sum + day.time, 0) / chartData.daily.length;
            const avgSessions = chartData.daily.reduce((sum, day) => sum + day.sessions, 0) / chartData.daily.length;
            return (
              <div>
                <div className="text-2xl font-bold text-white">
                  {formatTime(avgTime)}
                </div>
                <p className="text-white/60 text-sm">
                  {Math.round(avgSessions)} sessões por dia
                </p>
              </div>
            );
          })() : (
            <p className="text-white/50 text-sm">Sem dados</p>
          )}
        </div>

        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Tags Mais Usadas</h3>
          {chartData.tags.length > 0 ? (() => {
            const topTag = chartData.tags[0];
            return (
              <div>
                <div className="text-2xl font-bold text-white">
                  #{topTag.name}
                </div>
                <p className="text-white/60 text-sm">
                  {formatTime(topTag.time)} • {topTag.sessions} sessões
                </p>
              </div>
            );
          })() : (
            <p className="text-white/50 text-sm">Sem tags</p>
          )}
        </div>
      </div>

      {/* Exportar Gráficos */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            const data = {
              chartData,
              timeRange,
              exportDate: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `codefocus-charts-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          📊 Exportar Gráficos
        </button>
      </div>
    </div>
  );
};

export default ProgressCharts; 