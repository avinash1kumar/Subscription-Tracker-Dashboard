// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Lock, Bell, Palette, Database,
  Download, Trash2, LogOut, ChevronRight,
  Check, Eye, EyeOff, Shield, Globe,
  Moon, Sun, Smartphone, Save, RefreshCw,
} from 'lucide-react'
import { useApp } from '../content/AppContext'
import { authAPI } from '../utils/api'

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
      style={{ background: checked ? 'linear-gradient(135deg, #7928CA, #FF0080)' : 'rgba(255,255,255,0.12)' }}
    >
      <motion.span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
        animate={{ left: checked ? '22px' : '2px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, accent = '#7928CA' }) {
  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Section header */}
      <div className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}20` }}>
          <Icon size={15} style={{ color: accent }} />
        </div>
        <h2 className="font-display font-bold text-white text-sm">{title}</h2>
      </div>
      <div className="divide-y divide-white/[0.04]">{children}</div>
    </motion.div>
  )
}

// ── Setting row ───────────────────────────────────────────────────────────────
function Row({ label, desc, children, danger }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${danger ? 'text-rose-400' : 'text-white'}`}>{label}</p>
        {desc && <p className="text-xs text-white/35 mt-0.5 leading-relaxed">{desc}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

// ── Input field ───────────────────────────────────────────────────────────────
function SettingsInput({ value, onChange, placeholder, type = 'text', disabled }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="input-field text-sm"
      style={{
        maxWidth: 240,
        ...(focused ? { borderColor: 'rgba(121,40,202,0.6)', boxShadow: '0 0 0 3px rgba(121,40,202,0.12)' } : {}),
        ...(disabled ? { opacity: 0.4, cursor: 'not-allowed' } : {}),
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

// ── Toast notification ────────────────────────────────────────────────────────
function Toast({ message, type = 'success' }) {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold text-white shadow-2xl"
      style={{
        background: type === 'success'
          ? 'linear-gradient(135deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9))'
          : 'linear-gradient(135deg, rgba(239,68,68,0.9), rgba(220,38,38,0.9))',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
    >
      {type === 'success' ? <Check size={15} /> : <Shield size={15} />}
      {message}
    </motion.div>
  )
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ title, message, onConfirm, onCancel, danger }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <motion.div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: 'rgba(17,17,28,0.98)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
        initial={{ scale: 0.94 }} animate={{ scale: 1 }}
      >
        <div className="text-3xl mb-3">{danger ? '⚠️' : '❓'}</div>
        <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
        <p className="text-white/50 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white/40 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={danger
              ? { background: 'linear-gradient(135deg, #ef4444, #dc2626)' }
              : { background: 'linear-gradient(135deg, #7928CA, #FF0080)' }}>
            Confirm
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Settings page ────────────────────────────────────────────────────────
export default function Settings() {
  const { user, logout, income, expenses, subscriptions } = useApp()

  // ── Profile state ─────────────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    name:     user?.name     || '',
    email:    user?.email    || '',
    currency: user?.currency || 'INR',
  })
  const [savingProfile, setSavingProfile] = useState(false)

  // ── Password state ────────────────────────────────────────────────────────
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [showPass,  setShowPass]  = useState({ current: false, new: false, confirm: false })
  const [savingPass, setSavingPass] = useState(false)

  // ── Preferences — load from backend on mount ──────────────────────────────
  const [prefs, setPrefs] = useState({
    compact:     false,
    animations:  true,
    showBalance: true,
    dateFormat:  'en-IN',
  })
  const [loadingPrefs, setLoadingPrefs] = useState(true)

  // ── Notification settings — load from backend on mount ────────────────────
  const [notifSettings, setNotifSettings] = useState({
    billing:    true,
    sevenDay:   true,
    threeDay:   true,
    overdue:    true,
    insights:   true,
    milestones: true,
  })
  const [savingNotif, setSavingNotif] = useState(false)

  // ── Delete account ────────────────────────────────────────────────────────
  const [deletePassword, setDeletePassword] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)

  // ── Toast / dialogs ───────────────────────────────────────────────────────
  const [toast,   setToast]   = useState(null)
  const [confirm, setConfirm] = useState(null)

  // ── Load preferences and notification settings from backend on mount ──────
  useEffect(() => {
    Promise.all([
      authAPI.getPreferences().catch(() => null),
      authAPI.getNotificationSettings().catch(() => null),
    ]).then(([prefsRes, notifRes]) => {
      if (prefsRes?.preferences) setPrefs(prefsRes.preferences)
      if (notifRes?.notificationSettings) setNotifSettings(notifRes.notificationSettings)
    }).finally(() => setLoadingPrefs(false))
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Save Profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!profile.name.trim()) return showToast('Name cannot be empty', 'error')
    setSavingProfile(true)
    try {
      await authAPI.updateProfile({ name: profile.name, currency: profile.currency })
      showToast('Profile updated successfully!')
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  // ── Change Password ───────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!passwords.current)         return showToast('Enter your current password', 'error')
    if (passwords.new.length < 6)   return showToast('New password must be at least 6 characters', 'error')
    if (passwords.new !== passwords.confirm) return showToast('Passwords do not match', 'error')
    setSavingPass(true)
    try {
      await authAPI.changePassword({ currentPassword: passwords.current, newPassword: passwords.new })
      setPasswords({ current: '', new: '', confirm: '' })
      showToast('Password changed successfully!')
    } catch (err) {
      showToast(err.message || 'Failed to change password', 'error')
    } finally {
      setSavingPass(false)
    }
  }

  // ── Update a single preference and save to backend ────────────────────────
  const handlePrefChange = async (key, value) => {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    try {
      await authAPI.updatePreferences({ [key]: value })
    } catch {
      // revert on failure
      setPrefs(prefs)
      showToast('Failed to save preference', 'error')
    }
  }

  // ── Update a single notification setting and save to backend ──────────────
  const handleNotifChange = async (key, value) => {
    const next = { ...notifSettings, [key]: value }
    setNotifSettings(next)
    setSavingNotif(true)
    try {
      await authAPI.updateNotificationSettings({ [key]: value })
    } catch {
      setNotifSettings(notifSettings)
      showToast('Failed to save notification setting', 'error')
    } finally {
      setSavingNotif(false)
    }
  }

  // ── Export data ───────────────────────────────────────────────────────────
  const handleExportData = () => {
    const data = { exportedAt: new Date().toISOString(), income, expenses, subscriptions }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `subflow-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Data exported successfully!')
  }

  // ── Delete account ────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (!deletePassword) return showToast('Enter your password to confirm', 'error')
    setDeletingAccount(true)
    try {
      await authAPI.deleteAccount({ password: deletePassword })
      await logout()
    } catch (err) {
      showToast(err.message || 'Failed to delete account', 'error')
    } finally {
      setDeletingAccount(false)
      setConfirm(null)
    }
  }

  const handleLogout = () => setConfirm({
    title:   'Sign Out',
    message: 'Are you sure you want to sign out of SubFlow?',
    danger:  false,
    action:  logout,
  })

  const togglePass = (field) => setShowPass(p => ({ ...p, [field]: !p[field] }))
  const totalItems = income.length + expenses.length + subscriptions.length

  return (
    <div className="space-y-5 max-w-2xl">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="font-display font-bold text-white text-2xl">Settings</h1>
        <p className="text-white/40 text-xs mt-1">Manage your account and preferences</p>
      </div>

      {/* ── Profile card ───────────────────────────────────────────────── */}
      <motion.div
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, rgba(121,40,202,0.2), rgba(255,0,128,0.15))', border: '1px solid rgba(139,92,246,0.25)' }}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7928CA, #FF0080)' }}>
          {(user?.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-white text-lg leading-tight truncate">{user?.name || 'User'}</p>
          <p className="text-white/50 text-sm truncate">{user?.email || 'No email'}</p>
          <div className="flex gap-3 mt-1.5 flex-wrap">
            <span className="text-[10px] text-violet-300 font-semibold">{income.length} income entries</span>
            <span className="text-white/20 text-[10px]">·</span>
            <span className="text-[10px] text-rose-300 font-semibold">{expenses.length} expenses</span>
            <span className="text-white/20 text-[10px]">·</span>
            <span className="text-[10px] text-cyan-300 font-semibold">{subscriptions.length} subscriptions</span>
          </div>
        </div>
      </motion.div>

      {/* ── Profile settings ───────────────────────────────────────────── */}
      <Section title="Profile" icon={User} accent="#6366f1">
        <Row label="Full Name" desc="Your display name across the app">
          <SettingsInput
            value={profile.name}
            onChange={v => setProfile(p => ({ ...p, name: v }))}
            placeholder="Your name"
          />
        </Row>
        <Row label="Email Address" desc="Email cannot be changed">
          <SettingsInput
            value={profile.email}
            onChange={() => {}}
            placeholder="you@example.com"
            type="email"
            disabled
          />
        </Row>
        <Row label="Currency" desc="Display currency for all amounts">
          <select
            value={profile.currency}
            onChange={e => setProfile(p => ({ ...p, currency: e.target.value }))}
            className="input-field text-sm cursor-pointer"
            style={{ maxWidth: 120 }}
          >
            {[['INR','₹ INR'],['USD','$ USD'],['EUR','€ EUR'],['GBP','£ GBP']].map(([v,l]) => (
              <option key={v} value={v} className="bg-gray-900">{l}</option>
            ))}
          </select>
        </Row>
        <Row label="" desc="">
          <motion.button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-semibold"
            whileHover={{ scale: savingProfile ? 1 : 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{ opacity: savingProfile ? 0.7 : 1 }}
          >
            {savingProfile
              ? <><RefreshCw size={13} className="animate-spin" /> Saving…</>
              : <><Save size={13} /> Save Profile</>}
          </motion.button>
        </Row>
      </Section>

      {/* ── Security ───────────────────────────────────────────────────── */}
      <Section title="Security" icon={Lock} accent="#ec4899">
        {[
          { field: 'current', label: 'Current Password',  placeholder: 'Enter current password'  },
          { field: 'new',     label: 'New Password',      placeholder: 'Min 6 characters'         },
          { field: 'confirm', label: 'Confirm Password',  placeholder: 'Repeat new password'      },
        ].map(({ field, label, placeholder }) => (
          <Row key={field} label={label}>
            <div className="relative" style={{ maxWidth: 240 }}>
              <input
                type={showPass[field] ? 'text' : 'password'}
                value={passwords[field]}
                onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))}
                placeholder={placeholder}
                className="input-field text-sm pr-10 w-full"
              />
              <button
                onClick={() => togglePass(field)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
              >
                {showPass[field] ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </Row>
        ))}
        <Row label="" desc="">
          <motion.button
            onClick={handleChangePassword}
            disabled={savingPass}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-rose-400 transition-colors"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', opacity: savingPass ? 0.7 : 1 }}
            whileHover={{ scale: savingPass ? 1 : 1.02 }}
          >
            {savingPass
              ? <><RefreshCw size={13} className="animate-spin" /> Updating…</>
              : <><Lock size={13} /> Change Password</>}
          </motion.button>
        </Row>
      </Section>

      {/* ── Notification settings ───────────────────────────────────────── */}
      <Section title="Notifications" icon={Bell} accent="#f59e0b">
        {loadingPrefs ? (
          <div className="px-5 py-8 text-center text-white/30 text-sm">Loading settings…</div>
        ) : (
          <>
            {[
              { key: 'billing',    label: 'Billing alerts',        desc: 'Get notified before subscription bills are due'      },
              { key: 'sevenDay',   label: '7-day advance notice',  desc: 'Alert 7 days before any billing date'                },
              { key: 'threeDay',   label: '3-day advance notice',  desc: 'Alert 3 days before any billing date'                },
              { key: 'overdue',    label: 'Overdue payment alert',  desc: 'Alert when a payment date has passed'                },
              { key: 'insights',   label: 'Financial insights',     desc: 'Smart tips based on your income vs expense ratio'    },
              { key: 'milestones', label: 'Milestone alerts',       desc: 'Celebrate when you hit income or savings milestones' },
            ].map(({ key, label, desc }) => (
              <Row key={key} label={label} desc={desc}>
                <Toggle
                  checked={notifSettings[key] !== false}
                  onChange={v => handleNotifChange(key, v)}
                />
              </Row>
            ))}
            {savingNotif && (
              <div className="px-5 py-2 text-xs text-white/30 flex items-center gap-1.5">
                <RefreshCw size={10} className="animate-spin" /> Saving…
              </div>
            )}
          </>
        )}
      </Section>

      {/* ── Appearance ─────────────────────────────────────────────────── */}
      <Section title="Appearance" icon={Palette} accent="#8b5cf6">
        {loadingPrefs ? (
          <div className="px-5 py-8 text-center text-white/30 text-sm">Loading settings…</div>
        ) : (
          <>
            <Row label="Compact mode" desc="Show more data with reduced spacing">
              <Toggle checked={!!prefs.compact} onChange={v => handlePrefChange('compact', v)} />
            </Row>
            <Row label="Animations" desc="Enable smooth page and card animations">
              <Toggle checked={prefs.animations !== false} onChange={v => handlePrefChange('animations', v)} />
            </Row>
            <Row label="Show balance in sidebar" desc="Display net balance in the sidebar card">
              <Toggle checked={prefs.showBalance !== false} onChange={v => handlePrefChange('showBalance', v)} />
            </Row>
            <Row label="Date format" desc="How dates are displayed across the app">
              <select
                value={prefs.dateFormat || 'en-IN'}
                onChange={e => handlePrefChange('dateFormat', e.target.value)}
                className="input-field text-sm cursor-pointer"
                style={{ maxWidth: 160 }}
              >
                <option value="en-IN" className="bg-gray-900">DD MMM YYYY</option>
                <option value="en-US" className="bg-gray-900">MM/DD/YYYY</option>
                <option value="en-GB" className="bg-gray-900">DD/MM/YYYY</option>
              </select>
            </Row>
          </>
        )}
      </Section>

      {/* ── Data management ─────────────────────────────────────────────── */}
      <Section title="Data & Privacy" icon={Database} accent="#10b981">
        <Row label="Export all data" desc={`Download all your data as JSON (${totalItems} records)`}>
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-emerald-400 hover:opacity-80 transition-opacity"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            <Download size={13} /> Export JSON
          </button>
        </Row>
        <Row label="Data summary" desc="Overview of your stored records">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span className="text-violet-400 font-semibold">{income.length}</span> income ·
            <span className="text-rose-400 font-semibold">{expenses.length}</span> expenses ·
            <span className="text-cyan-400 font-semibold">{subscriptions.length}</span> subs
          </div>
        </Row>
      </Section>

      {/* ── Account danger zone ─────────────────────────────────────────── */}
      <Section title="Account" icon={Shield} accent="#ef4444">
        <Row label="Sign out" desc="Sign out from your current session">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white/60 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <LogOut size={13} /> Sign Out
          </button>
        </Row>
        <Row
          label="Delete account"
          desc="Permanently delete your account and ALL data. This cannot be undone."
          danger
        >
          <button
            onClick={() => setConfirm({
              title:   'Delete Account',
              message: 'This will permanently delete your account and all data (income, expenses, subscriptions). This action cannot be undone.',
              danger:  true,
              action:  handleDeleteAccount,
              requiresPassword: true,
            })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-rose-400 hover:opacity-80 transition-opacity"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <Trash2 size={13} /> Delete Account
          </button>
        </Row>
      </Section>

      {/* ── App info ───────────────────────────────────────────────────── */}
      <div className="text-center pb-4 space-y-1">
        <p className="text-white/20 text-xs font-mono">SubFlow v2.0</p>
        <p className="text-white/15 text-xs">React + Tailwind + Node.js + MongoDB</p>
      </div>

      {/* ── Toast ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      {/* ── Confirm dialog ────────────────────────────────────────────── */}
      <AnimatePresence>
        {confirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setConfirm(null)}
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: 'rgba(17,17,28,0.98)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
              initial={{ scale: 0.94 }} animate={{ scale: 1 }}
            >
              <div className="text-3xl mb-3">{confirm.danger ? '⚠️' : '❓'}</div>
              <h3 className="text-white font-bold text-lg mb-1">{confirm.title}</h3>
              <p className="text-white/50 text-sm mb-4">{confirm.message}</p>

              {/* Password input for account deletion */}
              {confirm.requiresPassword && (
                <div className="mb-4">
                  <label className="text-xs text-white/40 font-semibold uppercase tracking-wider block mb-1.5">
                    Confirm with your password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    className="input-field text-sm w-full"
                    autoFocus
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setConfirm(null); setDeletePassword('') }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white/40 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirm.action}
                  disabled={deletingAccount}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{
                    background: confirm.danger
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                      : 'linear-gradient(135deg, #7928CA, #FF0080)',
                    opacity: deletingAccount ? 0.7 : 1,
                  }}
                >
                  {deletingAccount ? 'Deleting…' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
