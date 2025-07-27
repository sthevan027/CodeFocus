import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const UserProfile = ({ onEditProfile, onOpenSettings }) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) return null;

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'google':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        );
      case 'github':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      case 'anonymous':
        return '❓';
      default:
        return '👤';
    }
  };

  const getProviderName = (provider) => {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'github':
        return 'GitHub';
      case 'anonymous':
        return 'Anônimo';
      default:
        return 'Desconhecido';
    }
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const handleEditProfile = () => {
    setShowDropdown(false);
    if (onEditProfile) {
      onEditProfile();
    }
  };

  const handleOpenSettings = () => {
    setShowDropdown(false);
    if (onOpenSettings) {
      onOpenSettings();
    }
  };

  return (
    <div className="relative">
      {/* Botão do Perfil */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 hover:bg-white/20"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:block text-sm">{user.name}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown do Perfil */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-50">
          {/* Cabeçalho do Perfil */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">{user.name}</h3>
                <p className="text-white/60 text-sm">{user.email}</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs">{getProviderIcon(user.provider)}</span>
                  <span className="text-white/50 text-xs ml-1">
                    {getProviderName(user.provider)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Informações da Sessão */}
          <div className="p-4 border-b border-white/10">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Login:</span>
                <span className="text-white/80">
                  {new Date(user.loginTime).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60">ID:</span>
                <span className="text-white/80 font-mono text-xs">
                  {user.id.slice(-8)}
                </span>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="p-2">
            <button
              onClick={handleEditProfile}
              className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
            >
              ✏️ Editar Perfil
            </button>
            
            <button
              onClick={handleOpenSettings}
              className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
            >
              ⚙️ Configurações
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-2"
            >
              🚪 Sair
            </button>
          </div>
        </div>
      )}

      {/* Overlay para fechar dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default UserProfile; 