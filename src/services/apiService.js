// Serviço para conectar com o backend Python
const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Função auxiliar para fazer requisições
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        ...options.headers,
      },
      ...options,
    };

    // Adicionar token de autenticação se existir
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : await response.text();

      if (!response.ok) {
        const message = typeof data === 'string' ? data : data.detail || 'Erro na requisição';
        throw new Error(message);
      }

      return data;
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  }

  // Autenticação
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
  }

  async login({ email, password }) {
    // FastAPI OAuth2PasswordRequestForm espera username e password via form-urlencoded
    const body = new URLSearchParams({ username: email, password });
    const response = await this.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    // Salvar token
    if (response.access_token) {
      localStorage.setItem('auth-token', response.access_token);
    }

    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async oauthCallback(provider, code) {
    const endpoint = provider === 'google' ? '/auth/google/callback' : '/auth/github/callback';
    const response = await this.request(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    if (response.access_token) {
      localStorage.setItem('auth-token', response.access_token);
    }
    return response;
  }

  // Usuários
  async updateUser(userData) {
    return this.request('/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
  }

  async updateProfile(userId, updates) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }

  async deleteUser() {
    return this.request('/users/me', {
      method: 'DELETE',
    });
  }

  // Logout
  logout() {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('codefocus-user');
  }

  // Verificar se está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('auth-token');
  }
}

// Instância global
const apiService = new ApiService();

export default apiService; 