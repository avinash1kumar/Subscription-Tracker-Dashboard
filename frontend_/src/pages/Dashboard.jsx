import React from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid
} from 'recharts'
import {
  TrendingUp, TrendingDown, Wallet, Zap,
  ArrowUpRight, ArrowDownRight, Calendar
} from 'lucide-react'
import { useApp } from '../content/AppContext'
import StatCard from '../components/StatCard'
import { fmt, fmtShort, getDaysUntil, CATEGORY_COLORS } from '../utils/helpers'
import clsx from 'clsx'

const MONTHLY_DATA = [
  { month: 'Oct', income: 180000, expense: 42000 },
  { month: 'Nov', income: 195000, expense: 38000 },
  { month: 'Dec', income: 210000, expense: 55000 },
  { month: 'Jan', income: 200000, expense: 48000 },
  { month: 'Feb', income: 185000, expense: 41000 },
  { month: 'Mar', income: 220000, expense: 46000 },
  { month: 'Apr', income: 225800, expense: 15527 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl px-4 py-3 text-sm"
      style={{ background: 'rgba(20,16,60,0.95)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)' }}>
      <p className="text-white/60 text-xs mb-2 font-semibold">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/70 capitalize">{p.name}:</span>
          <span className="text-white font-bold font-mono">{fmtShort(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { income, expenses, totalIncome, totalExpenses, balance, savingsRate } = useApp()

  const upcoming = expenses
    .filter(e => e.nextBilling)
    .map(e => ({ ...e, days: getDaysUntil(e.nextBilling) }))
    .sort((a, b) => a.days - b.days)
    .slice(0, 4)

  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})
  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }))

  const recentAll = [
    ...income.map(i => ({ ...i, type: 'income' })),
    ...expenses.map(e => ({ ...e, type: 'expense' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          value={fmtShort(totalIncome)}
          sub={`${income.length} sources`}
          icon={TrendingUp}
          gradient="linear-gradient(135deg, rgba(17,153,142,0.5) 0%, rgba(56,239,125,0.3) 100%)"
          trend="up"
          trendValue="+12.4%"
          delay={0}
        />
        <StatCard
          title="Total Expenses"
          value={fmtShort(totalExpenses)}
          sub={`${expenses.length} subscriptions`}
          icon={TrendingDown}
          gradient="linear-gradient(135deg, rgba(247,151,30,0.4) 0%, rgba(255,107,107,0.35) 100%)"
          trend="down"
          trendValue="-3.2%"
          delay={0.08}
        />
        <StatCard
          title="Net Balance"
          value={fmtShort(Math.abs(balance))}
          sub={balance >= 0 ? "You're in profit 🎉" : "Overspending ⚠️"}
          icon={Wallet}
          gradient="linear-gradient(135deg, rgba(121,40,202,0.5) 0%, rgba(255,0,128,0.35) 100%)"
          trend="up"
          trendValue="+8.1%"
          delay={0.16}
        />
        <StatCard
          title="Savings Rate"
          value={`${savingsRate}%`}
          sub="of income saved"
          icon={Zap}
          gradient="linear-gradient(135deg, rgba(99,102,241,0.5) 0%, rgba(6,182,212,0.35) 100%)"
          trend="up"
          trendValue="+2.3%"
          delay={0.24}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Area chart */}
        <motion.div
          className="xl:col-span-2 glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-white text-base">Cash Flow</h3>
              <p className="text-white/40 text-xs mt-0.5">Income vs Expenses — last 7 months</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(135deg, #11998e, #38ef7d)' }} />
                Income
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(135deg, #f7971e, #ff6b6b)' }} />
                Expense
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY_DATA} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38ef7d" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38ef7d" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmtShort(v)} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} width={55} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" stroke="#38ef7d" strokeWidth={2} fill="url(#gIncome)" />
              <Area type="monotone" dataKey="expense" stroke="#ff6b6b" strokeWidth={2} fill="url(#gExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie chart */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="mb-4">
            <h3 className="font-display font-bold text-white text-base">Expense Breakdown</h3>
            <p className="text-white/40 text-xs mt-0.5">By category</p>
          </div>
          <div className="flex justify-center mb-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                  dataKey="value" paddingAngle={3} startAngle={90} endAngle={-270}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [fmt(v), '']} contentStyle={{
                  background: 'rgba(20,16,60,0.95)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12, fontSize: 12, fontFamily: 'DM Sans'
                }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 overflow-y-auto max-h-36">
            {pieData.map(({ name, value }) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: CATEGORY_COLORS[name] || '#6b7280' }} />
                  <span className="text-white/60 text-xs">{name}</span>
                </div>
                <span className="text-white text-xs font-mono font-semibold">{fmt(value)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent transactions */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-white text-base">Recent Transactions</h3>
              <p className="text-white/40 text-xs">Latest activity</p>
            </div>
          </div>
          <div className="space-y-2">
            {recentAll.map((t, i) => (
              <motion.div key={t.id}
                className="flex items-center gap-3 p-3 rounded-2xl table-row-hover"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.05 }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: t.type === 'income' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)' }}>
                  {t.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{t.name}</div>
                  <div className="text-xs text-white/40">{t.category} · {t.date}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={clsx('text-sm font-bold font-mono', t.type === 'income' ? 'text-emerald-400' : 'text-rose-400')}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                  </div>
                  <div className="text-[10px] text-white/30 capitalize">{t.cycle}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming bills */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Calendar size={16} className="text-purple-400" />
            <div>
              <h3 className="font-display font-bold text-white text-base">Upcoming Bills</h3>
              <p className="text-white/40 text-xs">Next billing dates</p>
            </div>
          </div>
          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <div className="text-center py-8 text-white/30 text-sm">No upcoming bills tracked</div>
            ) : upcoming.map((e, i) => {
              const cls = e.days <= 3 ? 'text-rose-400' : e.days <= 7 ? 'text-amber-400' : 'text-emerald-400'
              const bg = e.days <= 3 ? 'rgba(239,68,68,0.15)' : e.days <= 7 ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.1)'
              return (
                <motion.div key={e.id}
                  className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: bg, border: `1px solid ${e.days <= 3 ? 'rgba(239,68,68,0.2)' : e.days <= 7 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.15)'}` }}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                >
                  <div className="text-xl">{e.emoji}</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{e.name}</div>
                    <div className="text-xs text-white/40">{e.nextBilling}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-white">{fmt(e.amount)}</div>
                    <div className={`text-xs font-semibold ${cls}`}>
                      {e.days <= 0 ? 'Due today!' : e.days === 1 ? 'Tomorrow' : `${e.days} days`}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
