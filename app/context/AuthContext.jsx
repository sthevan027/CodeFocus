import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { saveSettings, normalizeSettings } from '../utils/settingsUtils';

const AuthContext = createContext();
const OFFLINE_MODE_ENABLED = process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true';

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

  const normalizeUser = (rawUser) => {
    if (!rawUser) return null;
    const name = rawUser.name ?? rawUser.full_name ?? rawUser.username ?? '';
    const avatar = rawUser.avatar ?? rawUser.avatar_url ?? '';
    const is_verified = rawUser.is_verified ?? rawUser.emailVerified ?? false;

    return {
      ...rawUser,
      name,
      full_name: rawUser.full_name ?? rawUser.name ?? name,
      avatar,
      avatar_url: rawUser.avatar_url ?? rawUser.avatar ?? avatar,
      is_verified,
    };
  };

  const syncSettingsFromBackend = async () => {
    try {
      const remote = await apiService.getSettings();
      const normalized = normalizeSettings(remote);
      saveSettings(normalized);
    } catch (e) {
      // manter local
    }
  };

  // Carregar usuário ao inicializar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const saved = localStorage.getItem('codefocus-user');

        // Tentar backend primeiro (cookie httpOnly OU Bearer via localStorage)
        try {
          const currentUser = await apiService.getCurrentUser();
          const normalized = normalizeUser(currentUser);
          if (normalized) {
            setUser(normalized);
            setIsAuthenticated(true);
            saveUser(normalized);
            await syncSettingsFromBackend();
          }
          return;
        } catch (error) {
          if (!OFFLINE_MODE_ENABLED) {
            console.warn('Falha ao buscar usuário do backend. Limpando sessão local.', error);
            localStorage.removeItem('codefocus-user');
            return;
          }
          // Se offline estiver ativo, cai para o storage
          console.log('Modo offline: usando localStorage (falha ao buscar usuário do backend).', error);
        }

        if (saved && OFFLINE_MODE_ENABLED) {
          const parsed = normalizeUser(JSON.parse(saved));
          // Verificar se o email foi verificado (suporta ambos os formatos)
          if (parsed?.emailVerified || parsed?.is_verified) {
            setUser(parsed);
            setIsAuthenticated(true);
          } else {
            // Se não foi verificado, mostrar tela de verificação
            setPendingVerification(parsed);
          }
        } else if (saved && !OFFLINE_MODE_ENABLED) {
          // Evitar "sessão fantasma" em produção sem token válido
          localStorage.removeItem('codefocus-user');
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
        const normalized = normalizeUser(result.user);
        setUser(normalized);
        setIsAuthenticated(true);
        saveUser(normalized);
        await syncSettingsFromBackend();
        return { success: true, user: normalized };
      }
      return { success: false, error: 'Resposta inválida do servidor' };
    } catch (error) {
      if (!OFFLINE_MODE_ENABLED) {
        return { success: false, error: error.message || 'Erro ao fazer login' };
      }
      console.log('Modo offline: erro no login backend, usando fallback local...', error.message);
      // Fallback local simples
      const users = JSON.parse(localStorage.getItem('codefocus-users') || '[]');
      const localUser = users.find(u => u.email === email && u.password === password);
      if (!localUser) return { success: false, error: 'Email ou senha incorretos' };
      
      // Verificar se o email foi verificado
      if (!localUser.emailVerified) {
        setPendingVerification(normalizeUser(localUser));
        return { success: false, error: 'Email não verificado', needsVerification: true };
      }
      
      const normalized = normalizeUser(localUser);
      setUser(normalized);
      setIsAuthenticated(true);
      saveUser(normalized);
      return { success: true, user: normalized };
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (userData) => {
    try {
      setLoading(true);
      // Converter name para full_name (backend espera full_name)
      const backendData = {
        ...userData,
        full_name: userData.name || userData.full_name,
      };
      // Remover name se existir, manter apenas full_name
      delete backendData.name;
      
      const result = await apiService.register(backendData);
      if (result && result.user) {
        const normalized = normalizeUser(result.user);
        if (result.needs_verification) {
          setPendingVerification(normalized);
          return { success: true, user: normalized, needsVerification: true, verificationType: 'link' };
        }
        setUser(normalized);
        setIsAuthenticated(true);
        saveUser(normalized);
        await syncSettingsFromBackend();
        return { success: true, user: normalized };
      }
      return { success: false, error: 'Resposta inválida do servidor' };
    } catch (error) {
      if (!OFFLINE_MODE_ENABLED) {
        return { success: false, error: error.message || 'Erro ao registrar usuário' };
      }
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
      
      const normalized = normalizeUser(newUser);
      setPendingVerification(normalized);
      return { success: true, user: normalized, needsVerification: true };
    } finally {
      setLoading(false);
    }
  };

  // Verificar código de email
  const verifyEmail = async (email, code) => {
    try {
      setLoading(true);
      // Supabase Auth verifica por link no email. Aqui apenas tenta recarregar /me.
      try {
        const currentUser = await apiService.getCurrentUser();
        const normalized = normalizeUser(currentUser);
        setUser(normalized);
        setIsAuthenticated(true);
        setPendingVerification(null);
        saveUser(normalized);
        await syncSettingsFromBackend();
        return { success: true, user: normalized };
      } catch (e) {
        if (!OFFLINE_MODE_ENABLED) {
          return { success: false, error: 'Abra o link do email de confirmação e depois tente entrar novamente.' };
        }
      }
      
      // Fallback local
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
        const verifiedUser = normalizeUser({ ...pendingVerification, emailVerified: true, verifiedAt: new Date().toISOString() });
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
  const resendVerificationCode = async (email) => {
    try {
      // Tentar reenviar via backend primeiro
      try {
        const result = await apiService.sendVerificationEmail(email);
        if (result.message) {
          console.log('✅ Código reenviado via backend');
          return { success: true };
        }
      } catch (backendError) {
        if (!OFFLINE_MODE_ENABLED) {
          return { success: false, error: backendError.message || 'Erro ao reenviar código' };
        }
        console.log('Modo offline: erro no backend, usando fallback local...', backendError.message);
      }
      
      // Fallback local
      const newCode = generateVerificationCode(email);
      console.log(`🔐 Novo código de verificação para ${email}: ${newCode}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao reenviar código' };
    }
  };

  const logout = async () => {
    try {
      try {
        await apiService.logout();
      } catch (e) {
        // ok
      }
      setUser(null);
      setIsAuthenticated(false);
      setPendingVerification(null);
      localStorage.removeItem('codefocus-user');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      if (!user) return { success: false, error: 'Sem usuário' };
      // Backend trabalha em snake_case; frontend usa name/avatar
      const payload = {
        ...(updates.name !== undefined ? { full_name: updates.name } : {}),
        ...(updates.email !== undefined ? { email: updates.email } : {}),
        ...(updates.avatar !== undefined ? { avatar_url: updates.avatar } : {}),
      };

      const result = await apiService.updateUser(payload);
      if (result && result.user) {
        const updated = normalizeUser({ ...user, ...result.user });
        setUser(updated);
        saveUser(updated);
        return { success: true, user: updated };
      }

      // fallback local
      const users = JSON.parse(localStorage.getItem('codefocus-users') || '[]');
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        localStorage.setItem('codefocus-users', JSON.stringify(users));
      }
      const updatedLocal = normalizeUser({ ...user, ...updates });
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