import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Trash2, AlertTriangle, Clock, Shield, TrendingDown } from 'lucide-react'
import { useApp } from "../content/AppContext";
import { fmt, fmtShort, getDaysUntil, CATEGORY_COLORS } from '../utils/helpers'
import clsx from 'clsx'

export default function Expenses() {
  const { expenses, deleteExpense, totalExpenses } = useApp()
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  const categories = [...new Set(expenses.map(e => e.category))]
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const currentMonthName = now.toLocaleString('default', { month: 'long' })

  const totalPotential = expenses.reduce((s, e) => s + e.amount, 0) || 1
  const monthlyExpenses = expenses.filter(e => {
    if (e.status !== 'Paid') return false
    const d = new Date(e.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }).reduce((s, e) => s + e.amount, 0)

  const yearlyExpenses = expenses.filter(e => {
    if (e.status !== 'Paid') return false
    const d = new Date(e.date)
    return d.getFullYear() === currentYear
  }).reduce((s, e) => s + e.amount, 0)

  const plannedTotal = expenses.filter(e => e.status === 'Planned').reduce((s, e) => s + e.amount, 0)

  let filtered = filter === 'all' ? expenses : expenses.filter(e => e.category === filter)
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'amount') return b.amount - a.amount
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    return new Date(b.date) - new Date(a.date)
  })


  const radarData = categories.map(cat => {
    const amt = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0)
    return {
      category: cat,
      amount: amt,
      percent: (amt / totalPotential) * 100
    }
  })

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Spent (All Time)', value: fmtShort(totalExpenses), icon: TrendingDown, bg: 'rgba(239,68,68,0.2)', border: 'rgba(239,68,68,0.3)', color: '#f87171' },
          { label: 'Spent this Month', value: fmtShort(monthlyExpenses), icon: Clock, bg: 'rgba(99,102,241,0.2)', border: 'rgba(99,102,241,0.3)', color: '#a5b4fc' },
          { label: `Spent in ${currentYear}`, value: fmtShort(yearlyExpenses), icon: Shield, bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.25)', color: '#67e8f9' },
          { label: 'Due Soon (Planned)', value: fmtShort(plannedTotal), icon: AlertTriangle, bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.25)', color: '#fcd34d' },
        ].map(({ label, value, icon: Icon, bg, border, color }, i) => (
          <motion.div key={label}
            className="rounded-2xl p-4"
            style={{ background: bg, border: `1px solid ${border}` }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            whileHover={{ y: -3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/55 text-xs font-semibold uppercase tracking-wider">{label}</span>
              <Icon size={14} style={{ color }} />
            </div>
            <div className="font-display font-bold text-xl text-white">{value}</div>
          </motion.div>
        ))}
      </div>

      {/* Radar + List */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Radar */}
        <motion.div className="xl:col-span-2 glass-card p-6"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
          <h3 className="font-display font-bold text-white text-base mb-1">Spending Radar</h3>
          <p className="text-white/40 text-xs mb-5">Category distribution</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="category" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
              <Tooltip
                formatter={(v) => [fmt(v), 'Amount']}
                contentStyle={{ background: 'rgba(20,16,60,0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, fontSize: 12 }}
              />
              <Radar name="Expenses" dataKey="percent" stroke="#a855f7" fill="#a855f7" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>

          {/* Category legend */}
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {categories.map(cat => {
              const amt = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0)
              const pct = totalPotential > 0 ? Math.round((amt / totalPotential) * 100) : 0
              return (
                <div key={cat} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[cat] || '#6b7280' }} />
                  <span className="text-white/50 text-xs truncate">{cat}</span>
                  <span className="text-white/30 text-xs ml-auto">{pct}%</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Expense list */}
        <motion.div className="xl:col-span-3 glass-card p-6"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
            <div>
              <h3 className="font-display font-bold text-white text-base">All Expenses</h3>
              <p className="text-white/40 text-xs">{expenses.length} subscriptions</p>
            </div>
            <select
              className="text-xs rounded-xl px-3 py-1.5 outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontFamily: 'DM Sans' }}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="date">Sort: Date</option>
              <option value="amount">Sort: Amount</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap mb-4">
            {['all', ...categories].map(cat => (
              <button key={cat}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize"
                style={filter === cat
                  ? { background: 'linear-gradient(135deg, #7928CA, #FF0080)', color: 'white' }
                  : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            <AnimatePresence>
              {filtered.length === 0 ? (
                <div className="text-center py-10 text-white/30 text-sm">No expense entries</div>
              ) : filtered.map((item, i) => {
                const isPlanned = item.status === 'Planned'
                const days = isPlanned ? getDaysUntil(item.date) : null
                const urgency = days !== null ? (days <= 3 ? 'urgent' : days <= 7 ? 'soon' : 'ok') : null

                const amountColor = isPlanned ? 'text-yellow-400' : 'text-gray-200'

                return (
                  <motion.div key={item.id}
                    className="flex items-center gap-3 p-3 rounded-2xl table-row-hover group"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.04 }}
                    layout
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: `${CATEGORY_COLORS[item.category]}22` || 'rgba(255,255,255,0.08)' }}>
                      {item.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{item.name}</div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: `${CATEGORY_COLORS[item.category]}22`, color: CATEGORY_COLORS[item.category] || 'rgba(255,255,255,0.5)' }}>
                          {item.category}
                        </span>
                        {isPlanned ? (
                          <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full',
                            urgency === 'urgent' ? 'bg-amber-400/20 text-amber-400' : 'bg-orange-400/20 text-orange-400'
                          )}>
                            {days <= 0 ? 'Due today!' : `${days}d left (Planned)`}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Paid</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`font-bold font-mono text-sm ${amountColor}`}>-{fmt(item.amount)}</div>
                      <span className="text-[10px] text-white/30 capitalize">{isPlanned ? 'Planned' : new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}
                      onClick={() => deleteExpense(item.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
