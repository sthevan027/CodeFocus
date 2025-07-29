import { useEffect } from 'react';

const SpotifyCallback = () => {
  useEffect(() => {
    // Extrair token da URL
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const error = params.get('error');

    if (error) {
      console.error('Erro na autenticação Spotify:', error);
      window.close();
      return;
    }

    if (accessToken) {
      // Salvar token
      localStorage.setItem('spotify-access-token', accessToken);
      
      // Fechar popup e notificar parent
      if (window.opener) {
        window.opener.postMessage({ type: 'SPOTIFY_CONNECTED', token: accessToken }, '*');
      }
      
      // Fechar popup
      window.close();
    } else {
      console.error('Token não encontrado na URL');
      window.close();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-white/70">Conectando com Spotify...</p>
      </div>
    </div>
  );
};

export default SpotifyCallback; 