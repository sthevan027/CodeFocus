// Serviço de autenticação real com Google OAuth
import { OAUTH_CONFIG, AUTH_URLS, isOAuthConfigured } from '../config/oauth';
import apiService from './apiService';
const _AUTH_URLS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  GOOGLE_LOGIN: '/api/auth/google',
  GITHUB_LOGIN: '/api/auth/github',
  REFRESH: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout'
};

class AuthService {
  constructor() {
    this.googleAuth = null;
    // Não inicializar no construtor para evitar problemas com SSR
  }

  // Inicializar o serviço quando necessário
  async ensureInitialized() {
    if (!this.googleAuth) {
      await this.init();
    }
  }

  async init() {
    try {
      // Inicializar Google OAuth apenas se estivermos no browser
      if (typeof window !== 'undefined') {
        await this.initGoogleAuth();
      }
    } catch (error) {
      console.error('Erro ao inicializar AuthService:', error);
    }
  }

  // Buscar dados do Google usando email
  async fetchGoogleUserData(email) {
    try {
      console.log(`Buscando dados do Google para: ${email}`);
      
      // Esta função só deve ser chamada se o usuário estiver autenticado
      if (!this.googleAuth || !this.googleAuth.isSignedIn.get()) {
        console.error('Usuário não está autenticado no Google');
        return null;
      }
      
      const googleUser = this.googleAuth.currentUser.get();
      const profile = googleUser.getBasicProfile();
      
      return {
        name: profile.getName(),
        email: profile.getEmail(),
        avatar: profile.getImageUrl(),
        provider: 'google'
      };
      
    } catch (error) {
      console.error('Erro ao buscar dados do Google:', error);
      return null;
    }
  }

  // Inicializar Google OAuth
  async initGoogleAuth() {
    try {
      console.log('Inicializando Google OAuth...');
      console.log('Client ID:', OAUTH_CONFIG.GOOGLE.CLIENT_ID);
      console.log('OAuth configurado:', isOAuthConfigured());
      
      // Aguardar o Google API carregar
      let attempts = 0;
      const maxAttempts = 30;
      
      while (!window.gapi && attempts < maxAttempts) {
        console.log(`Aguardando Google API carregar... tentativa ${attempts + 1}/${maxAttempts}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
      
      if (!window.gapi) {
        console.error('Google API não carregou após várias tentativas');
        return;
      }
      
      // Inicializar o Google Auth
      await new Promise((resolve, reject) => {
        window.gapi.load('auth2', async () => {
          try {
            console.log('Google Auth2 carregado, inicializando...');
            
            this.googleAuth = await window.gapi.auth2.init({
              client_id: OAUTH_CONFIG.GOOGLE.CLIENT_ID,
              scope: 'email profile'
            });
            
            console.log('Google Auth inicializado com sucesso');
            resolve();
          } catch (error) {
            console.error('Erro ao inicializar Google Auth:', error);
            reject(error);
          }
        });
      });
      
    } catch (error) {
      console.error('Erro ao inicializar Google OAuth:', error);
    }
  }

  // Login com Google
  async loginWithGoogle() {
    try {
      console.log('Iniciando login com Google...');
      await this.ensureInitialized();
      
      if (!this.googleAuth) {
        console.error('❌ Google Auth não inicializado');
        console.error('💡 Configure o Google OAuth seguindo o guia em docs/GOOGLE_OAUTH_SETUP.md');
        return { success: false, error: 'Google OAuth não configurado. Verifique a configuração.' };
      }
      
      // Verificar se já está logado
      if (this.googleAuth.isSignedIn.get()) {
        console.log('Usuário já está logado no Google');
        const googleUser = this.googleAuth.currentUser.get();
        const profile = googleUser.getBasicProfile();
        
        const userData = {
          id: profile.getId(),
          name: profile.getName(),
          email: profile.getEmail(),
          avatar: profile.getImageUrl(),
          provider: 'google',
          loginTime: new Date().toISOString()
        };
        
        console.log('Usuário já logado:', userData);
        return { success: true, user: userData };
      }
      
      // Fazer login
      console.log('Fazendo login com Google...');
      const googleUser = await this.googleAuth.signIn({
        prompt: 'select_account'
      });
      
      const profile = googleUser.getBasicProfile();
      const authResponse = googleUser.getAuthResponse();
      
      // Obter foto em alta qualidade
      let avatarUrl = profile.getImageUrl();
      if (avatarUrl) {
        // Modificar URL para alta qualidade
        avatarUrl = avatarUrl.replace(/s\d+-c/, 's300-c');
      }
      
      const userData = {
        id: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail(),
        avatar: avatarUrl,
        provider: 'google',
        accessToken: authResponse.access_token,
        loginTime: new Date().toISOString()
      };
      
      console.log('✅ Login Google bem-sucedido:', userData);
      return { success: true, user: userData };
      
    } catch (error) {
      console.error('❌ Erro no login com Google:', error);
      
      // Verificar se é um erro específico do Google
      if (error.error === 'popup_closed_by_user') {
        return { success: false, error: 'Login cancelado pelo usuário' };
      }
      
      if (error.error === 'access_denied') {
        return { success: false, error: 'Acesso negado' };
      }
      
      // Retornar erro real sem fallback
      return { success: false, error: error.message };
    }
  }

  // Verificar se há código de autorização na URL
  checkForAuthCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code) {
      console.log('Código de autorização encontrado na URL');
      return { code, state };
    }
    
    return null;
  }

  // Processar callback do Google
  async processGoogleCallback(code) {
    try {
      console.log('Processando callback do Google...');
      
      // Em uma implementação real, você trocaria o código por um token
      // Por enquanto, retornamos erro pois não temos backend configurado
      console.error('Callback do Google não implementado - backend necessário');
      return { success: false, error: 'Callback do Google não implementado' };
      
    } catch (error) {
      console.error('Erro ao processar callback do Google:', error);
      return { success: false, error: error.message };
    }
  }

  // Logout
  async logout(provider) {
    try {
      console.log(`Fazendo logout do ${provider}...`);
      
      if (provider === 'google' && this.googleAuth) {
        await this.googleAuth.signOut();
        console.log('Logout do Google realizado');
      }
      
      return { success: true };
    } catch (error) {
      console.error(`Erro no logout do ${provider}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Verificar status da autenticação
  async checkAuthStatus() {
    try {
      await this.ensureInitialized();
      
      if (this.googleAuth && this.googleAuth.isSignedIn.get()) {
        const googleUser = this.googleAuth.currentUser.get();
        const profile = googleUser.getBasicProfile();
        
        return {
          isAuthenticated: true,
          user: {
            id: profile.getId(),
            name: profile.getName(),
            email: profile.getEmail(),
            avatar: profile.getImageUrl(),
            provider: 'google'
          }
        };
      }
      
      return { isAuthenticated: false };
    } catch (error) {
      console.error('Erro ao verificar status da autenticação:', error);
      return { isAuthenticated: false };
    }
  }
}

const authService = new AuthService();
export default authService; 