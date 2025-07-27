// Configurações do Spotify
export const SPOTIFY_CONFIG = {
  CLIENT_ID: process.env.REACT_APP_SPOTIFY_CLIENT_ID || 'your_spotify_client_id',
  REDIRECT_URI: process.env.REACT_APP_SPOTIFY_REDIRECT_URI || 'http://localhost:3000/spotify/callback',
  SCOPES: [
    'user-read-private',
    'user-read-email',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'playlist-read-private',
    'playlist-modify-public',
    'playlist-modify-private'
  ].join(' '),
  API_BASE_URL: 'https://api.spotify.com/v1',
  AUTH_URL: 'https://accounts.spotify.com/authorize'
};

// Funções utilitárias do Spotify
export const spotifyUtils = {
  // Gerar URL de autorização
  getAuthUrl: () => {
    const params = new URLSearchParams({
      client_id: SPOTIFY_CONFIG.CLIENT_ID,
      response_type: 'token',
      redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
      scope: SPOTIFY_CONFIG.SCOPES,
      show_dialog: 'true'
    });
    
    return `${SPOTIFY_CONFIG.AUTH_URL}?${params.toString()}`;
  },

  // Verificar se está conectado
  isConnected: () => {
    return !!localStorage.getItem('spotify-access-token');
  },

  // Obter token
  getToken: () => {
    return localStorage.getItem('spotify-access-token');
  },

  // Salvar token
  saveToken: (token) => {
    localStorage.setItem('spotify-access-token', token);
  },

  // Remover token
  removeToken: () => {
    localStorage.removeItem('spotify-access-token');
  },

  // Fazer requisição para API do Spotify
  apiRequest: async (endpoint, options = {}) => {
    const token = spotifyUtils.getToken();
    if (!token) {
      throw new Error('Token do Spotify não encontrado');
    }

    const response = await fetch(`${SPOTIFY_CONFIG.API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Spotify: ${response.status}`);
    }

    return response.json();
  }
};

export default SPOTIFY_CONFIG; 