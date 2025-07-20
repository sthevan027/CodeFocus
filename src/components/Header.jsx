import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Header = ({ onSettingsClick }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="flex justify-between items-center mb-8">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center hover:scale-105 transition-transform">
          <span className="text-white font-bold text-lg">⚡</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">CodeFocus</h1>
          <p className="text-gray-300 text-sm">Produtividade no ritmo do código</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg glass-effect hover:bg-white/20 transition-colors hover:scale-105"
          title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        <button
          onClick={onSettingsClick}
          className="p-2 rounded-lg glass-effect hover:bg-white/20 transition-colors hover:scale-105"
          title="Configurações"
        >
          ⚙️
        </button>
      </div>
    </header>
  );
};

export default Header; 