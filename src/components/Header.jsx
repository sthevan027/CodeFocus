import React from 'react';
import UserProfile from './UserProfile';

const Header = ({ onSettingsClick, onEditProfile, onDashboardClick, onSpotifyClick }) => {
  return (
    <div className="mb-8">
      {/* Header Principal */}
      <header className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform overflow-hidden">
              <img src="/logo-raio.png" alt="CodeFocus Logo" className="w-12 h-12 object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">CodeFocus</h1>
              <p className="text-gray-300 text-base">Produtividade Dev no Ritmo do Código</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onDashboardClick}
            className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-200 hover:scale-105 shadow-lg"
            title="Dashboard"
          >
            <span className="text-xl">📊</span>
          </button>
          
          <button
            onClick={onSettingsClick}
            className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-200 hover:scale-105 shadow-lg"
            title="Configurações"
          >
            <span className="text-xl">⚙️</span>
          </button>

          <UserProfile 
            onEditProfile={onEditProfile}
            onOpenSettings={onSettingsClick}
          />
        </div>
      </header>

      {/* Spotify Button - Abaixo do Header */}
      <div className="flex justify-end">
        <button
          onClick={onSpotifyClick}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 shadow-lg flex items-center space-x-2"
          title="Conectar Spotify"
        >
          <span className="text-lg">🎵</span>
          <span>Conectar Spotify</span>
        </button>
      </div>
    </div>
  );
};

export default Header; 