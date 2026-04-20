import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus } from 'lucide-react'
import { useApp } from '../content/AppContext'
import {
  EMOJI_LIST, CATEGORIES_EXPENSE, CATEGORIES_INCOME, CYCLES
} from '../utils/helpers'

export default function AddModal({ open, onClose }) {
  const { addIncome, addExpense, activePage } = useApp()
  const isExpense = activePage === 'expenses' || activePage === 'dashboard'
  const [type, setType] = useState('expense')
  const [form, setForm] = useState({
    name: '', amount: '', category: '', date: new Date().toISOString().split('T')[0],
    cycle: 'one-time', emoji: '💳', nextBilling: '', status: 'Paid',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (type === 'income' && form.category) {
      const iconMap = { Salary: '💼', Freelance: '💻', Passive: '📈', Investment: '💰', Business: '🏢', Other: '💵' }
      if (iconMap[form.category]) set('emoji', iconMap[form.category])
    }
  }, [form.category, type])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Valid amount required'
    if (!form.category) e.category = 'Category required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    setApiError('')
    try {
      const entry = {
        name: form.name.trim(),
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
        cycle: form.cycle || 'one-time',
        emoji: form.emoji,
        ...(type === 'expense' && { status: form.status }),
      }
      if (type === 'income') {
        await addIncome(entry)
      } else {
        await addExpense(entry)
      }
      setForm({ name: '', amount: '', category: '', date: new Date().toISOString().split('T')[0], cycle: 'one-time', emoji: '💳', nextBilling: '', status: 'Paid' })
      setErrors({})
      onClose()
    } catch (err) {
      setApiError(err.message || 'Failed to save. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const cats = type === 'income' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="modal-content relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-6 md:p-8"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Absolute Close Button */}
            <button onClick={onClose} className="absolute top-4 right-4 z-50 w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:bg-white/10 transition-colors">
              <X size={15} />
            </button>

            {/* Header */}
            <div className="mb-6 pr-8">
              <h2 className="font-display font-bold text-white text-xl">Add Entry</h2>
              <p className="text-white/40 text-xs mt-0.5">Track a new transaction</p>
            </div>

            {/* Type toggle */}
            <div className="flex gap-2 mb-6 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {['income', 'expense'].map(t => (
                <button
                  key={t}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${type === t
                    ? t === 'income'
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                    : 'text-white/40 hover:text-white/60'
                    }`}
                  style={type === t ? {
                    background: t === 'income' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    border: `1px solid ${t === 'income' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  } : {}}
                  onClick={() => { setType(t); set('category', '') }}
                >
                  {t === 'income' ? '📈 Income' : '📉 Expense'}
                </button>
              ))}
            </div>

            {/* Emoji picker */}
            <div className="mb-4">
              <label className="text-xs text-white/50 font-semibold uppercase tracking-wider block mb-2">Icon</label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_LIST.map(e => (
                  <button
                    key={e}
                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${form.emoji === e
                      ? 'scale-110'
                      : 'opacity-60 hover:opacity-100'}`}
                    style={form.emoji === e
                      ? { background: 'rgba(139,92,246,0.3)', border: '2px solid rgba(139,92,246,0.6)' }
                      : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onClick={() => set('emoji', e)}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="mb-4">
              <label className="text-xs text-white/50 font-semibold uppercase tracking-wider block mb-2">Name *</label>
              <input
                className="input-field"
                placeholder={type === 'income' ? 'e.g. Monthly Salary' : 'e.g. Netflix Premium'}
                value={form.name}
                onChange={e => set('name', e.target.value)}
                style={errors.name ? { borderColor: 'rgba(239,68,68,0.6)' } : {}}
              />
              {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Amount + Category */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-white/50 font-semibold uppercase tracking-wider block mb-2">Amount (₹) *</label>
                <input
                  className="input-field"
                  type="number"
                  placeholder="0"
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                  style={errors.amount ? { borderColor: 'rgba(239,68,68,0.6)' } : {}}
                />
                {errors.amount && <p className="text-rose-400 text-xs mt-1">{errors.amount}</p>}
              </div>
              <div>
                <label className="text-xs text-white/50 font-semibold uppercase tracking-wider block mb-2">Category *</label>
                <div className="relative">
                  <select
                    className="select-field"
                    value={form.category}
                    onChange={e => set('category', e.target.value)}
                    style={errors.category ? { borderColor: 'rgba(239,68,68,0.6)' } : {}}
                  >
                    <option value="">Select...</option>
                    {cats.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {errors.category && <p className="text-rose-400 text-xs mt-1">{errors.category}</p>}
              </div>
            </div>

            {/* Config: Status, Cycle, Date */}
            <div className={`grid gap-3 mb-6 ${type === 'expense' ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {type === 'expense' && (
                <div>
                  <label className="text-xs text-white/50 font-semibold uppercase tracking-wider block mb-2">Status</label>
                  <div className="relative">
                    <select className="select-field" value={form.status} onChange={e => set('status', e.target.value)}>
                      <option value="Paid">Paid</option>
                      <option value="Planned">Planned</option>
                    </select>
                  </div>
                </div>
              )}
              <div>
                {type === 'expense' ? (
                  <>
                    <label className="text-xs text-white/50 font-semibold uppercase tracking-wider block mb-2">Frequency</label>
                    <div className="relative">
                      <select
                        className="select-field"
                        value={form.cycle}
                        onChange={e => set('cycle', e.target.value)}
                      >
                        <option value="one-time">None / One-time</option>
                        {CYCLES.filter(c => c !== 'one-time').map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                      </select>
                    </div>
                  </>
                ) : (
           
                  <div className="pt-5">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 transition-all cursor-pointer"
                        checked={form.cycle !== 'one-time'}
                        onChange={e => set('cycle', e.target.checked ? 'monthly' : 'one-time')}
                      />
                      <span className="text-sm text-white/70 font-semibold">Recurring Income</span>
                    </label>
                    <p className="text-[10px] text-white/40 mt-1.5 ml-8">Check this only if you receive this money every month.</p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-white/50 font-semibold uppercase tracking-wider block mb-2">
                  {type === 'income' ? 'Date Received' : (form.status === 'Planned' && type === 'expense' ? 'Target Date' : 'Date')}
                </label>
                <input
                  className="input-field"
                  type="date"
                  value={form.date}
                  onChange={e => set('date', e.target.value)}
                />
                {new Date(form.date) > new Date() && (
                  <p className="text-[10px] text-white/40 mt-1.5 ml-1">This will be added to your future balance.</p>
                )}
              </div>
            </div>

            {/* API Error */}
            {apiError && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm text-rose-300"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                ⚠ {apiError}
              </div>
            )}

             {/* Submit */}
            <motion.button
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold"
              onClick={handleSubmit}
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.01 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              style={{ opacity: submitting ? 0.8 : 1 }}
            >
              <span>{submitting ? 'Saving...' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}</span>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
