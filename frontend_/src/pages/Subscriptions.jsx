import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Trash2, Pencil, RotateCcw,
  PauseCircle, Calendar, TrendingDown, Zap,
  LayoutGrid, List, AlertTriangle,
} from 'lucide-react'
import { useApp } from '../content/AppContext'
import { fmt, getDaysUntil, CATEGORY_COLORS } from '../utils/helpers'

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Entertainment','Music','Software','Social Media',
  'Professional','Health','Education','Finance','Gaming','Other',
]
const CYCLES   = ['monthly','yearly','quarterly','weekly']
const EMOJI_LIST = [
  '🎬','🎵','💼','☁️','🎨','🏋️','📱','🎮','📰','🛡️',
  '💰','📈','▶️','🌐','🎓','🏥','✈️','🍔','🛒','📦',
  '🔐','🎯','🧘','📚','🎤','🎧','🖥️','🤖','🌍','⚡',
]

const EMPTY_FORM = {
  name: '', price: '', cycle: 'monthly',
  nextBilling: '', category: 'Entertainment',
  status: 'active', emoji: '🎬', notes: '',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const toMonthly = (price, cycle) => {
  const map = { monthly: 1, yearly: 1/12, quarterly: 1/3, weekly: 52/12 }
  return Math.round(price * (map[cycle] || 1))
}

// ── Sub components ────────────────────────────────────────────────────────────
const UrgencyBadge = ({ dateStr, status }) => {
  if (status === 'cancelled') return <span className="text-xs text-white/20">—</span>
  const days = getDaysUntil(dateStr)
  if (days === null) return null
  const color = days <= 0 ? 'text-rose-400' : days <= 3 ? 'text-rose-400' : days <= 7 ? 'text-amber-400' : 'text-white/40'
  const bg    = days <= 0 ? 'rgba(239,68,68,0.15)' : days <= 3 ? 'rgba(239,68,68,0.1)' : days <= 7 ? 'rgba(245,158,11,0.1)' : 'transparent'
  const label = days <= 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `${days}d`
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${color}`} style={{ background: bg }}>
      {label}
    </span>
  )
}

const CyclePill = ({ cycle }) => {
  const colors = { monthly: 'text-violet-400', yearly: 'text-cyan-400', quarterly: 'text-amber-400', weekly: 'text-green-400' }
  const bgs    = { monthly: 'rgba(139,92,246,0.15)', yearly: 'rgba(6,182,212,0.15)', quarterly: 'rgba(245,158,11,0.15)', weekly: 'rgba(16,185,129,0.15)' }
  return (
    <span className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${colors[cycle] || 'text-white/40'}`}
      style={{ background: bgs[cycle] || 'rgba(255,255,255,0.06)' }}>
      {cycle}
    </span>
  )
}

