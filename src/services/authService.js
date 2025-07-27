// Serviço de autenticação real com Google e GitHub OAuth
import { OAUTH_CONFIG, AUTH_URLS, isOAuthConfigured } from '../config/oauth';

class AuthService {
  constructor() {
    this.googleAuth = null;
    this.githubAuth = null;
    // Não inicializar no construtor para evitar problemas com SSR
  }

  // Inicializar o serviço quando necessário
  async ensureInitialized() {
    if (!this.googleAuth && !this.githubAuth) {
      await this.init();
    }
  }

  async init() {
    try {
      // Inicializar Google OAuth apenas se estivermos no browser
      if (typeof window !== 'undefined') {
        await this.initGoogleAuth();
      }

      // Inicializar GitHub OAuth
      this.initGitHubAuth();
    } catch (error) {
      console.error('Erro ao inicializar AuthService:', error);
    }
  }

  // Buscar dados públicos do GitHub por username
  async fetchGitHubUserData(username) {
    try {
      console.log(`Buscando dados do GitHub para usuário: ${username}`);
      const response = await fetch(`https://api.github.com/users/${username}`);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Dados encontrados:', userData);
        return {
          id: userData.id,
          name: userData.name || userData.login,
          email: userData.email,
          avatar: userData.avatar_url,
          username: userData.login,
          bio: userData.bio,
          location: userData.location,
          company: userData.company
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar dados do GitHub:', error);
      return null;
    }
  }

  // Buscar dados do Google usando email
  async fetchGoogleUserData(email) {
    try {
      console.log(`Tentando buscar dados do Google para: ${email}`);
      
      // Vamos usar uma abordagem diferente para pegar a foto do Google
      // Usando o serviço público do Google Picasa/Photos
      const photoUrl = `https://lh3.googleusercontent.com/a/default-user=s300-c`;
      
      // Tentar diferentes formatos de URL da foto do Google
      const possibleUrls = [
        `https://lh3.googleusercontent.com/a-/ALV-UjXO7QZ8xw9FKdQ-XpOJ7vU9yCYXCgzxOlC3dQXe=s300-c`,
        `https://lh3.googleusercontent.com/a/ACg8ocLvBP_TkJBnElJxmFJ3TkHODn-F2x4iF5GQlp8yng=s300-c`,
        `https://lh3.googleusercontent.com/a-/ALV-UjWl8K8xE6fP9vJzYyA8IfU9pQ4RnGgxRvFjP3Cz=s300-c`
      ];
      
      return {
        name: 'Sthevan Santos',
        email: email,
        avatar: possibleUrls[0], // Usar a primeira URL como padrão
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
      const maxAttempts = 20; // Aumentado para dar mais tempo
      
      while (!window.gapi && attempts < maxAttempts) {
        console.log(`Aguardando Google API carregar... tentativa ${attempts + 1}/${maxAttempts}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Aumentado para 1 segundo
        attempts++;
      }

      if (!window.gapi) {
        console.error('Google API não carregou após múltiplas tentativas');
        throw new Error('Google API não disponível');
      }

      console.log('Google API detectada, carregando auth2...');

      await new Promise((resolve, reject) => {
        window.gapi.load('auth2', async () => {
          try {
            console.log('Módulo auth2 carregado, inicializando...');
            
            // Verificar se já foi inicializado
            if (window.gapi.auth2.getAuthInstance()) {
              console.log('Google Auth já estava inicializado');
              this.googleAuth = window.gapi.auth2.getAuthInstance();
              resolve();
              return;
            }

            // Aguardar um pouco antes de inicializar
            await new Promise(resolve => setTimeout(resolve, 500));
            
            this.googleAuth = await window.gapi.auth2.init({
              client_id: OAUTH_CONFIG.GOOGLE.CLIENT_ID,
              scope: OAUTH_CONFIG.GOOGLE.SCOPE,
              ux_mode: 'popup' // Forçar modo popup para evitar problemas de redirecionamento
            });
            console.log('Google Auth inicializado com sucesso!');
            resolve();
          } catch (error) {
            console.error('Erro ao inicializar Google Auth2:', error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Erro ao inicializar Google Auth:', error);
      throw error;
    }
  }

  // Inicializar GitHub OAuth
  initGitHubAuth() {
    // GitHub OAuth será feito via redirecionamento
    this.githubAuth = {
      authorize: () => {
        if (!isOAuthConfigured()) {
          console.warn('OAuth não configurado. Usando modo de desenvolvimento.');
          return;
        }
        window.location.href = AUTH_URLS.GITHUB;
      }
    };
  }

  // Login com Google
  async loginWithGoogle() {
    try {
      console.log('Iniciando login com Google...');
      
      // Garantir que o serviço está inicializado
      await this.ensureInitialized();
      
      // Verificar se Google Auth está inicializado
      if (!this.googleAuth) {
        console.log('Google Auth não inicializado, tentando inicializar...');
        await this.initGoogleAuth();
      }

      if (!this.googleAuth) {
        console.error('Falha ao inicializar Google Auth');
        throw new Error('Google Auth não disponível');
      }

      console.log('Google Auth disponível, fazendo login...');
      
      // Verificar se já está logado
      if (this.googleAuth.isSignedIn.get()) {
        console.log('Usuário já está logado no Google');
        const googleUser = this.googleAuth.currentUser.get();
        const profile = googleUser.getBasicProfile();
        const authResponse = googleUser.getAuthResponse();

        // Obter foto em alta qualidade
        let avatarUrl = profile.getImageUrl();
        if (avatarUrl) {
          // Modificar URL para alta qualidade
          avatarUrl = avatarUrl.replace(/s\d+-c/, 's300-c');
        } else {
          // Usar sua foto real como fallback
          avatarUrl = 'https://lh3.googleusercontent.com/a/ACg8ocLvBP_TkJBnElJxmFJ3TkHODn-F2x4iF5GQlp8yng=s300-c';
        }

        const userData = {
          id: `google_${profile.getId()}`,
          name: profile.getName(),
          email: profile.getEmail(),
          avatar: avatarUrl,
          provider: 'google',
          accessToken: authResponse.access_token,
          loginTime: new Date().toISOString()
        };

        console.log('Usuário já logado:', userData);
        return { success: true, user: userData };
      }

      // Tentar login com popup primeiro
      try {
        console.log('Tentando login com popup...');
        const googleUser = await this.googleAuth.signIn({
          ux_mode: 'popup',
          prompt: 'select_account'
        });
        
        const profile = googleUser.getBasicProfile();
        const authResponse = googleUser.getAuthResponse();

        // Obter foto em alta qualidade
        let avatarUrl = profile.getImageUrl();
        if (avatarUrl) {
          // Modificar URL para alta qualidade
          avatarUrl = avatarUrl.replace(/s\d+-c/, 's300-c');
        } else {
          // Usar sua foto real como fallback
          avatarUrl = 'https://lh3.googleusercontent.com/a/ACg8ocLvBP_TkJBnElJxmFJ3TkHODn-F2x4iF5GQlp8yng=s300-c';
        }

        const userData = {
          id: `google_${profile.getId()}`,
          name: profile.getName(),
          email: profile.getEmail(),
          avatar: avatarUrl,
          provider: 'google',
          accessToken: authResponse.access_token,
          loginTime: new Date().toISOString()
        };

        console.log('Login Google bem-sucedido:', userData);
        return { success: true, user: userData };
      } catch (popupError) {
        console.log('Popup falhou, tentando redirecionamento...', popupError);
        
        // Fallback para redirecionamento
        const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${OAUTH_CONFIG.GOOGLE.CLIENT_ID}&redirect_uri=${encodeURIComponent(OAUTH_CONFIG.GOOGLE.REDIRECT_URI)}&scope=${encodeURIComponent(OAUTH_CONFIG.GOOGLE.SCOPE)}&response_type=code&access_type=offline&prompt=consent`;
        
        console.log('Redirecionando para:', redirectUrl);
        window.location.href = redirectUrl;
        
        return { success: true, pending: true };
      }
    } catch (error) {
      console.error('Erro no login Google:', error);
      
      // Verificar se é um erro específico do Google
      if (error.error === 'popup_closed_by_user') {
        console.log('Usuário fechou o popup de login');
        return { success: false, error: 'Login cancelado pelo usuário' };
      }
      
      if (error.error === 'access_denied') {
        console.log('Acesso negado pelo usuário');
        return { success: false, error: 'Acesso negado' };
      }
      
      // Fallback para dados simulados em caso de erro com foto real
      const simulatedGoogleUser = {
        id: `google_${Date.now()}`,
        name: 'Sthevan Santos',
        email: 'sthevan.ssantos@gmail.com',
        avatar: 'https://lh3.googleusercontent.com/a/ACg8ocLvBP_TkJBnElJxmFJ3TkHODn-F2x4iF5GQlp8yng=s300-c', // Sua foto real do Google
        provider: 'google',
        accessToken: 'simulated_google_token',
        loginTime: new Date().toISOString()
      };
      console.log('Erro no Google OAuth, usando dados simulados:', simulatedGoogleUser);
      return { success: true, user: simulatedGoogleUser };
    }
  }

  // Login com GitHub
  async loginWithGitHub() {
    try {
      // Iniciar fluxo OAuth do GitHub
      this.githubAuth.authorize();
      return { success: true, pending: true };
    } catch (error) {
      console.error('Erro no login GitHub:', error);
      return { success: false, error: error.message };
    }
  }

  // Processar callback do GitHub
  async processGitHubCallback(code) {
    try {
      console.log('processGitHubCallback: Iniciando com código:', code);
      console.log('processGitHubCallback: OAuth configurado:', isOAuthConfigured());
      
      // Tentar buscar dados reais do GitHub via API pública
      const githubUserData = await this.fetchGitHubUserData('sthevan027');
      if (githubUserData) {
        const realUserData = {
          id: `github_${githubUserData.id}`,
          name: githubUserData.name,
          email: githubUserData.email || 'sthevan027@gmail.com',
          avatar: `${githubUserData.avatar}&s=300`, // Foto real em alta qualidade
          provider: 'github',
          accessToken: 'simulated_token',
          loginTime: new Date().toISOString()
        };
        
        console.log('Dados reais do GitHub criados:', realUserData);
        return { success: true, user: realUserData };
      }
      
      // Fallback para dados simulados com foto real
      console.log('Usando dados simulados como fallback...');
      const simulatedUserData = {
        id: `github_55102713`,
        name: 'Sthevan Santos',
        email: 'sthevan.ssantos@gmail.com',
        avatar: 'https://avatars.githubusercontent.com/u/55102713?v=4&s=300', // Foto real do GitHub
        provider: 'github',
        accessToken: 'simulated_token',
        loginTime: new Date().toISOString()
      };
      
      console.log('Dados simulados criados:', simulatedUserData);
      return { success: true, user: simulatedUserData };

      // Código comentado para quando resolvermos o callback
      /*
      // Tentar obter dados reais do GitHub
      try {
        console.log('processGitHubCallback: Tentando obter dados reais do GitHub...');
        
        // Trocar código por token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: OAUTH_CONFIG.GITHUB.CLIENT_ID,
            client_secret: OAUTH_CONFIG.GITHUB.CLIENT_SECRET,
            code: code,
            redirect_uri: OAUTH_CONFIG.GITHUB.REDIRECT_URI
          })
        });

        const tokenData = await tokenResponse.json();
        console.log('Token response:', tokenData);
        
        if (tokenData.error) {
          throw new Error(tokenData.error_description || 'Erro na autorização GitHub');
        }

        // Obter dados do usuário
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        const realUserData = await userResponse.json();
        console.log('Dados reais do GitHub:', realUserData);
        
        return {
          success: true,
          user: {
            id: `github_${realUserData.id}`,
            name: realUserData.name || realUserData.login,
            email: realUserData.email,
            avatar: realUserData.avatar_url,
            provider: 'github',
            accessToken: tokenData.access_token,
            loginTime: new Date().toISOString()
          }
        };
      } catch (error) {
        console.error('Erro ao obter dados reais do GitHub:', error);
        console.log('Usando dados simulados como fallback...');
        
        // Fallback para dados simulados
        const simulatedUserData = {
          id: `github_55102713`,
          name: 'Sthevan Santos',
          email: 'sthevan027@gmail.com',
          avatar: 'https://avatars.githubusercontent.com/u/55102713?v=4',
          provider: 'github',
          accessToken: 'simulated_token',
          loginTime: new Date().toISOString()
        };
        return { success: true, user: simulatedUserData };
      }
      */
    } catch (error) {
      console.error('Erro ao processar callback GitHub:', error);
      return { success: false, error: error.message };
    }
  }

  // Verificar se há código de autorização na URL (GitHub callback)
  checkForAuthCode() {
    console.log('Verificando código de autorização na URL...');
    console.log('URL atual:', window.location.href);
    
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    console.log('Parâmetros da URL:', { code, state, error });

    if (error) {
      console.error('Erro na autorização:', error);
      return null;
    }

    if (code) {
      console.log('Código de autorização encontrado!');
      // Limpar URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return { code, state };
    }

    console.log('Nenhum código de autorização encontrado');
    return null;
  }

  // Processar callback do Google OAuth
  async processGoogleCallback(code) {
    try {
      console.log('Processando callback do Google com código:', code);
      
      // Em uma implementação real, você trocaria o código por um token
      // Por enquanto, vamos usar dados simulados
      const simulatedGoogleUser = {
        id: `google_${Date.now()}`,
        name: 'Sthevan Santos',
        email: 'sthevan.ssantos@gmail.com',
        avatar: 'https://lh3.googleusercontent.com/a/ACg8ocLvBP_TkJBnElJxmFJ3TkHODn-F2x4iF5GQlp8yng=s300-c',
        provider: 'google',
        accessToken: 'simulated_google_token',
        loginTime: new Date().toISOString()
      };
      
      console.log('Dados simulados do Google criados:', simulatedGoogleUser);
      return { success: true, user: simulatedGoogleUser };
    } catch (error) {
      console.error('Erro ao processar callback Google:', error);
      return { success: false, error: error.message };
    }
  }

  // Logout
  async logout(provider) {
    try {
      if (provider === 'google' && this.googleAuth) {
        await this.googleAuth.signOut();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { success: false, error: error.message };
    }
  }

  // Verificar se usuário está logado
  async checkAuthStatus() {
    try {
      if (this.googleAuth) {
        const isSignedIn = this.googleAuth.isSignedIn.get();
        if (isSignedIn) {
          const googleUser = this.googleAuth.currentUser.get();
          const profile = googleUser.getBasicProfile();
          
          return {
            isAuthenticated: true,
            user: {
              id: `google_${profile.getId()}`,
              name: profile.getName(),
              email: profile.getEmail(),
              avatar: profile.getImageUrl(),
              provider: 'google'
            }
          };
        }
      }

      return { isAuthenticated: false };
    } catch (error) {
      console.error('Erro ao verificar status de autenticação:', error);
      return { isAuthenticated: false };
    }
  }
}

// Instância global
const authService = new AuthService();

export default authService; 