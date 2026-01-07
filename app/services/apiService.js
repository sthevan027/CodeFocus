// Serviço para conectar com o backend Next.js
const API_BASE_URL = typeof window !== 'undefined' ? '/api' : 'http://localhost:3000/api'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  // Função auxiliar para fazer requisições
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        ...options.headers,
      },
      ...options,
    }

    // Adicionar token de autenticação se existir
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token')
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    try {
      const response = await fetch(url, config)
      const contentType = response.headers.get('content-type') || ''
      const data = contentType.includes('application/json') ? await response.json() : await response.text()

      if (!response.ok) {
        const message = typeof data === 'string' ? data : data.detail || data.error || 'Erro na requisição'
        throw new Error(message)
      }

      return data
    } catch (error) {
      console.error('Erro na API:', error)
      throw error
    }
  }

  // Autenticação
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })

    // Salvar token (registro também retorna token)
    if (response.access_token && typeof window !== 'undefined') {
      localStorage.setItem('auth-token', response.access_token)
    }

    return response
  }

  async login({ email, password }) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    // Salvar token
    if (response.access_token && typeof window !== 'undefined') {
      localStorage.setItem('auth-token', response.access_token)
    }

    return response
  }

  async getCurrentUser() {
    return this.request('/auth/me')
  }

  async sendVerificationEmail(email) {
    return this.request(`/auth/send-verification?email=${encodeURIComponent(email)}`, {
      method: 'POST',
    })
  }

  async verifyEmail(email, code) {
    return this.request(`/auth/verify-email?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`, {
      method: 'POST',
    })
  }

  // Usuários
  async updateUser(userData) {
    return this.request('/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
  }

  async deleteUser() {
    return this.request('/users/me', {
      method: 'DELETE',
    })
  }

  // Logout
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token')
      localStorage.removeItem('codefocus-user')
    }
  }

  // Verificar se está autenticado
  isAuthenticated() {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('auth-token')
  }

  // ========== CICLOS ==========
  async createCycle(cycleData) {
    return this.request('/cycles/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cycleData),
    })
  }

  async getCycles(skip = 0, limit = 100) {
    return this.request(`/cycles/?skip=${skip}&limit=${limit}`)
  }

  async getCycle(cycleId) {
    return this.request(`/cycles/${cycleId}`)
  }

  async updateCycle(cycleId, cycleData) {
    return this.request(`/cycles/${cycleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cycleData),
    })
  }

  async deleteCycle(cycleId) {
    return this.request(`/cycles/${cycleId}`, {
      method: 'DELETE',
    })
  }

  async getCycleStats() {
    return this.request('/cycles/stats/overview')
  }

  async getDailyStats(date) {
    return this.request(`/cycles/stats/daily?date=${date}`)
  }

  // ========== CONFIGURAÇÕES ==========
  async getSettings() {
    return this.request('/settings/')
  }

  async updateSettings(settingsData) {
    return this.request('/settings/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData),
    })
  }

  async resetSettings() {
    return this.request('/settings/reset', {
      method: 'POST',
    })
  }

  // ========== RELATÓRIOS ==========
  async generateReport(reportData) {
    return this.request('/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    })
  }

  async getReports(skip = 0, limit = 50) {
    return this.request(`/reports/?skip=${skip}&limit=${limit}`)
  }

  async getReport(reportId) {
    return this.request(`/reports/${reportId}`)
  }

  async deleteReport(reportId) {
    return this.request(`/reports/${reportId}`, {
      method: 'DELETE',
    })
  }
}

// Instância global
const apiService = new ApiService()

export default apiService

