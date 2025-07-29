import React, { useState, useEffect } from 'react';
import { spotifyUtils } from '../config/spotify';
import { useAuth } from '../context/AuthContext';

const SpotifyIntegration = ({ isOpen, onClose }) => {
  const { user: _user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);

  // Configurações do Spotify (não utilizadas atualmente, mas podem ser necessárias)
  const _SPOTIFY_CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
  const _SPOTIFY_REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
  const _SPOTIFY_SCOPES = 'user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative';

  // Verificar conexão com Spotify
  const checkSpotifyConnection = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('spotify_access_token');
      if (token) {
        setIsConnected(true);
        await fetchCurrentTrack();
        await fetchUserPlaylists();
      }
    } catch (error) {
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      checkSpotifyConnection();
    }
  }, [isOpen, checkSpotifyConnection]);

  const connectSpotify = () => {
    const authUrl = spotifyUtils.getAuthUrl();
    window.location.href = authUrl;
  };

  const disconnectSpotify = () => {
    spotifyUtils.removeToken();
    setIsConnected(false);
    setCurrentTrack(null);
    setPlaylists([]);
  };

  const getSpotifyToken = () => {
    return spotifyUtils.getToken();
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
            album: data.item.album.name,
            image: data.item.album.images[0]?.url,
            duration: data.item.duration_ms,
            progress: data.progress_ms
          });
          setIsPlaying(!data.is_playing);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar música atual:', error);
    }
  };

  const fetchUserPlaylists = async () => {
    try {
      const token = getSpotifyToken();
      if (!token) return;

      const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPlaylists(data.items);
      }
    } catch (error) {
      console.error('Erro ao buscar playlists:', error);
    }
  };

  const playPause = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const skipNext = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const skipPrevious = async () => {
    try {
      setLoading(true);
      const token = getSpotifyToken();
      if (!token) return;

      await fetch('https://api.spotify.com/v1/me/player/previous', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setTimeout(() => fetchCurrentTrack(), 1000);
    } catch (error) {
      console.error('Erro ao voltar música:', error);
    } finally {
      setLoading(false);
    }
  };

  const setVolumeLevel = async (newVolume) => {
    try {
      const token = getSpotifyToken();
      if (!token) return;

      await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${newVolume}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setVolume(newVolume);
    } catch (error) {
      console.error('Erro ao ajustar volume:', error);
    }
  };

  const playPlaylist = async (playlistId) => {
    try {
      setLoading(true);
      const token = getSpotifyToken();
      if (!token) return;

      await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          context_uri: `spotify:playlist:${playlistId}`
        })
      });

      setSelectedPlaylist(playlistId);
      setTimeout(() => fetchCurrentTrack(), 1000);
    } catch (error) {
      console.error('Erro ao tocar playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🎵</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Spotify Integration</h1>
              <p className="text-gray-400 text-sm">Controle sua música durante o foco</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!isConnected ? (
            /* Conectar Spotify */
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-green-600 rounded-full mx-auto flex items-center justify-center">
                <span className="text-white text-4xl">🎵</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Conectar Spotify</h2>
                <p className="text-gray-400">
                  Conecte sua conta Spotify para controlar a música diretamente do CodeFocus
                </p>
              </div>
              <button
                onClick={connectSpotify}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                🎵 Conectar Spotify
              </button>
            </div>
          ) : (
            /* Controles do Spotify */
            <div className="space-y-6">
              {/* Música Atual */}
              {currentTrack && (
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-4">🎵 Tocando Agora</h3>
                  <div className="flex items-center space-x-4">
                    {currentTrack.image && (
                      <img
                        src={currentTrack.image}
                        alt={currentTrack.album}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{currentTrack.name}</h4>
                      <p className="text-white/60">{currentTrack.artist}</p>
                      <p className="text-white/40 text-sm">{currentTrack.album}</p>
                    </div>
                  </div>

                  {/* Controles de Reprodução */}
                  <div className="flex items-center justify-center space-x-4 mt-4">
                    <button
                      onClick={skipPrevious}
                      disabled={loading}
                      className="text-white/60 hover:text-white transition-colors disabled:opacity-50"
                    >
                      ⏮️
                    </button>
                    <button
                      onClick={playPause}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-colors disabled:opacity-50"
                    >
                      {isPlaying ? '⏸️' : '▶️'}
                    </button>
                    <button
                      onClick={skipNext}
                      disabled={loading}
                      className="text-white/60 hover:text-white transition-colors disabled:opacity-50"
                    >
                      ⏭️
                    </button>
                  </div>

                  {/* Controle de Volume */}
                  <div className="mt-4">
                    <label className="block text-white/80 text-sm mb-2">Volume</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolumeLevel(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Playlists */}
              {playlists.length > 0 && (
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-4">📚 Suas Playlists</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {playlists.map(playlist => (
                      <button
                        key={playlist.id}
                        onClick={() => playPlaylist(playlist.id)}
                        disabled={loading}
                        className={`text-left p-3 rounded-lg transition-colors ${
                          selectedPlaylist === playlist.id
                            ? 'bg-green-600 text-white'
                            : 'bg-white/5 text-white hover:bg-white/10'
                        } disabled:opacity-50`}
                      >
                        <div className="font-medium">{playlist.name}</div>
                        <div className="text-sm opacity-60">
                          {playlist.tracks.total} músicas
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex justify-between">
                <button
                  onClick={disconnectSpotify}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  🔌 Desconectar
                </button>
                <button
                  onClick={fetchCurrentTrack}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔄 Atualizar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpotifyIntegration; 