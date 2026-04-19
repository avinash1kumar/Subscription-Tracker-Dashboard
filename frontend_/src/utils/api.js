// ─────────────────────────────────────────────────────────────────────────────
//  SubFlow API Client  —  src/utils/api.js
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ─── Token helpers ────────────────────────────────────────────────────────────
const getToken     = ()           => localStorage.getItem('accessToken')
const setTokens    = (a, r)       => { localStorage.setItem('accessToken', a); localStorage.setItem('refreshToken', r) }
const clearTokens  = ()           => { localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken') }

// ─── Auto refresh on 401 ──────────────────────────────────────────────────────
let isRefreshing = false
let refreshQueue = []

const processQueue = (token) => {
  refreshQueue.forEach(resolve => resolve(token))
  refreshQueue = []
}

const tryRefreshToken = async () => {
  if (isRefreshing) {
    return new Promise(resolve => refreshQueue.push(resolve))
  }
  isRefreshing = true
  try {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) throw new Error('No refresh token')
    const res  = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) throw new Error('Refresh failed')
    const data = await res.json()
    setTokens(data.accessToken, data.refreshToken)
    processQueue(data.accessToken)
    return data.accessToken
  } catch {
    clearTokens()
    return null
  } finally {
    isRefreshing = false
  }
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
const apiFetch = async (endpoint, options = {}, retry = true) => {
  const token   = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })

  // Auto refresh on 401
  if (res.status === 401 && retry && endpoint !== '/auth/login') {
    const newToken = await tryRefreshToken()
    if (newToken) {
      return apiFetch(endpoint, options, false)
    } else {
      window.dispatchEvent(new Event('auth:logout'))
      throw new Error('Session expired. Please log in again.')
    }
  }

  const data = await res.json()

  if (!res.ok) {
    const error     = new Error(data.message || 'Request failed')
    error.errors    = data.errors
    error.status    = res.status
    throw error
  }

  return data
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }).then(res => {
      if (res.accessToken) setTokens(res.accessToken, res.refreshToken)
      return res
    }),

  login: (data) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }).then(res => {
      if (res.accessToken) setTokens(res.accessToken, res.refreshToken)
      return res
    }),

  logout: async () => {
    try { await apiFetch('/auth/logout', { method: 'POST' }) } catch {}
    clearTokens()
  },

  getProfile:     ()     => apiFetch('/auth/profile'),
  updateProfile:  (data) => apiFetch('/auth/profile',         { method: 'PUT',    body: JSON.stringify(data) }),
  changePassword: (data) => apiFetch('/auth/change-password', { method: 'PUT',    body: JSON.stringify(data) }),

  // Preferences (appearance settings)
  getPreferences:    ()     => apiFetch('/auth/preferences'),
  updatePreferences: (data) => apiFetch('/auth/preferences',          { method: 'PUT',    body: JSON.stringify(data) }),

  // Notification settings
  getNotificationSettings:    ()     => apiFetch('/auth/notification-settings'),
  updateNotificationSettings: (data) => apiFetch('/auth/notification-settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Account deletion
  deleteAccount: (data) => apiFetch('/auth/account', { method: 'DELETE', body: JSON.stringify(data) }),
}

// ─── Income API ───────────────────────────────────────────────────────────────
export const incomeAPI = {
  getAll:       (params = {}) => apiFetch(`/income?${new URLSearchParams(params)}`),
  getById:      (id)          => apiFetch(`/income/${id}`),
  create:       (data)        => apiFetch('/income',      { method: 'POST',   body: JSON.stringify(data) }),
  update:       (id, data)    => apiFetch(`/income/${id}`,{ method: 'PUT',    body: JSON.stringify(data) }),
  delete:       (id)          => apiFetch(`/income/${id}`,{ method: 'DELETE' }),
  getAnalytics: ()            => apiFetch('/income/analytics'),
}

// ─── Expense API ──────────────────────────────────────────────────────────────
export const expenseAPI = {
  getAll:       (params = {}) => apiFetch(`/expenses?${new URLSearchParams(params)}`),
  getById:      (id)          => apiFetch(`/expenses/${id}`),
  create:       (data)        => apiFetch('/expenses',       { method: 'POST',  body: JSON.stringify(data) }),
  update:       (id, data)    => apiFetch(`/expenses/${id}`, { method: 'PUT',   body: JSON.stringify(data) }),
  delete:       (id)          => apiFetch(`/expenses/${id}`, { method: 'DELETE' }),
  cancel:       (id)          => apiFetch(`/expenses/${id}/cancel`, { method: 'PATCH' }),
  getAnalytics: ()            => apiFetch('/expenses/analytics'),
  getDashboard: ()            => apiFetch('/expenses/dashboard'),
}

// ─── Subscription API ─────────────────────────────────────────────────────────
export const subscriptionAPI = {
  getAll:       (params = {}) => apiFetch(`/subscriptions?${new URLSearchParams(params)}`),
  getById:      (id)          => apiFetch(`/subscriptions/${id}`),
  create:       (data)        => apiFetch('/subscriptions',        { method: 'POST',   body: JSON.stringify(data) }),
  update:       (id, data)    => apiFetch(`/subscriptions/${id}`,  { method: 'PUT',    body: JSON.stringify(data) }),
  delete:       (id)          => apiFetch(`/subscriptions/${id}`,  { method: 'DELETE' }),
  toggleStatus: (id)          => apiFetch(`/subscriptions/${id}/toggle`, { method: 'PATCH' }),
  bulkDelete:   (ids)         => apiFetch('/subscriptions/bulk',   { method: 'DELETE', body: JSON.stringify({ ids }) }),
  getAnalytics: ()            => apiFetch('/subscriptions/analytics'),
  getUpcoming:  (days = 7)    => apiFetch(`/subscriptions/upcoming?days=${days}`),
}
