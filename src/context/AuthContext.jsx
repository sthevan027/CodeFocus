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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Carregar usuário ao inicializar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const saved = localStorage.getItem('codefocus-user');
        if (saved) {
          const parsed = JSON.parse(saved);
          setUser(parsed);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const saveUser = (userData) => {
    try {
      localStorage.setItem('codefocus-user', JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  };

  // Login com e-mail/senha
  const loginWithEmail = async (email, password) => {
    try {
      setLoading(true);
      const result = await apiService.login({ email, password });
      if (result && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        saveUser(result.user);
        return { success: true, user: result.user };
      }
      return { success: false, error: 'Resposta inválida do servidor' };
    } catch (error) {
      console.log('Erro no login backend, usando fallback local...', error.message);
      // Fallback local simples
      const users = JSON.parse(localStorage.getItem('codefocus-users') || '[]');
      const localUser = users.find(u => u.email === email && u.password === password);
      if (!localUser) return { success: false, error: 'Email ou senha incorretos' };
      setUser(localUser);
      setIsAuthenticated(true);
      saveUser(localUser);
      return { success: true, user: localUser };
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (userData) => {
    try {
      setLoading(true);
      const result = await apiService.register(userData);
      if (result && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        saveUser(result.user);
        return { success: true, user: result.user };
      }
      return { success: false, error: 'Resposta inválida do servidor' };
    } catch (error) {
      // Fallback local
      const existingUsers = JSON.parse(localStorage.getItem('codefocus-users') || '[]');
      if (existingUsers.find(u => u.email === userData.email)) {
        return { success: false, error: 'Email já registrado' };
      }
      const newUser = { id: `local_${Date.now()}`, name: userData.name, email: userData.email, password: userData.password, provider: 'email', loginTime: new Date().toISOString() };
      existingUsers.push(newUser);
      localStorage.setItem('codefocus-users', JSON.stringify(existingUsers));
      setUser(newUser);
      setIsAuthenticated(true);
      saveUser(newUser);
      return { success: true, user: newUser };
    } finally {
      setLoading(false);
    }
  };

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
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('codefocus-user');
      localStorage.removeItem('auth-token');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      if (!user) return { success: false, error: 'Sem usuário' };
      const result = await apiService.updateProfile(user.id, updates);
      if (result.success) {
        const updated = { ...user, ...result.user };
        setUser(updated);
        saveUser(updated);
        return result;
      }
      // fallback local
      const users = JSON.parse(localStorage.getItem('codefocus-users') || '[]');
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        localStorage.setItem('codefocus-users', JSON.stringify(users));
      }
      const updatedLocal = { ...user, ...updates };
      setUser(updatedLocal);
      saveUser(updatedLocal);
      return { success: true, user: updatedLocal };
    } catch (error) {
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