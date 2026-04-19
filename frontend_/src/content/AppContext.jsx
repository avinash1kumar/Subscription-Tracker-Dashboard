import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, incomeAPI, expenseAPI, subscriptionAPI } from '../utils/api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // ─── Auth State ─────────────────────────────────────────────────────────────
  const [user, setUser]               = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // ─── Data State ─────────────────────────────────────────────────────────────
  const [income, setIncome]             = useState([])
  const [expenses, setExpenses]         = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)

  // ─── UI State ───────────────────────────────────────────────────────────────
  const [activePage, setActivePage] = useState('dashboard')

  // ─── On Mount: restore session if token exists ───────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      authAPI.getProfile()
        .then(res => setUser(res.user))
        .catch(() => {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        })
        .finally(() => setAuthLoading(false))
    } else {
      setAuthLoading(false)
    }
  }, [])

  // ─── Fetch data when user logs in ────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      fetchIncome()
      fetchExpenses()
      fetchSubscriptions()
    }
  }, [user])

  // ─── Auth ────────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setError(null)
    const res = await authAPI.login({ email, password })
    setUser(res.user)
    return res
  }, [])

  const register = useCallback(async (name, email, password) => {
    setError(null)
    const res = await authAPI.register({ name, email, password })
    setUser(res.user)
    return res
  }, [])

  const logout = useCallback(async () => {
    await authAPI.logout()
    setUser(null)
    setIncome([])
    setExpenses([])
    setSubscriptions([])
    setActivePage('dashboard')
  }, [])

  // ─── Income ──────────────────────────────────────────────────────────────────
  const fetchIncome = useCallback(async () => {
    try {
      setLoading(true)
      const res = await incomeAPI.getAll({ limit: 100, sort: '-date' })
      setIncome(res.income || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const addIncome = useCallback(async (entry) => {
    const res = await incomeAPI.create(entry)
    setIncome(prev => [res.income, ...prev])
    return res.income
  }, [])

  const updateIncome = useCallback(async (id, data) => {
    const res = await incomeAPI.update(id, data)
    setIncome(prev => prev.map(i => i._id === id ? res.income : i))
    return res.income
  }, [])

  const deleteIncome = useCallback(async (id) => {
    await incomeAPI.delete(id)
    setIncome(prev => prev.filter(i => i._id !== id))
  }, [])

  // ─── Expenses ─────────────────────────────────────────────────────────────────
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true)
      const res = await expenseAPI.getAll({ limit: 100, sort: '-date' })
      setExpenses(res.expenses || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const addExpense = useCallback(async (entry) => {
    const res = await expenseAPI.create(entry)
    setExpenses(prev => [res.expense, ...prev])
    return res.expense
  }, [])

  const updateExpense = useCallback(async (id, data) => {
    const res = await expenseAPI.update(id, data)
    setExpenses(prev => prev.map(e => e._id === id ? res.expense : e))
    return res.expense
  }, [])

  const deleteExpense = useCallback(async (id) => {
    await expenseAPI.delete(id)
    setExpenses(prev => prev.filter(e => e._id !== id))
  }, [])

  // ─── Subscriptions ────────────────────────────────────────────────────────────
  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true)
      const res = await subscriptionAPI.getAll({ limit: 100, sortBy: 'nextBilling' })
      setSubscriptions(res.subscriptions || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const addSubscription = useCallback(async (entry) => {
    const res = await subscriptionAPI.create(entry)
    setSubscriptions(prev => [res.subscription, ...prev])
    return res.subscription
  }, [])

  const updateSubscription = useCallback(async (id, data) => {
    const res = await subscriptionAPI.update(id, data)
    setSubscriptions(prev => prev.map(s => s._id === id ? res.subscription : s))
    return res.subscription
  }, [])

  const deleteSubscription = useCallback(async (id) => {
    await subscriptionAPI.delete(id)
    setSubscriptions(prev => prev.filter(s => s._id !== id))
  }, [])

  const toggleSubscriptionStatus = useCallback(async (id) => {
    const res = await subscriptionAPI.toggleStatus(id)
    setSubscriptions(prev => prev.map(s => s._id === id ? res.subscription : s))
    return res.subscription
  }, [])

  // ─── Derived Values ───────────────────────────────────────────────────────────
  const totalIncome   = income.reduce((sum, i) => sum + i.amount, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const balance       = totalIncome - totalExpenses
  const savingsRate   = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0

  return (
    <AppContext.Provider value={{
      // Auth
      user, authLoading, login, register, logout,
      // Data
      income, expenses, subscriptions, loading, error,
      // Income actions
      addIncome, updateIncome, deleteIncome,
      // Expense actions
      addExpense, updateExpense, deleteExpense,
      // Subscription actions
      addSubscription, updateSubscription, deleteSubscription,
      toggleSubscriptionStatus, fetchSubscriptions,
      fetchIncome, fetchExpenses,
      // UI
      activePage, setActivePage,
      // Derived
      totalIncome, totalExpenses, balance, savingsRate,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
