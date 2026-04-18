// ─────────────────────────────────────────────────────────────────────────────
//  SubFlow API Client
//  Place this file in your React project: src/utils/api.js
//  Replace the BASE_URL with your backend URL when deployed
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ─── Token helpers ────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('accessToken')
const setTokens = (access, refresh) => {
  localStorage.setItem('accessToken', access)
  localStorage.setItem('refreshToken', refresh)
}
const clearTokens = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
const apiFetch = async (endpoint, options = {}) => {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Auto-refresh on 401
  if (res.status === 401 && endpoint !== '/auth/login') {
    const refreshed = await tryRefreshToken()
    if (refreshed) {
      headers.Authorization = `Bearer ${getToken()}`
      return fetch(`${BASE_URL}${endpoint}`, { ...options, headers })
    } else {
      clearTokens()
      window.location.href = '/login'
      return
    }
  }

  const data = await res.json()
  if (!res.ok) {
    const error = new Error(data.message || 'Request failed')
    error.errors = data.errors
    error.status = res.status
    throw error
  }

  return data
}

const tryRefreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) return false
    const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return false
    const data = await res.json()
    setTokens(data.accessToken, data.refreshToken)
    return true
  } catch {
    return false
  }
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: async (data) => {
    const res = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) })
    if (res?.accessToken) setTokens(res.accessToken, res.refreshToken)
    return res
  },
  logout: async () => {
    await apiFetch('/auth/logout', { method: 'POST' })
    clearTokens()
  },
  getProfile: () => apiFetch('/auth/profile'),
  updateProfile: (data) => apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data) => apiFetch('/auth/change-password', { method: 'PUT', body: JSON.stringify(data) }),
}

// ─── Income API ───────────────────────────────────────────────────────────────
export const incomeAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiFetch(`/income${qs ? `?${qs}` : ''}`)
  },
  getById: (id) => apiFetch(`/income/${id}`),
  create: (data) => apiFetch('/income', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/income/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/income/${id}`, { method: 'DELETE' }),
  getAnalytics: () => apiFetch('/income/analytics'),
}

// ─── Expense API ──────────────────────────────────────────────────────────────
export const expenseAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiFetch(`/expenses${qs ? `?${qs}` : ''}`)
  },
  getById: (id) => apiFetch(`/expenses/${id}`),
  create: (data) => apiFetch('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/expenses/${id}`, { method: 'DELETE' }),
  cancel: (id) => apiFetch(`/expenses/${id}/cancel`, { method: 'PATCH' }),
  getAnalytics: () => apiFetch('/expenses/analytics'),
  getDashboard: () => apiFetch('/expenses/dashboard'),
}
