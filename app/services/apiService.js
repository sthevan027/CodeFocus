// Serviço para conectar com o backend Next.js
// - No browser: usa rotas relativas (/api)
// - No SSR: usa NEXT_PUBLIC_APP_URL (ex: https://seuapp.vercel.app) ou cai para rotas relativas
const API_BASE_URL =
  typeof window !== 'undefined'
    ? '/api'
    : `${process.env.NEXT_PUBLIC_APP_URL || ''}/api`

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

    // Preferir cookie httpOnly (credentials include).
    config.credentials = 'include'

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
    return this.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
  }

  async login({ email, password }) {
    return this.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    })
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
  clearLocalSession() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('codefocus-user')
    }
  }

  // Verificar se está autenticado
  isAuthenticated() {
    // Com cookies httpOnly, não dá pra checar token via JS.
    // Use /api/auth/me para confirmar sessão.
    return false
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

  // ========== GITHUB ==========
  getGithubRepos() {
    return this.request('/github/repos')
  }

  getGithubIssues(owner, repo) {
    return this.request(`/github/issues?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`)
  }

  selectRepo(selectedRepo) {
    return this.request('/github/select-repo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedRepo),
    })
  }

  getConnectGithubUrl() {
    return `${this.baseURL}/github/auth`
  }
}

// Instância global
const apiService = new ApiService()

export default apiService

