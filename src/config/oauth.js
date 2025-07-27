// Configurações OAuth para Google

// Para usar autenticação real, você precisa:
// 1. Criar um projeto no Google Cloud Console
// 2. Substituir os valores abaixo pelos seus

export const OAUTH_CONFIG = {
  // Google OAuth
  GOOGLE: {
    CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID || '263837308438-b6hk644i1a1roi3tsnd0egpt6c32m1qm.apps.googleusercontent.com',
    CLIENT_SECRET: process.env.REACT_APP_GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
    REDIRECT_URI: process.env.REACT_APP_GOOGLE_REDIRECT_URI || 'http://localhost:3000',
    SCOPE: 'email profile'
  }
};

// URLs de autorização
export const AUTH_URLS = {
  GOOGLE: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${OAUTH_CONFIG.GOOGLE.CLIENT_ID}&redirect_uri=${encodeURIComponent(OAUTH_CONFIG.GOOGLE.REDIRECT_URI)}&scope=${encodeURIComponent(OAUTH_CONFIG.GOOGLE.SCOPE)}&response_type=code`
};

// Verificar se as credenciais estão configuradas
export const isOAuthConfigured = () => {
  return OAUTH_CONFIG.GOOGLE.CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID';
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