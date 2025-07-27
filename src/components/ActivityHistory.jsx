import React from 'react';

const ActivityHistory = ({ activities }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold">Histórico de Atividades</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {activities.map((activity, index) => (
          <div key={activity.id || index} className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-blue-400">
                  {activity.type === 'session' ? '⏱️' : '📝'}
                </span>
                <div>
                  <p className="text-white font-medium">
                    {activity.name || 'Atividade'}
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityHistory; 