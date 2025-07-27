import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SettingsScreen = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [settings, setSettings] = useState({
    notifications: true,
    sounds: true,
    autoCommit: false,
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    customName: user?.name || '',
    customEmail: user?.email || ''
  });

  const [activeTab, setActiveTab] = useState('general');

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
    
    onClose();
  };

  const handleReset = () => {
    setSettings({
      notifications: true,
      sounds: true,
      autoCommit: false,
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      customName: user?.name || '',
      customEmail: user?.email || ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">⚙️ Configurações</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
          {[
            { id: 'general', label: 'Geral', icon: '⚙️' },
            { id: 'timer', label: 'Timer', icon: '⏱️' },
            { id: 'notifications', label: 'Notificações', icon: '🔔' },
            { id: 'profile', label: 'Perfil', icon: '👤' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo das Tabs */}
        <div className="space-y-6">
          {/* Tab Geral */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">🎯 Comportamento</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.autoCommit}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoCommit: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                    />
                    <span className="text-white/80">Commit automático após ciclos de foco</span>
                  </label>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">📊 Dados</h3>
                <div className="space-y-3">
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    📤 Exportar Dados
                  </button>
                  <button className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    🗑️ Limpar Dados
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab Timer */}
          {activeTab === 'timer' && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">⏱️ Durações (minutos)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Foco</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={settings.focusDuration}
                      onChange={(e) => setSettings(prev => ({ ...prev, focusDuration: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Pausa Curta</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.shortBreakDuration}
                      onChange={(e) => setSettings(prev => ({ ...prev, shortBreakDuration: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Pausa Longa</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.longBreakDuration}
                      onChange={(e) => setSettings(prev => ({ ...prev, longBreakDuration: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Notificações */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">🔔 Notificações</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                    />
                    <span className="text-white/80">Notificações desktop</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.sounds}
                      onChange={(e) => setSettings(prev => ({ ...prev, sounds: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                    />
                    <span className="text-white/80">Sons de notificação</span>
                  </label>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">🎵 Testar Notificações</h3>
                <div className="space-y-2">
                  <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    🔔 Testar Notificação
                  </button>
                  <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    🔊 Testar Som
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab Perfil */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">👤 Informações do Perfil</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Nome</label>
                    <input
                      type="text"
                      value={settings.customName}
                      onChange={(e) => setSettings(prev => ({ ...prev, customName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Email</label>
                    <input
                      type="email"
                      value={settings.customEmail}
                      onChange={(e) => setSettings(prev => ({ ...prev, customEmail: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">🔐 Conta</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user?.name || 'Usuário'}</p>
                      <p className="text-white/60 text-sm">{user?.email || 'email@exemplo.com'}</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-xs">
                    Provedor: {user?.provider || 'Desconhecido'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-white/10">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-white/70 hover:text-white transition-colors"
          >
            Resetar
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen; 