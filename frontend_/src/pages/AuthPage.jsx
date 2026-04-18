import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Eye, EyeOff, Loader } from 'lucide-react'
import { useApp } from '../content/AppContext'

export default function AuthPage() {
  const { login, register } = useApp()
  const [mode, setMode]         = useState('login')   // 'login' | 'register'
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [form, setForm]         = useState({ name: '', email: '', password: '' })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError('')

    // Basic client-side checks
    if (!form.email || !form.password) return setError('Email and password are required.')
    if (mode === 'register' && !form.name)  return setError('Name is required.')
    if (form.password.length < 6)           return setError('Password must be at least 6 characters.')

    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register(form.name, form.email, form.password)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background */}
      <div className="fixed inset-0" style={{
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #1a0533 100%)'
      }} />

      {/* Animated orbs */}
      <motion.div className="fixed top-[-10%] left-[-5%] w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(121,40,202,0.35) 0%, transparent 70%)', filter: 'blur(40px)' }}
        animate={{ x: [0,30,0], y: [0,-20,0] }} transition={{ duration: 8, repeat: Infinity }} />
      <motion.div className="fixed bottom-[-10%] right-[-5%] w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,0,128,0.25) 0%, transparent 70%)', filter: 'blur(50px)' }}
        animate={{ x: [0,-20,0], y: [0,-30,0] }} transition={{ duration: 10, repeat: Infinity, delay: 1 }} />

      {/* Card */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #7928CA, #FF0080)' }}>
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-white text-3xl">SubFlow</h1>
          <p className="text-white/40 text-sm mt-1">Subscription Tracker</p>
        </div>

        {/* Form card */}
        <div className="rounded-3xl p-8" style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* Mode toggle */}
          <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
            {['login','register'].map(m => (
              <button key={m}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all"
                style={mode === m
                  ? { background: 'linear-gradient(135deg, #7928CA, #FF0080)', color: 'white' }
                  : { color: 'rgba(255,255,255,0.4)' }}
                onClick={() => { setMode(m); setError('') }}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 10 : -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Name field (register only) */}
              {mode === 'register' && (
                <div className="mb-4">
                  <label className="text-xs text-white/50 font-semibold uppercase tracking-wider block mb-2">
                    Full Name
                  </label>
                  <input
                    className="input-field"
                    placeholder="Alex Kumar"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                </div>
              )}

              {/* Email */}
              <div className="mb-4">
                <label className="text-xs text-white/50 font-semibold uppercase tracking-wider block mb-2">
                  Email
                </label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="alex@example.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus={mode === 'login'}
                />
              </div>

              {/* Password */}
              <div className="mb-6">
                <label className="text-xs text-white/50 font-semibold uppercase tracking-wider block mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    className="input-field pr-12"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                    onClick={() => setShowPass(s => !s)}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  className="mb-4 px-4 py-3 rounded-xl text-sm text-rose-300"
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  ⚠ {error}
                </motion.div>
              )}

              {/* Submit */}
              <motion.button
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base font-semibold"
                onClick={handleSubmit}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                style={{ opacity: loading ? 0.8 : 1 }}
              >
                {loading ? (
                  <><Loader size={16} className="animate-spin" /> <span>Please wait...</span></>
                ) : (
                  <span>{mode === 'login' ? 'Sign In →' : 'Create Account →'}</span>
                )}
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>

        {mode === 'login' && (
          <p className="text-center text-white/30 text-xs mt-4">
            Demo: use any email + 6+ character password after registering
          </p>
        )}
      </motion.div>
    </div>
  )
}
