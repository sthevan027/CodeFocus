import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navigation = ({ activeView, onViewChange, onLogout }) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'timer', label: 'Timer', icon: '⏱️', tooltip: 'Timer Pomodoro' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', tooltip: 'Estatísticas de Produtividade' },
    { id: 'tasks', label: 'Tarefas', icon: '📝', tooltip: 'Gerenciar Tarefas e Tags' },
    { id: 'spotify', label: 'Música', icon: '🎵', tooltip: 'Integração Spotify' },
    { id: 'settings', label: 'Configurações', icon: '⚙️', tooltip: 'Preferências do Sistema' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-20 bg-gray-900/95 backdrop-blur-sm border-r border-white/10 flex flex-col items-center py-6 z-40">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
          <img src="/logo-main.png" alt="CodeFocus" className="w-8 h-8 object-contain" />
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col gap-2 w-full px-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`relative group w-full py-3 rounded-xl transition-all duration-200 ${
              activeView === item.id
                ? 'bg-blue-600/20 text-blue-400'
                : 'hover:bg-white/10 text-gray-400 hover:text-white'
            }`}
            aria-label={item.label}
          >
            <span className="text-2xl">{item.icon}</span>
            
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
              {item.tooltip}
            </div>

            {/* Active Indicator */}
            {activeView === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-r-full" />
            )}
          </button>
        ))}
      </div>

      {/* User Profile Section */}
      <div className="mt-auto pt-6 border-t border-white/10 w-full px-3">
        <div className="relative group">
          <button
            className="w-full py-3 rounded-xl hover:bg-white/10 transition-all duration-200"
            onClick={() => onViewChange('profile')}
          >
            <div className="w-8 h-8 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </button>
          
          {/* User Menu Tooltip */}
          <div className="absolute left-full ml-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
            {user?.name || 'Usuário'}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full py-3 rounded-xl hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-200 mt-2"
          aria-label="Sair"
        >
          <span className="text-xl">🚪</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;