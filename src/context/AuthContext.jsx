import { createContext, useContext, useState, useEffect } from 'react';
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
  const [pendingVerification, setPendingVerification] = useState(null);

  // Carregar usuário ao inicializar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const saved = localStorage.getItem('codefocus-user');
        if (saved) {
          const parsed = JSON.parse(saved);
          // Verificar se o email foi verificado
          if (parsed.emailVerified) {
            setUser(parsed);
            setIsAuthenticated(true);
          } else {
            // Se não foi verificado, mostrar tela de verificação
            setPendingVerification(parsed);
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

  const saveUser = (userData) => {
    try {
      localStorage.setItem('codefocus-user', JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  };

  // Gerar código de verificação
  const generateVerificationCode = (email) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(`verification_${email}`, code);
    return code;
  };

  // Login com e-mail/senha
  const loginWithEmail = async (email, password) => {
    try {
      setLoading(true);
      const result = await apiService.login({ email, password });
      if (result && result.user) {
        // Verificar se o email foi verificado
        if (!result.user.emailVerified) {
          setPendingVerification(result.user);
          return { success: false, error: 'Email não verificado', needsVerification: true };
        }
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
      
      // Verificar se o email foi verificado
      if (!localUser.emailVerified) {
        setPendingVerification(localUser);
        return { success: false, error: 'Email não verificado', needsVerification: true };
      }
      
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
        // Gerar código de verificação
        const verificationCode = generateVerificationCode(userData.email);
        console.log(`🔐 Código de verificação para ${userData.email}: ${verificationCode}`);
        
        setPendingVerification(result.user);
        return { success: true, user: result.user, needsVerification: true };
      }
      return { success: false, error: 'Resposta inválida do servidor' };
    } catch (error) {
      // Fallback local
      const existingUsers = JSON.parse(localStorage.getItem('codefocus-users') || '[]');
      if (existingUsers.find(u => u.email === userData.email)) {
        return { success: false, error: 'Email já registrado' };
      }
      
      const newUser = { 
        id: `local_${Date.now()}`, 
        name: userData.name, 
        email: userData.email, 
        password: userData.password, 
        provider: 'email', 
        emailVerified: false,
        loginTime: new Date().toISOString() 
      };
      
      existingUsers.push(newUser);
      localStorage.setItem('codefocus-users', JSON.stringify(existingUsers));
      
      // Gerar código de verificação
      const verificationCode = generateVerificationCode(userData.email);
      console.log(`🔐 Código de verificação para ${userData.email}: ${verificationCode}`);
      
      setPendingVerification(newUser);
      return { success: true, user: newUser, needsVerification: true };
    } finally {
      setLoading(false);
    }
  };

  // Verificar código de email
  const verifyEmail = async (email, code) => {
    try {
      setLoading(true);
      const savedCode = localStorage.getItem(`verification_${email}`);
      
      if (savedCode === code) {
        // Código correto - marcar email como verificado
        const users = JSON.parse(localStorage.getItem('codefocus-users') || '[]');
        const userIndex = users.findIndex(u => u.email === email);
        
        if (userIndex !== -1) {
          users[userIndex].emailVerified = true;
          users[userIndex].verifiedAt = new Date().toISOString();
          localStorage.setItem('codefocus-users', JSON.stringify(users));
        }
        
        // Atualizar usuário atual
        const verifiedUser = { ...pendingVerification, emailVerified: true, verifiedAt: new Date().toISOString() };
        setUser(verifiedUser);
        setIsAuthenticated(true);
        setPendingVerification(null);
        saveUser(verifiedUser);
        
        // Limpar código de verificação
        localStorage.removeItem(`verification_${email}`);
        
        return { success: true, user: verifiedUser };
      } else {
        return { success: false, error: 'Código de verificação incorreto' };
      }
    } catch (error) {
      return { success: false, error: 'Erro ao verificar código' };
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código de verificação
  const resendVerificationCode = (email) => {
    const newCode = generateVerificationCode(email);
    console.log(`🔐 Novo código de verificação para ${email}: ${newCode}`);
    return { success: true };
  };

  const logout = async () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      setPendingVerification(null);
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
    pendingVerification,
    loginWithEmail,
    registerUser,
    verifyEmail,
    resendVerificationCode,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 