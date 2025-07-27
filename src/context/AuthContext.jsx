import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import apiService from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  console.log('AuthProvider: Estado atual:', { user, loading, isAuthenticated });

  // Carregar usuário ao inicializar
  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('Carregando usuário...');
        
        // Verificar se há token de autenticação
        if (apiService.isAuthenticated()) {
          console.log('Token encontrado, buscando dados do usuário...');
          const userData = await apiService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Verificar se há código de autorização (Google ou GitHub)
          const authCode = authService.checkForAuthCode();
          console.log('Auth code encontrado:', authCode);
          
          if (authCode) {
            console.log('Processando callback OAuth...');
            let result;
            
            try {
              result = await authService.processGoogleCallback(authCode.code);
            } catch (error) {
              console.log('Não é callback do Google, tentando GitHub...');
              result = await authService.processGitHubCallback(authCode.code);
            }
            
            console.log('Resultado do callback:', result);
            
            if (result.success) {
              console.log('Login OAuth bem-sucedido!');
              setUser(result.user);
              setIsAuthenticated(true);
              saveUser(result.user);
            } else {
              console.error('Erro no callback OAuth:', result.error);
            }
          } else {
            // Verificar se há usuário salvo localmente (fallback)
            const savedUser = localStorage.getItem('codefocus-user');
            if (savedUser && savedUser !== 'undefined') {
              try {
                console.log('Usuário encontrado no localStorage');
                const userData = JSON.parse(savedUser);
                setUser(userData);
                setIsAuthenticated(true);
              } catch (error) {
                console.error('Erro ao parsear usuário do localStorage:', error);
                localStorage.removeItem('codefocus-user');
              }
            } else {
              console.log('Nenhum usuário encontrado');
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Salvar usuário no localStorage (fallback)
  const saveUser = (userData) => {
    try {
      localStorage.setItem('codefocus-user', JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  };

  // Login com e-mail/senha (backend)
  const loginWithEmail = async (email, password) => {
    try {
      setLoading(true);
      console.log('AuthContext: Iniciando login com e-mail...');
      
      const result = await apiService.login({ email, password });
      console.log('AuthContext: Resultado do login:', result);
      
      // Buscar dados do usuário
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('AuthContext: Erro no login com e-mail:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Registro de usuário (backend)
  const registerUser = async (userData) => {
    try {
      setLoading(true);
      console.log('AuthContext: Iniciando registro...');
      
      const result = await apiService.register(userData);
      console.log('AuthContext: Resultado do registro:', result);
      
      // Fazer login automaticamente após registro
      const loginResult = await loginWithEmail(userData.email, userData.password);
      
      return loginResult;
    } catch (error) {
      console.error('AuthContext: Erro no registro:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Login com Google
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('AuthContext: Iniciando login com Google...');
      
      const result = await authService.loginWithGoogle();
      console.log('AuthContext: Resultado do login Google:', result);
      
      if (result.success) {
        console.log('AuthContext: Login Google bem-sucedido, atualizando estado...');
        setUser(result.user);
        setIsAuthenticated(true);
        saveUser(result.user);
      } else {
        console.error('AuthContext: Erro no login Google:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('AuthContext: Erro no login Google:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Login com GitHub
  const loginWithGitHub = async () => {
    try {
      setLoading(true);
      
      const result = await authService.loginWithGitHub();
      return result;
    } catch (error) {
      console.error('Erro no login GitHub:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Login anônimo (para desenvolvimento)
  const loginAnonymously = async () => {
    try {
      setLoading(true);
      
      const anonymousUser = {
        id: 'anon_' + Date.now(),
        name: 'Usuário Anônimo',
        email: 'anonymous@codefocus.com',
        avatar: 'https://via.placeholder.com/40',
        provider: 'anonymous',
        loginTime: new Date().toISOString()
      };

      setUser(anonymousUser);
      setIsAuthenticated(true);
      saveUser(anonymousUser);

      return { success: true, user: anonymousUser };
    } catch (error) {
      console.error('Erro no login anônimo:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Logout do backend se estiver usando
      if (apiService.isAuthenticated()) {
        apiService.logout();
      }
      
      // Logout dos provedores OAuth
      if (user?.provider) {
        await authService.logout(user.provider);
      }
      
      localStorage.removeItem('codefocus-user');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  // Atualizar perfil do usuário
  const updateProfile = async (updates) => {
    if (!user) return;

    try {
      if (apiService.isAuthenticated()) {
        // Atualizar no backend
        const updatedUser = await apiService.updateUser(updates);
        setUser(updatedUser);
      } else {
        // Atualizar localmente
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        saveUser(updatedUser);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    loginWithEmail,
    registerUser,
    loginWithGoogle,
    loginWithGitHub,
    loginAnonymously,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 