import { useTimer } from '../context/TimerContext';
import { exportHistoryToJSON, exportDailyReportTxt } from '../utils/exportUtils';

const Settings = ({ isOpen, onClose }) => {
  const { settings, setSettings, completedCycles } = useTimer();

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md glass-effect">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Configurações</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Tempos */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Tempos (minutos)</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  Tempo de Foco
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.focusTime}
                  onChange={(e) => handleSettingChange('focusTime', parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-primary-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  Pausa Curta
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakTime}
                  onChange={(e) => handleSettingChange('shortBreakTime', parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-primary-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  Pausa Longa
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreakTime}
                  onChange={(e) => handleSettingChange('longBreakTime', parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Comportamento */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Comportamento</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.autoStartBreaks}
                  onChange={(e) => handleSettingChange('autoStartBreaks', e.target.checked)}
                  className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                />
                <span className="text-gray-300">Auto-iniciar pausas</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.autoStartPomodoros}
                  onChange={(e) => handleSettingChange('autoStartPomodoros', e.target.checked)}
                  className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                />
                <span className="text-gray-300">Auto-iniciar pomodoros</span>
              </label>
            </div>
          </div>

          {/* Notificações */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Notificações</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
                  className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                />
                <span className="text-gray-300">Notificações desktop</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                  className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                />
                <span className="text-gray-300">Sons de notificação</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => exportHistoryToJSON(completedCycles)}
            className="btn-secondary hover:scale-105 transition-transform mb-2"
          >
            Exportar Histórico (JSON)
          </button>
          <button
            onClick={() => exportDailyReportTxt(completedCycles)}
            className="btn-secondary hover:scale-105 transition-transform"
          >
            Exportar Relatório Diário (.txt)
          </button>
          <button
            onClick={onClose}
            className="btn-primary hover:scale-105 transition-transform mt-2"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 