import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tempos');
  const [settings, setSettings] = useState({
    // Tempos
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    cyclesBeforeLongBreak: 4,
    
    // Comportamento
    autoStartBreaks: false,
    autoStartPomodoros: false,
    notifications: true,
    sounds: true,
    
    // Perfil
    customName: user?.name || '',
    customEmail: user?.email || ''
  });

  useEffect(() => {
    // Carregar configurações salvas
    const savedSettings = localStorage.getItem(user ? `codefocus-settings-${user.id}` : 'codefocus-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [user]);

  const handleSave = () => {
    // Salvar configurações
    const userKey = user ? `codefocus-settings-${user.id}` : 'codefocus-settings';
    localStorage.setItem(userKey, JSON.stringify(settings));
    
    // Atualizar perfil se necessário
    if (user && (settings.customName !== user.name || settings.customEmail !== user.email)) {
      updateProfile({
        name: settings.customName,
        email: settings.customEmail
      });
    }
    
    // Mostrar feedback
    alert('Configurações salvas com sucesso!');
  };

  const handleExportData = () => {
    const userKey = user ? `codefocus-history-${user.id}` : 'codefocus-history';
    const history = JSON.parse(localStorage.getItem(userKey) || '[]');
    
    const dataStr = JSON.stringify(history, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `codefocus-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const tabs = [
    { id: 'tempos', name: 'Tempos', icon: '⏱️' },
    { id: 'comportamento', name: 'Comportamento', icon: '⚙️' },
    { id: 'notificacoes', name: 'Notificações', icon: '🔔' },
    { id: 'exportacoes', name: 'Exportações', icon: '📤' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Configurações</h1>
          <button
            onClick={() => navigate('/')}
            className="text-white/60 hover:text-white transition-colors"
          >
            ← Voltar
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/10 p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
          {activeTab === 'tempos' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Configurações de Tempo</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 mb-2">Duração do Foco (minutos)</label>
                  <input
                    type="number"
                    value={settings.focusDuration}
                    onChange={(e) => setSettings({...settings, focusDuration: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="60"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 mb-2">Pausa Curta (minutos)</label>
                  <input
                    type="number"
                    value={settings.shortBreakDuration}
                    onChange={(e) => setSettings({...settings, shortBreakDuration: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="30"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 mb-2">Pausa Longa (minutos)</label>
                  <input
                    type="number"
                    value={settings.longBreakDuration}
                    onChange={(e) => setSettings({...settings, longBreakDuration: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="5"
                    max="60"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 mb-2">Ciclos antes da Pausa Longa</label>
                  <input
                    type="number"
                    value={settings.cyclesBeforeLongBreak}
                    onChange={(e) => setSettings({...settings, cyclesBeforeLongBreak: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="2"
                    max="10"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comportamento' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Comportamento do Timer</h2>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                  <div>
                    <span className="text-white">Auto-iniciar pausas</span>
                    <p className="text-white/60 text-sm mt-1">Inicia automaticamente as pausas após completar um foco</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoStartBreaks}
                    onChange={(e) => setSettings({...settings, autoStartBreaks: e.target.checked})}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                  />
                </label>
                
                <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                  <div>
                    <span className="text-white">Auto-iniciar pomodoros</span>
                    <p className="text-white/60 text-sm mt-1">Inicia automaticamente o próximo foco após uma pausa</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoStartPomodoros}
                    onChange={(e) => setSettings({...settings, autoStartPomodoros: e.target.checked})}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'notificacoes' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Notificações e Sons</h2>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                  <div>
                    <span className="text-white">Notificações do navegador</span>
                    <p className="text-white/60 text-sm mt-1">Receba notificações quando um timer terminar</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                  />
                </label>
                
                <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                  <div>
                    <span className="text-white">Sons de alerta</span>
                    <p className="text-white/60 text-sm mt-1">Tocar sons quando os timers terminarem</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.sounds}
                    onChange={(e) => setSettings({...settings, sounds: e.target.checked})}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'exportacoes' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Exportar Dados</h2>
              
              <div className="space-y-4">
                <div className="p-6 bg-white/5 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Exportar histórico de sessões</h3>
                  <p className="text-white/60 text-sm mb-4">
                    Baixe todos os seus dados de produtividade em formato JSON
                  </p>
                  <button
                    onClick={handleExportData}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Exportar Dados
                  </button>
                </div>
                
                <div className="p-6 bg-white/5 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Limpar dados locais</h3>
                  <p className="text-white/60 text-sm mb-4">
                    Remove todos os dados salvos localmente. Esta ação não pode ser desfeita.
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
                        const keys = ['codefocus-history', 'codefocus-settings', 'codefocus-notes', 'codefocus-timer-state'];
                        keys.forEach(key => {
                          localStorage.removeItem(key);
                          if (user) localStorage.removeItem(`${key}-${user.id}`);
                        });
                        alert('Dados limpos com sucesso!');
                        navigate('/');
                      }
                    }}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Limpar Dados
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;