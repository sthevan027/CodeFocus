import React, { useState, useEffect } from 'react';

const SpotifyQuickControl = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    checkSpotifyConnection();
  }, []);

  const checkSpotifyConnection = () => {
    const token = localStorage.getItem('spotify-access-token');
    if (token) {
      setIsConnected(true);
      fetchCurrentTrack();
    }
  };

  const getSpotifyToken = () => {
    return localStorage.getItem('spotify-access-token');
  };

  const fetchCurrentTrack = async () => {
    try {
      const token = getSpotifyToken();
      if (!token) return;

      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.item) {
          setCurrentTrack({
            name: data.item.name,
            artist: data.item.artists[0].name,
            image: data.item.album.images[0]?.url
          });
          setIsPlaying(data.is_playing);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar música atual:', error);
    }
  };

  const playPause = async () => {
    try {
      const token = getSpotifyToken();
      if (!token) return;

      const endpoint = isPlaying ? 'pause' : 'play';
      await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setIsPlaying(!isPlaying);
      setTimeout(() => fetchCurrentTrack(), 1000);
    } catch (error) {
      console.error('Erro ao controlar reprodução:', error);
    }
  };

  const skipNext = async () => {
    try {
      const token = getSpotifyToken();
      if (!token) return;

      await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setTimeout(() => fetchCurrentTrack(), 1000);
    } catch (error) {
      console.error('Erro ao pular música:', error);
    }
  };

  if (!isConnected) return null;

  return (
    <div className="relative">
      {/* Botão de Toggle */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="fixed bottom-4 right-4 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-40"
        title="Controle Spotify"
      >
        🎵
      </button>

      {/* Controles Expandidos */}
      {showControls && (
        <div className="fixed bottom-20 right-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 shadow-2xl border border-white/10 z-50 min-w-[280px]">
          {/* Música Atual */}
          {currentTrack && (
            <div className="mb-4">
              <div className="flex items-center space-x-3">
                {currentTrack.image && (
                  <img
                    src={currentTrack.image}
                    alt={currentTrack.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{currentTrack.name}</p>
                  <p className="text-white/60 text-sm truncate">{currentTrack.artist}</p>
                </div>
              </div>
            </div>
          )}

          {/* Controles */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={skipNext}
              className="text-white/60 hover:text-white transition-colors"
              title="Próxima música"
            >
              ⏭️
            </button>
            <button
              onClick={playPause}
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition-colors"
              title={isPlaying ? 'Pausar' : 'Tocar'}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button
              onClick={() => setShowControls(false)}
              className="text-white/60 hover:text-white transition-colors"
              title="Fechar"
            >
              ✕
            </button>
          </div>

          {/* Status */}
          <div className="mt-3 text-center">
            <span className="text-white/40 text-xs">
              {isPlaying ? '🎵 Tocando' : '⏸️ Pausado'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotifyQuickControl; 