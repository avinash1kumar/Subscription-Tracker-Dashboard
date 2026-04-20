import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts'
import { Trash2, TrendingUp, DollarSign, Repeat, Star } from 'lucide-react'
import { useApp } from '../content/AppContext'
import { fmt, fmtShort, CATEGORY_COLORS, formatDate } from '../utils/helpers'
import clsx from 'clsx'

const CYCLE_COLORS = { monthly: '#a5b4fc', yearly: '#67e8f9', weekly: '#86efac', quarterly: '#fcd34d', 'one-time': '#f9a8d4' }

export default function Income() {
  const { income, deleteIncome, totalIncome } = useApp()
  const [filter, setFilter] = useState('all')

  const categories = [...new Set(income.map(i => i.category))]
  const filtered = filter === 'all' ? income : income.filter(i => i.category === filter)

  const catData = categories.map(cat => ({
    name: cat,
    amount: income.filter(i => i.category === cat).reduce((s, i) => s + i.amount, 0),
  })).sort((a, b) => b.amount - a.amount)

  const isTodayDate = (dateStr) => {
    const d = new Date(dateStr)
    const today = new Date()
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  }

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const currentMonthIncome = income.filter(i => {
    const d = new Date(i.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }).reduce((s, i) => s + i.amount, 0)

  const monthlyRecurring = income.filter(i => i.cycle !== 'one-time').reduce((s, i) => s + i.amount, 0)
  const passiveIncome = income.filter(i => ['Passive', 'Investment'].includes(i.category)).reduce((s, i) => s + i.amount, 0)

  return (
    <div className="space-y-6">
      {/* Top stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Income (This Month)', value: fmtShort(currentMonthIncome), icon: TrendingUp, color: 'from-emerald-500/40 to-teal-500/30', iconColor: 'text-emerald-300' },
          { label: 'Monthly Recurring', value: fmtShort(monthlyRecurring), icon: Repeat, color: 'from-violet-500/40 to-purple-500/30', iconColor: 'text-violet-300' },
          { label: 'Passive Income', value: fmtShort(passiveIncome), icon: Star, color: 'from-amber-500/40 to-orange-500/30', iconColor: 'text-amber-300' },
        ].map(({ label, value, icon: Icon, color, iconColor }, i) => (
          <motion.div key={label}
            className={`glass-card p-5 bg-gradient-to-br ${color}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            whileHover={{ y: -3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">{label}</span>
              <Icon size={16} className={iconColor} />
            </div>
            <div className="font-display font-bold text-2xl text-white">{value}</div>
          </motion.div>
        ))}
      </div>

      {/* Chart + list */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Bar chart */}
        <motion.div className="xl:col-span-2 glass-card p-6"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-display font-bold text-white text-base mb-1">By Category</h3>
          <p className="text-white/40 text-xs mb-5">Income source breakdown</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255, 255, 255, 0.64)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmtShort(v)} tick={{ fill: 'rgba(255, 255, 255, 0.72)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [fmt(v), 'Amount']}
                contentStyle={{ background: 'rgba(128, 125, 164, 0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, fontSize: 12 }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                <LabelList dataKey="amount" position="top" fill="rgba(255,255,255,0.7)" fontSize={10} formatter={(v) => fmtShort(v)} />
                {catData.map((entry, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#1e422b42'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Income list */}
        <motion.div className="xl:col-span-3 glass-card p-6"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-white text-base">All Income</h3>
              <p className="text-white/40 text-xs">{income.length} entries</p>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 flex-wrap mb-4">
            {['all', ...categories].map(cat => (
              <button key={cat}
                className={clsx('px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize', filter === cat
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/70')}
                style={filter === cat ? { background: 'linear-gradient(135deg, #7928CA, #FF0080)' } : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            <AnimatePresence>
              {filtered.length === 0 ? (
                <div className="text-center py-10 text-white/30 text-sm">No income entries yet</div>
              ) : filtered.map((item, i) => (
                <motion.div key={item.id}
                  className="flex items-center gap-3 p-3 rounded-2xl table-row-hover group"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04 }}
                  layout
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: 'rgba(16,185,129,0.15)' }}>
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{item.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-white/40 text-xs">{isTodayDate(item.date) ? 'Today' : formatDate(item.date)}</span>
                      <span className="w-px h-3 bg-white/10" />
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(16,185,129,0.15)', color: '#38ef7d' }}>
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end justify-center flex-shrink-0 gap-1.5">
                    <div className="text-emerald-400 font-bold font-mono text-sm leading-none">+{fmt(item.amount)}</div>
                    {item.cycle === 'one-time' ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-500/20 text-slate-300 uppercase tracking-wider leading-none">
                        One-time
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 uppercase tracking-wider leading-none">
                        Monthly
                      </span>
                    )}
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}
                    onClick={() => deleteIncome(item.id)}
                  >
                    <Trash2 size={12} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
