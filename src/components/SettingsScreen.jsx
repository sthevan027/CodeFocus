import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SettingsScreen = ({ isOpen, onClose, asPage = false }) => {
  const { user, updateProfile } = useAuth();
  const [settings, setSettings] = useState({
    notifications: true,
    sounds: true,
    autoCommit: false,
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    cyclesBeforeLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    customName: user?.name || '',
    customEmail: user?.email || ''
  });

  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        customName: user.name || '',
        customEmail: user.email || ''
      }));
    }
  }, [user]);

  const handleSave = () => {
    // Salvar configurações no localStorage
    localStorage.setItem('codefocus-settings', JSON.stringify(settings));
    
    // Atualizar perfil do usuário se necessário
    if (settings.customName !== user?.name || settings.customEmail !== user?.email) {
      updateProfile({
        name: settings.customName,
        email: settings.customEmail
      });
    }
    
    if (!asPage && onClose) onClose();
  };

  const handleReset = () => {
    setSettings({
      notifications: true,
      sounds: true,
      autoCommit: false,
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      cyclesBeforeLongBreak: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      customName: user?.name || '',
      customEmail: user?.email || ''
    });
  };

  if (!asPage && !isOpen) return null;

  const Container = ({ children }) => (
    asPage ? (
      <div className="rounded-2xl w-full max-w-5xl mx-auto overflow-hidden">
        {children}
      </div>
    ) : (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-3xl overflow-hidden rounded-2xl">
          {children}
        </div>
      </div>
    )
  );

  return (
    <Container>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">⚙️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Configurações</h2>
              <p className="text-gray-400 text-base">Personalize sua experiência</p>
            </div>
          </div>
          {!asPage && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-xl"
            >
              ✕
            </button>
          )}
        </div>

        {/* Conteúdo Principal */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Durações do Timer */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⏱️</span>
              </div>
              <h3 className="text-lg font-semibold text-white">Durações do Timer</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/90 text-sm mb-2">Foco (minutos)</label>
                <input
                  type="number"
                  value={settings.focusDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, focusDuration: parseInt(e.target.value) || 25 }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="120"
                />
              </div>
              <div>
                <label className="block text-white/90 text-sm mb-2">Pausa Curta (minutos)</label>
                <input
                  type="number"
                  value={settings.shortBreakDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, shortBreakDuration: parseInt(e.target.value) || 5 }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="30"
                />
              </div>
              <div>
                <label className="block text-white/90 text-sm mb-2">Pausa Longa (minutos)</label>
                <input
                  type="number"
                  value={settings.longBreakDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, longBreakDuration: parseInt(e.target.value) || 15 }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="60"
                />
              </div>
            </div>
          </div>

          {/* Configurações de Ciclo */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🔄</span>
              </div>
              <h3 className="text-lg font-semibold text-white">Configurações de Ciclo</h3>
            </div>
            <div>
              <label className="block text-white/90 text-sm mb-2">Ciclos antes da pausa longa</label>
              <input
                type="number"
                value={settings.cyclesBeforeLongBreak}
                onChange={(e) => setSettings(prev => ({ ...prev, cyclesBeforeLongBreak: parseInt(e.target.value) || 4 }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="10"
              />
              <p className="text-gray-400 text-xs mt-2">Quantos ciclos de foco antes de uma pausa longa</p>
            </div>
          </div>

          {/* Início Automático */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">▶️</span>
              </div>
              <h3 className="text-lg font-semibold text-white">Início Automático</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/90 font-medium">Iniciar pausas automaticamente</p>
                  <p className="text-gray-400 text-xs">As pausas começam automaticamente quando o foco termina</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={settings.autoStartBreaks}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoStartBreaks: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/90 font-medium">Iniciar pomodoros automaticamente</p>
                  <p className="text-gray-400 text-xs">Os ciclos de foco começam automaticamente após as pausas</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={settings.autoStartPomodoros}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoStartPomodoros: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Dica de Produtividade */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">☕</span>
              <h3 className="text-lg font-semibold text-white">Dica de Produtividade</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              A técnica Pomodoro clássica usa 25 minutos de foco e 5 minutos de pausa. Ajuste os tempos conforme sua necessidade, mas mantenha a consistência!
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-700">
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            Restaurar Padrão
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            Salvar Configurações
          </button>
        </div>
      </div>
    </Container>
  );
};

export default SettingsScreen; 