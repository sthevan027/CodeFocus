// Configurações OAuth

export const OAUTH_CONFIG = {
  GOOGLE: {
    CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
    CLIENT_SECRET: process.env.REACT_APP_GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
    REDIRECT_URI: process.env.REACT_APP_GOOGLE_REDIRECT_URI || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
    SCOPE: 'email profile'
  },
  GITHUB: {
    CLIENT_ID: process.env.REACT_APP_GITHUB_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID',
    CLIENT_SECRET: process.env.REACT_APP_GITHUB_CLIENT_SECRET || 'YOUR_GITHUB_CLIENT_SECRET',
    REDIRECT_URI: process.env.REACT_APP_GITHUB_REDIRECT_URI || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
    SCOPE: 'read:user user:email'
  }
};

// URLs de autorização
export const AUTH_URLS = {
  GOOGLE: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${OAUTH_CONFIG.GOOGLE.CLIENT_ID}&redirect_uri=${encodeURIComponent(OAUTH_CONFIG.GOOGLE.REDIRECT_URI)}&scope=${encodeURIComponent(OAUTH_CONFIG.GOOGLE.SCOPE)}&response_type=code&state=google`,
  GITHUB: `https://github.com/login/oauth/authorize?client_id=${OAUTH_CONFIG.GITHUB.CLIENT_ID}&redirect_uri=${encodeURIComponent(OAUTH_CONFIG.GITHUB.REDIRECT_URI)}&scope=${encodeURIComponent(OAUTH_CONFIG.GITHUB.SCOPE)}&state=github`
};

export const isOAuthConfigured = () => {
  return (
    OAUTH_CONFIG.GOOGLE.CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID' ||
    OAUTH_CONFIG.GITHUB.CLIENT_ID !== 'YOUR_GITHUB_CLIENT_ID'
  );
};

// Instruções para configurar OAuth
export const OAUTH_SETUP_INSTRUCTIONS = {
  GOOGLE: {
    title: 'Configurar Google OAuth',
    steps: [
      '1. Acesse https://console.cloud.google.com',
      '2. Crie um novo projeto ou selecione um existente',
      '3. Vá para "APIs & Services" > "Credentials"',
      '4. Clique em "Create Credentials" > "OAuth 2.0 Client IDs"',
      '5. Configure as URIs de redirecionamento autorizadas',
      '6. Copie o Client ID e Client Secret',
      '7. Substitua no arquivo de configuração'
    ]
  }
}; 