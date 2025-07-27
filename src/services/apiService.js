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
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Adicionar token de autenticação se existir
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Erro na requisição');
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
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
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

  // Usuários
  async updateUser(userData) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updateProfile(userId, updates) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
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