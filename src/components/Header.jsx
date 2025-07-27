import React from 'react';
import UserProfile from './UserProfile';

const Header = ({ onSettingsClick, onEditProfile }) => {
  return (
    <header className="flex justify-between items-center mb-8">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:scale-105 transition-transform">
          <span className="text-white font-bold text-lg">⚡</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">CodeFocus</h1>
          <p className="text-gray-300 text-sm">Produtividade no ritmo do código</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onSettingsClick}
          className="p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors hover:scale-105"
          title="Configurações"
        >
          ⚙️
        </button>

        <UserProfile 
          onEditProfile={onEditProfile}
          onOpenSettings={onSettingsClick}
        />
      </div>
    </header>
  );
};

export default Header; 