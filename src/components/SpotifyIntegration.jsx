import React from 'react';

const SpotifyIntegration = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-white/10">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🎵</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Integração com Spotify</h1>
              <p className="text-gray-400 text-sm">Em breve</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors text-2xl">✕</button>
        </div>
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-white text-xl font-semibold mb-2">Em breve</h2>
          <p className="text-white/70">Estamos finalizando a integração com o Spotify para você controlar a música direto do CodeFocus.</p>
        </div>
      </div>
    </div>
  );
};

export default SpotifyIntegration; 