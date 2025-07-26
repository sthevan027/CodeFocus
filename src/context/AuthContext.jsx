import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

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

  // Carregar usuário do localStorage ao inicializar
  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('Carregando usuário...');
        
        // Verificar se há código de autorização do GitHub
        const authCode = authService.checkForAuthCode();
        console.log('Auth code encontrado:', authCode);
        
        if (authCode) {
          console.log('Processando callback GitHub...');
          const result = await authService.processGitHubCallback(authCode.code);
          console.log('Resultado do callback:', result);
          
          if (result.success) {
            console.log('Login GitHub bem-sucedido!');
            setUser(result.user);
            setIsAuthenticated(true);
            saveUser(result.user);
          } else {
            console.error('Erro no callback GitHub:', result.error);
          }
        } else {
          // Verificar se há usuário salvo
          const savedUser = localStorage.getItem('codefocus-user');
          if (savedUser) {
            console.log('Usuário encontrado no localStorage');
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            console.log('Nenhum usuário encontrado');
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

  // Salvar usuário no localStorage
  const saveUser = (userData) => {
    try {
      localStorage.setItem('codefocus-user', JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  };

  // Login com Google
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      
      const result = await authService.loginWithGoogle();
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        saveUser(result.user);
      }
      
      return result;
    } catch (error) {
      console.error('Erro no login Google:', error);
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
  const updateProfile = (updates) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    saveUser(updatedUser);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
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