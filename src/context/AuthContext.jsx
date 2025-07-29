import { createContext, useContext, useState, useEffect } from 'react';
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
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Temporariamente true para mostrar o timer

  console.log('AuthProvider: Estado atual:', { user, loading, isAuthenticated });

  // Carregar usuário ao inicializar
  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('Carregando usuário...');
        
        // Criar usuário padrão para desenvolvimento
        const defaultUser = {
          id: 'dev-user',
          name: 'Desenvolvedor',
          email: 'dev@codefocus.com',
          provider: 'local'
        };
        
        setUser(defaultUser);
        setIsAuthenticated(true);
        saveUser(defaultUser);
        
        console.log('Usuário padrão carregado:', defaultUser);
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

  // Login com e-mail/senha (backend com fallback local)
  const loginWithEmail = async (email, password) => {
    try {
      setLoading(true);
      console.log('AuthContext: Tentando login com backend...');
      
      try {
        const result = await apiService.login(email, password);
        
        if (result.success) {
          setUser(result.user);
          setIsAuthenticated(true);
          saveUser(result.user);
          console.log('AuthContext: Login com backend bem-sucedido:', result.user);
          return result;
        }
        
        return result;
      } catch (backendError) {
        console.log('AuthContext: Backend não disponível, usando localStorage...');
        
        // Fallback para localStorage
        const users = JSON.parse(localStorage.getItem('codefocus-users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
          return { success: false, error: 'Email ou senha incorretos' };
        }
        
        // Atualizar login time
        user.loginTime = new Date().toISOString();
        localStorage.setItem('codefocus-users', JSON.stringify(users));
        
        // Fazer login
        setUser(user);
        setIsAuthenticated(true);
        saveUser(user);
        
        console.log('AuthContext: Login local bem-sucedido:', user);
        return { success: true, user };
      }
    } catch (error) {
      console.error('AuthContext: Erro no login:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Registro de usuário (backend com fallback local)
  const registerUser = async (userData) => {
    try {
      setLoading(true);
      console.log('AuthContext: Tentando registro com backend...');
      
      try {
        const result = await apiService.register(userData);
        
        if (result.success) {
          setUser(result.user);
          setIsAuthenticated(true);
          saveUser(result.user);
          console.log('AuthContext: Registro com backend bem-sucedido:', result.user);
          return result;
        }
        
        return result;
      } catch (backendError) {
        console.log('AuthContext: Backend não disponível, usando localStorage...');
        
        // Fallback para localStorage
        const existingUsers = JSON.parse(localStorage.getItem('codefocus-users') || '[]');
        const existingUser = existingUsers.find(user => user.email === userData.email);
        
        if (existingUser) {
          return { success: false, error: 'Email já registrado' };
        }
        
        // Criar novo usuário
        const newUser = {
          id: `local_${Date.now()}`,
          name: userData.name,
          email: userData.email,
          password: userData.password, // Em produção, deveria ser hasheada
          provider: 'email',
          loginTime: new Date().toISOString()
        };
        
        // Salvar usuário
        existingUsers.push(newUser);
        localStorage.setItem('codefocus-users', JSON.stringify(existingUsers));
        
        // Fazer login automaticamente
        setUser(newUser);
        setIsAuthenticated(true);
        saveUser(newUser);
        
        console.log('AuthContext: Registro local bem-sucedido:', newUser);
        return { success: true, user: newUser };
      }
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
        setUser(result.user);
        setIsAuthenticated(true);
        saveUser(result.user);
      }
      
      return result;
    } catch (error) {
      console.error('AuthContext: Erro no login com Google:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      console.log('AuthContext: Fazendo logout...');
      
      // Limpar dados do usuário
      setUser(null);
      setIsAuthenticated(false);
      
      // Limpar localStorage
      localStorage.removeItem('codefocus-user');
      
      // Limpar dados específicos do usuário
      if (user) {
        localStorage.removeItem(`codefocus-timer-state-${user.id}`);
        localStorage.removeItem(`codefocus-history-${user.id}`);
        localStorage.removeItem(`codefocus-notes-${user.id}`);
        localStorage.removeItem(`codefocus-tags-${user.id}`);
      }
      
      console.log('AuthContext: Logout realizado com sucesso');
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Erro no logout:', error);
      return { success: false, error: error.message };
    }
  };

  // Atualizar perfil (backend com fallback local)
  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      console.log('AuthContext: Tentando atualizar perfil com backend...');
      
      try {
        const result = await apiService.updateProfile(user.id, updates);
        
        if (result.success) {
          const updatedUser = { ...user, ...result.user };
          setUser(updatedUser);
          saveUser(updatedUser);
          console.log('AuthContext: Perfil atualizado com backend:', updatedUser);
          return result;
        }
        
        return result;
      } catch (backendError) {
        console.log('AuthContext: Backend não disponível, atualizando localmente...');
        
        // Fallback para localStorage
        const users = JSON.parse(localStorage.getItem('codefocus-users') || '[]');
        const userIndex = users.findIndex(u => u.id === user.id);
        
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...updates };
          localStorage.setItem('codefocus-users', JSON.stringify(users));
        }
        
        // Atualizar estado local
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        saveUser(updatedUser);
        
        console.log('AuthContext: Perfil atualizado localmente:', updatedUser);
        return { success: true, user: updatedUser };
      }
    } catch (error) {
      console.error('AuthContext: Erro ao atualizar perfil:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    loginWithEmail,
    registerUser,
    loginWithGoogle,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 