// ── Modal form ────────────────────────────────────────────────────────────────
function SubModal({ open, onClose, onSave, editTarget, saving }) {
  const [form, setForm]   = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  React.useEffect(() => {
    if (editTarget) {
      setForm({
        name:        editTarget.name        || '',
        price:       String(editTarget.price || ''),
        cycle:       editTarget.cycle       || 'monthly',
        nextBilling: editTarget.nextBilling ? editTarget.nextBilling.split('T')[0] : '',
        category:    editTarget.category    || 'Entertainment',
        status:      editTarget.status      || 'active',
        emoji:       editTarget.emoji       || '🎬',
        notes:       editTarget.notes       || '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
  }, [editTarget, open])

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.name.trim())                                  e.name        = 'Name is required'
    if (!form.price || isNaN(form.price) || +form.price<=0) e.price       = 'Valid price required'
    if (!form.nextBilling)                                  e.nextBilling = 'Date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSave({ ...form, price: Number(form.price) })
  }

  const today = new Date().toISOString().split('T')[0]
  const preview = form.price && form.cycle !== 'monthly'
    ? `≈ ${fmt(toMonthly(+form.price, form.cycle))}/mo`
    : null

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(17,17,28,0.99), rgba(12,10,25,0.99))',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
          }}
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                {form.emoji}
              </div>
              <div>
                <h2 className="font-display font-bold text-white text-lg leading-none">
                  {editTarget ? 'Edit Subscription' : 'Add Subscription'}
                </h2>
                <p className="text-white/40 text-xs mt-0.5">Fill in the details below</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              ✕
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Emoji picker */}
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">Icon</label>
              <div className="flex flex-wrap gap-1.5">
                {EMOJI_LIST.map(e => (
                  <button key={e} type="button" onClick={() => set('emoji', e)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all"
                    style={form.emoji === e
                      ? { background: 'rgba(99,102,241,0.25)', border: '2px solid rgba(99,102,241,0.7)', transform: 'scale(1.1)' }
                      : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Name *</label>
              <input className="input-field" placeholder="e.g. Netflix, Spotify, AWS…"
                value={form.name} onChange={e => set('name', e.target.value)}
                style={errors.name ? { borderColor: 'rgba(239,68,68,0.6)' } : {}} />
              {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Price + Cycle */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Price (₹) *</label>
                <input className="input-field" type="number" placeholder="499"
                  value={form.price} onChange={e => set('price', e.target.value)}
                  style={errors.price ? { borderColor: 'rgba(239,68,68,0.6)' } : {}} />
                {errors.price
                  ? <p className="text-rose-400 text-xs mt-1">{errors.price}</p>
                  : preview && <p className="text-violet-400 text-xs mt-1">{preview}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Cycle</label>
                <select className="input-field cursor-pointer" value={form.cycle} onChange={e => set('cycle', e.target.value)}>
                  {CYCLES.map(c => <option key={c} value={c} className="bg-gray-900 capitalize">{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
            </div>

            {/* Next Billing + Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Next Billing *</label>
                <input className="input-field" type="date" min={today}
                  value={form.nextBilling} onChange={e => set('nextBilling', e.target.value)}
                  style={errors.nextBilling ? { borderColor: 'rgba(239,68,68,0.6)' } : {}} />
                {errors.nextBilling && <p className="text-rose-400 text-xs mt-1">{errors.nextBilling}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Category</label>
                <select className="input-field cursor-pointer" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">Status</label>
              <div className="flex gap-2">
                {['active','cancelled'].map(s => (
                  <button key={s} type="button" onClick={() => set('status', s)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all"
                    style={form.status === s
                      ? { background: s === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: s === 'active' ? '#34d399' : '#f87171', border: `1px solid ${s === 'active' ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}` }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {s === 'active' ? '✅ Active' : '⏸ Cancelled'}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Notes (optional)</label>
              <textarea className="input-field resize-none" rows={2} placeholder="Any additional info…"
                value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white/40 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Cancel
            </button>
            <motion.button
              className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold"
              onClick={handleSubmit} disabled={saving}
              whileHover={{ scale: saving ? 1 : 1.01 }} whileTap={{ scale: saving ? 1 : 0.98 }}
              style={{ opacity: saving ? 0.8 : 1 }}
            >
              {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Add Subscription'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Delete confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({ name, onConfirm, onCancel }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="rounded-2xl p-6 max-w-sm w-full"
        style={{ background: 'rgba(17,17,28,0.98)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
        initial={{ scale: 0.94 }} animate={{ scale: 1 }}>
        <div className="text-3xl mb-3">🗑️</div>
        <h3 className="text-white font-bold text-lg mb-1">Delete Subscription</h3>
        <p className="text-white/50 text-sm mb-6">
          Remove <span className="text-white font-semibold">{name}</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white/40 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Subscriptions() {
  const {
    subscriptions, addSubscription, updateSubscription,
    deleteSubscription, toggleSubscriptionStatus,
  } = useApp()

  const [modalOpen,    setModalOpen]    = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving,       setSaving]       = useState(false)
  const [apiError,     setApiError]     = useState('')
  const [search,       setSearch]       = useState('')
  const [filterCat,    setFilterCat]    = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [sortBy,       setSortBy]       = useState('nextBilling')
  const [viewMode,     setViewMode]     = useState('table') // table | grid

  // ── Derived data ──────────────────────────────────────────────────────────
  const activeSubs = useMemo(() => subscriptions.filter(s => s.status === 'active'), [subscriptions])

  const totalMonthly = useMemo(
    () => activeSubs.reduce((sum, s) => sum + toMonthly(s.price, s.cycle), 0),
    [activeSubs]
  )

  const upcomingCount = useMemo(
    () => activeSubs.filter(s => s.nextBilling && getDaysUntil(s.nextBilling) <= 7 && getDaysUntil(s.nextBilling) >= 0).length,
    [activeSubs]
  )

  const categories = useMemo(() => ['All', ...new Set(subscriptions.map(s => s.category))], [subscriptions])

  const filtered = useMemo(() => {
    return [...subscriptions]
      .filter(s => {
        if (filterCat !== 'All' && s.category !== filterCat) return false
        if (filterStatus !== 'All' && s.status !== filterStatus) return false
        if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'name')  return a.name.localeCompare(b.name)
        if (sortBy === 'price') return toMonthly(b.price, b.cycle) - toMonthly(a.price, a.cycle)
        return new Date(a.nextBilling || 0) - new Date(b.nextBilling || 0)
      })
  }, [subscriptions, filterCat, filterStatus, search, sortBy])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openAdd  = () => { setEditTarget(null); setApiError(''); setModalOpen(true) }
  const openEdit = (s) => { setEditTarget(s); setApiError(''); setModalOpen(true) }

  const handleSave = async (formData) => {
    setSaving(true); setApiError('')
    try {
      if (editTarget) {
        await updateSubscription(editTarget._id || editTarget.id, formData)
      } else {
        await addSubscription(formData)
      }
      setModalOpen(false); setEditTarget(null)
    } catch (err) {
      setApiError(err.message || 'Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteSubscription(deleteTarget._id || deleteTarget.id)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleToggle = async (s) => {
    try { await toggleSubscriptionStatus(s._id || s.id) }
    catch (err) { setApiError(err.message) }
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">Subscriptions</h1>
          <p className="text-white/40 text-xs mt-0.5">
            {subscriptions.length} total · {activeSubs.length} active
          </p>
        </div>
        <motion.button
          className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm font-semibold self-start sm:self-auto"
          onClick={openAdd}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        >
          <Plus size={15} /> Add Subscription
        </motion.button>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Monthly Cost',  value: fmt(Math.round(totalMonthly)),      icon: '💸', sub: `${fmt(Math.round(totalMonthly*12))}/yr`,    color: '#6366f1' },
          { label: 'Active Subs',   value: activeSubs.length,                  icon: '✅', sub: `${subscriptions.length-activeSubs.length} cancelled`, color: '#10b981' },
          { label: 'Due This Week', value: upcomingCount,                       icon: '📅', sub: upcomingCount===0?'All clear!':'Need attention',      color: '#f59e0b' },
          { label: 'Daily Average', value: fmt(Math.round(totalMonthly/30)),    icon: '📊', sub: 'per day on subs',                                   color: '#ec4899' },
        ].map(({ label, value, icon, sub, color }, i) => (
          <motion.div key={label}
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }} whileHover={{ y: -3 }}
          >
            <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full opacity-20 blur-xl"
              style={{ background: color }} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">{label}</p>
                <p className="font-display font-bold text-2xl text-white leading-none">{value}</p>
                <p className="text-xs text-white/30 mt-1.5">{sub}</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                style={{ background: `${color}22` }}>
                {icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Upcoming alert bar ───────────────────────────────────────────── */}
      {upcomingCount > 0 && (
        <motion.div
          className="rounded-2xl px-5 py-3 flex items-center gap-3"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-sm font-medium">
            You have <span className="font-bold">{upcomingCount}</span> subscription{upcomingCount > 1 ? 's' : ''} due within the next 7 days.
          </p>
        </motion.div>
      )}

      {/* ── API Error ────────────────────────────────────────────────────── */}
      {apiError && (
        <div className="rounded-xl px-4 py-3 text-sm text-rose-300 flex items-center gap-2"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          ⚠ {apiError}
          <button onClick={() => setApiError('')} className="ml-auto text-rose-400 hover:text-rose-200">✕</button>
        </div>
      )}

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <motion.div className="rounded-2xl p-4"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input className="input-field pl-9" placeholder="Search subscriptions…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {/* Sort */}
          <select className="input-field w-auto cursor-pointer" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="nextBilling" className="bg-gray-900">Sort: Due Date</option>
            <option value="name"        className="bg-gray-900">Sort: Name A–Z</option>
            <option value="price"       className="bg-gray-900">Sort: Price ↓</option>
          </select>
          {/* View mode */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            {[['table', <List size={14}/>], ['grid', <LayoutGrid size={14}/>]].map(([m, icon]) => (
              <button key={m} onClick={() => setViewMode(m)}
                className="px-3 py-2 flex items-center transition-colors"
                style={viewMode===m ? { background: 'rgba(99,102,241,0.3)', color: '#a5b4fc' } : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)' }}>
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className="px-3 py-1 rounded-xl text-xs font-semibold transition-all"
              style={filterCat===cat
                ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}>
              {cat}
            </button>
          ))}
          <div className="w-px h-5 bg-white/10 self-center mx-1" />
          {['All','active','cancelled'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all"
              style={filterStatus===s
                ? { background: s==='active' ? 'rgba(16,185,129,0.25)' : s==='cancelled' ? 'rgba(239,68,68,0.2)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: s==='active' ? '#34d399' : s==='cancelled' ? '#f87171' : 'white' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}>
              {s}
            </button>
          ))}
          <span className="ml-auto text-xs text-white/25 self-center">{filtered.length} results</span>
        </div>
      </motion.div>

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-white/40 font-semibold mb-1">No subscriptions found</p>
          <p className="text-white/25 text-sm mb-6">Try adjusting your filters or add a new one</p>
          <button className="btn-primary px-5 py-2.5 text-sm font-semibold mx-auto flex items-center gap-2" onClick={openAdd}>
            <Plus size={14}/> Add Subscription
          </button>
        </div>
      )}

      {/* ── Table view ───────────────────────────────────────────────────── */}
      {filtered.length > 0 && viewMode === 'table' && (
        <motion.div className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Subscription','Category','Price','Cycle','Next Billing','Status','Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-white/30 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((sub, i) => {
                    const monthly      = toMonthly(sub.price, sub.cycle)
                    const isCancelled  = sub.status === 'cancelled'
                    const rowBg        = i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent'
                    return (
                      <motion.tr key={sub._id || sub.id}
                        style={{ background: rowBg, borderBottom: '1px solid rgba(255,255,255,0.04)', opacity: isCancelled ? 0.55 : 1 }}
                        initial={{ opacity: 0 }} animate={{ opacity: isCancelled ? 0.55 : 1 }}
                        exit={{ opacity: 0, x: -20 }} layout
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = rowBg}
                        className="group transition-colors">

                        {/* Name */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{sub.emoji}</span>
                            <span className={`text-sm font-semibold ${isCancelled ? 'line-through text-white/30' : 'text-white'}`}>
                              {sub.name}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
                            style={{ background: `${CATEGORY_COLORS[sub.category] || '#6b7280'}22`, color: CATEGORY_COLORS[sub.category] || 'rgba(255,255,255,0.5)' }}>
                            {sub.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-white font-mono">{fmt(sub.price)}</p>
                          {sub.cycle !== 'monthly' && (
                            <p className="text-xs text-white/30">≈ {fmt(monthly)}/mo</p>
                          )}
                        </td>

                        {/* Cycle */}
                        <td className="px-5 py-4"><CyclePill cycle={sub.cycle} /></td>

                        {/* Next Billing */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-white/70">
                              {sub.nextBilling ? new Date(sub.nextBilling).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'}
                            </span>
                            <UrgencyBadge dateStr={sub.nextBilling} status={sub.status} />
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isCancelled ? 'text-white/30' : 'text-emerald-400'}`}
                            style={{ background: isCancelled ? 'rgba(255,255,255,0.05)' : 'rgba(16,185,129,0.12)', border: `1px solid ${isCancelled ? 'rgba(255,255,255,0.08)' : 'rgba(16,185,129,0.25)'}` }}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isCancelled ? 'bg-white/20' : 'bg-emerald-400'}`} />
                            {isCancelled ? 'Cancelled' : 'Active'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(sub)} title="Edit"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-blue-400 transition-colors"
                              style={{ background: 'rgba(255,255,255,0.05)' }}>
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => handleToggle(sub)} title={isCancelled ? 'Reactivate' : 'Cancel'}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-amber-400 transition-colors"
                              style={{ background: 'rgba(255,255,255,0.05)' }}>
                              {isCancelled ? <RotateCcw size={13} /> : <PauseCircle size={13} />}
                            </button>
                            <button onClick={() => setDeleteTarget(sub)} title="Delete"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-rose-400 transition-colors"
                              style={{ background: 'rgba(255,255,255,0.05)' }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── Grid view ────────────────────────────────────────────────────── */}
      {filtered.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((sub, i) => {
              const monthly     = toMonthly(sub.price, sub.cycle)
              const isCancelled = sub.status === 'cancelled'
              return (
                <motion.div key={sub._id || sub.id}
                  className="glass-card p-5 group"
                  style={{ opacity: isCancelled ? 0.6 : 1 }}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: isCancelled ? 0.6 : 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }} layout>

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl"
                        style={{ background: `${CATEGORY_COLORS[sub.category] || '#6b7280'}18` }}>
                        {sub.emoji}
                      </div>
                      <div>
                        <p className={`text-sm font-bold leading-tight ${isCancelled ? 'line-through text-white/30' : 'text-white'}`}>{sub.name}</p>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md mt-1 inline-block"
                          style={{ background: `${CATEGORY_COLORS[sub.category] || '#6b7280'}22`, color: CATEGORY_COLORS[sub.category] || 'rgba(255,255,255,0.4)' }}>
                          {sub.category}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${isCancelled ? 'text-white/25' : 'text-emerald-400'}`}
                      style={{ background: isCancelled ? 'rgba(255,255,255,0.04)' : 'rgba(16,185,129,0.12)' }}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isCancelled ? 'bg-white/20' : 'bg-emerald-400'}`} />
                      {isCancelled ? 'Cancelled' : 'Active'}
                    </span>
                  </div>

                  <div className="flex items-end justify-between mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <p className="text-2xl font-display font-bold text-white">{fmt(sub.price)}</p>
                      {sub.cycle !== 'monthly' && <p className="text-xs text-white/30 mt-0.5">≈ {fmt(monthly)}/mo</p>}
                    </div>
                    <CyclePill cycle={sub.cycle} />
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5 text-white/40">
                      <Calendar size={12} />
                      <span className="text-xs">
                        {sub.nextBilling ? new Date(sub.nextBilling).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : '—'}
                      </span>
                    </div>
                    <UrgencyBadge dateStr={sub.nextBilling} status={sub.status} />
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => openEdit(sub)} className="flex-1 py-2 rounded-xl text-xs font-semibold text-blue-400 transition-colors"
                      style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                      ✎ Edit
                    </button>
                    <button onClick={() => handleToggle(sub)} className="flex-1 py-2 rounded-xl text-xs font-semibold text-amber-400 transition-colors"
                      style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                      {isCancelled ? '▶ Resume' : '⏸ Cancel'}
                    </button>
                    <button onClick={() => setDeleteTarget(sub)} className="flex-1 py-2 rounded-xl text-xs font-semibold text-rose-400 transition-colors"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      🗑 Delete
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <SubModal
        open={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null) }}
        onSave={handleSave} editTarget={editTarget} saving={saving}
      />

      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirm
            name={deleteTarget.name}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
