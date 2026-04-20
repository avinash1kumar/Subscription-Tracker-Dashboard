// src/pages/Notifications.jsx
import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, BellOff, Check, CheckCheck,
  Trash2, AlertTriangle, TrendingUp,
  TrendingDown, CreditCard, Info, X,
  Filter, RefreshCw,
} from 'lucide-react'
import { useApp } from '../content/AppContext'
import { getDaysUntil, fmt } from '../utils/helpers'

// ── Generate smart notifications from real app data 
function buildNotifications(income, expenses, subscriptions) {
  const items = []
  const now   = new Date()

  // Upcoming subscription bills
  subscriptions
    .filter(s => s.status === 'active' && s.nextBilling)
    .forEach(s => {
      const days = getDaysUntil(s.nextBilling)
      if (days !== null && days >= 0 && days <= 7) {
        items.push({
          id:       `sub-bill-${s._id || s.id}`,
          type:     'billing',
          icon:     s.emoji || '💳',
          title:    `${s.name} bill due ${days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`}`,
          message:  `₹${(s.price || 0).toLocaleString('en-IN')} will be charged on ${new Date(s.nextBilling).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
          time:     'Upcoming',
          urgency:  days <= 2 ? 'critical' : 'warning',
          read:     false,
          category: 'billing',
        })
      }
    })

  // Overdue bills
  subscriptions
    .filter(s => s.status === 'active' && s.nextBilling)
    .forEach(s => {
      const days = getDaysUntil(s.nextBilling)
      if (days !== null && days < 0) {
        items.push({
          id:       `sub-overdue-${s._id || s.id}`,
          type:     'alert',
          icon:     '⚠️',
          title:    `${s.name} payment overdue`,
          message:  `Bill was due ${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''} ago. Update the next billing date.`,
          time:     `${Math.abs(days)}d overdue`,
          urgency:  'critical',
          read:     false,
          category: 'billing',
        })
      }
    })

  // High expenses alert
  const totalMonthlyExp = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalMonthlyInc = income.reduce((sum, i) => sum + i.amount, 0)
  if (totalMonthlyInc > 0 && (totalMonthlyExp / totalMonthlyInc) > 0.7) {
    items.push({
      id:       'high-expense-ratio',
      type:     'alert',
      icon:     '📉',
      title:    'High expense ratio detected',
      message:  `Your expenses are ${Math.round((totalMonthlyExp / totalMonthlyInc) * 100)}% of your income. Consider reviewing your spending.`,
      time:     'Analysis',
      urgency:  'warning',
      read:     false,
      category: 'insights',
    })
  }

  // Cancelled subscriptions reminder
  const cancelledSubs = subscriptions.filter(s => s.status === 'cancelled')
  if (cancelledSubs.length > 0) {
    items.push({
      id:       'cancelled-subs',
      type:     'info',
      icon:     '⏸️',
      title:    `${cancelledSubs.length} cancelled subscription${cancelledSubs.length > 1 ? 's' : ''}`,
      message:  `You have ${cancelledSubs.length} cancelled subscription${cancelledSubs.length > 1 ? 's' : ''}: ${cancelledSubs.slice(0, 2).map(s => s.name).join(', ')}${cancelledSubs.length > 2 ? '...' : ''}. You can delete or reactivate them.`,
      time:     'Info',
      urgency:  'info',
      read:     false,
      category: 'subscriptions',
    })
  }

  // Income milestone
  if (totalMonthlyInc >= 100000) {
    items.push({
      id:       'income-milestone',
      type:     'success',
      icon:     '🎉',
      title:    'Income milestone reached!',
      message:  `Your total income of ₹${Math.round(totalMonthlyInc / 1000)}K is looking great. Keep tracking to stay on top.`,
      time:     'Milestone',
      urgency:  'success',
      read:     false,
      category: 'insights',
    })
  }

  // Subscription count info
  const activeSubs = subscriptions.filter(s => s.status === 'active')
  if (activeSubs.length >= 5) {
    const monthlySubCost = activeSubs.reduce((sum, s) => {
      const map = { monthly: 1, yearly: 1/12, quarterly: 1/3, weekly: 52/12 }
      return sum + Math.round(s.price * (map[s.cycle] || 1))
    }, 0)
    items.push({
      id:       'sub-cost-info',
      type:     'info',
      icon:     '📊',
      title:    `${activeSubs.length} active subscriptions`,
      message:  `You're spending approximately ₹${Math.round(monthlySubCost).toLocaleString('en-IN')}/month on subscriptions. That's ₹${Math.round(monthlySubCost * 12).toLocaleString('en-IN')}/year.`,
      time:     'Summary',
      urgency:  'info',
      read:     false,
      category: 'subscriptions',
    })
  }

  // Welcome / empty state
  if (items.length === 0) {
    items.push({
      id:       'welcome',
      type:     'info',
      icon:     '👋',
      title:    'Welcome to SubFlow!',
      message:  'Start by adding your income sources, expenses and subscriptions. Notifications about your finances will appear here.',
      time:     'Now',
      urgency:  'info',
      read:     false,
      category: 'system',
    })
  }

  return items
}

// ── Config maps ───────────────────────────────────────────────────────────────
const URGENCY_CONFIG = {
  critical: { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   dot: '#ef4444', label: 'Urgent',  labelColor: 'text-rose-400'   },
  warning:  { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.22)', dot: '#f59e0b', label: 'Warning', labelColor: 'text-amber-400'  },
  success:  { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)',  dot: '#10b981', label: 'Great',   labelColor: 'text-emerald-400' },
  info:     { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)',  dot: '#6366f1', label: 'Info',    labelColor: 'text-indigo-400'  },
}

const CATEGORY_TABS = ['all', 'billing', 'insights', 'subscriptions', 'system']

// ── Notification card ─────────────────────────────────────────────────────────
function NotificationCard({ notif, onMarkRead, onDelete }) {
  const cfg = URGENCY_CONFIG[notif.urgency] || URGENCY_CONFIG.info
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: notif.read ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
      className="relative rounded-2xl p-4 flex gap-4 group"
      style={{
        background:  notif.read ? 'rgba(255,255,255,0.02)' : cfg.bg,
        border:      `1px solid ${notif.read ? 'rgba(255,255,255,0.06)' : cfg.border}`,
        transition:  'all 0.2s',
      }}
    >
      {/* Unread dot */}
      {!notif.read && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full"
          style={{ background: cfg.dot }} />
      )}

      {/* Icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: `${cfg.dot}18` }}>
        {notif.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className={`text-sm font-semibold ${notif.read ? 'text-white/40' : 'text-white'}`}>
            {notif.title}
          </p>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.labelColor}`}
            style={{ background: `${cfg.dot}18` }}>
            {cfg.label}
          </span>
        </div>
        <p className={`text-xs leading-relaxed ${notif.read ? 'text-white/25' : 'text-white/55'}`}>
          {notif.message}
        </p>
        <p className="text-[10px] text-white/25 mt-1.5 font-medium">{notif.time}</p>
      </div>

      {/* Actions — show on hover */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notif.read && (
          <button onClick={() => onMarkRead(notif.id)}
            title="Mark as read"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-emerald-400 transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <Check size={12} />
          </button>
        )}
        <button onClick={() => onDelete(notif.id)}
          title="Dismiss"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-rose-400 transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <X size={12} />
        </button>
      </div>
    </motion.div>
  )
}

// ── Main Notifications page ───────────────────────────────────────────────────
export default function Notifications() {
  const { income, expenses, subscriptions, notifsRead: readIds, setNotifsRead: setReadIds, notifsDeleted: deleted, setNotifsDeleted: setDeleted } = useApp()

  // Build notifications from real data
  const baseNotifs = useMemo(
    () => buildNotifications(income, expenses, subscriptions),
    [income, expenses, subscriptions]
  )

  const [filter,   setFilter]   = useState('all')   // urgency filter
  const [catTab,   setCatTab]   = useState('all')   // category tab
  const [showRead, setShowRead] = useState(true)

  // Merge read/deleted state into notifications
  const notifications = useMemo(() =>
    baseNotifs
      .filter(n => !deleted.has(n.id))
      .map(n => ({ ...n, read: readIds.has(n.id) }))
  , [baseNotifs, readIds, deleted])

  // Filtered view
  const visible = useMemo(() => {
    return notifications.filter(n => {
      if (!showRead && n.read) return false
      if (catTab !== 'all' && n.category !== catTab) return false
      if (filter !== 'all' && n.urgency !== filter) return false
      return true
    })
  }, [notifications, showRead, catTab, filter])

  const unreadCount = notifications.filter(n => !n.read).length

  const markRead    = (id) => setReadIds(prev => new Set([...prev, id]))
  const markAllRead = ()   => setReadIds(new Set(notifications.map(n => n.id)))
  const dismiss     = (id) => setDeleted(prev => new Set([...prev, id]))
  const clearAll    = ()   => setDeleted(new Set(notifications.map(n => n.id)))
  const refresh     = ()   => { setReadIds(new Set()); setDeleted(new Set()) }

  return (
    <div className="space-y-6 max-w-3xl pt-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {/* <h1 className="font-display font-bold text-white text-2xl">Notifications</h1> */}
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold mb-1">
              <span className="text-white/30">Home</span>
              <span className="text-white/20">/</span>
              <span className="text-violet-400">Notifications</span>
            </div>
            {unreadCount > 0 && (
              <motion.span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #7928CA, #FF0080)' }}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
              >
                {unreadCount}
              </motion.span>
            )}
          </div>
          <p className="text-slate-400/80 text-xs font-medium tracking-wide mt-1">
            Smart alerts based on your financial data
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/50 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <RefreshCw size={12} /> Refresh
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 transition-colors hover:opacity-80"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <CheckCheck size={12} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:opacity-80 transition-opacity"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <Trash2 size={12} /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Summary stat strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',    value: notifications.length,                             color: '#6366f1', icon: <Bell size={14}/> },
          { label: 'Unread',  value: unreadCount,                                       color: '#7928CA', icon: <Bell size={14}/> },
          { label: 'Urgent',  value: notifications.filter(n=>n.urgency==='critical').length, color: '#ef4444', icon: <AlertTriangle size={14}/> },
          { label: 'Warnings',value: notifications.filter(n=>n.urgency==='warning').length,  color: '#f59e0b', icon: <Info size={14}/> },
        ].map(({ label, value, color, icon }) => (
          <motion.div key={label}
            className="rounded-2xl p-3 flex items-center gap-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            whileHover={{ y: -2 }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}20`, color }}>
              {icon}
            </div>
            <div>
              <p className="font-display font-bold text-lg text-white leading-none">{value}</p>
              <p className="text-white/40 text-xs">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Category tabs ──────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORY_TABS.map(tab => (
          <button key={tab} onClick={() => setCatTab(tab)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all"
            style={catTab === tab
              ? { background: 'linear-gradient(135deg, #7928CA, #FF0080)', color: 'white' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}>
            {tab}
          </button>
        ))}

        <div className="w-px h-5 bg-white/10 self-center mx-1" />

        {/* Urgency filter */}
        {['all','critical','warning','success','info'].map(u => {
          const cfg = URGENCY_CONFIG[u]
          return (
            <button key={u} onClick={() => setFilter(u)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all"
              style={filter === u && u !== 'all'
                ? { background: `${cfg.dot}25`, border: `1px solid ${cfg.dot}50`, color: cfg.dot }
                : filter === u && u === 'all'
                ? { background: 'linear-gradient(135deg, #7928CA, #FF0080)', color: 'white' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
              {u}
            </button>
          )
        })}

        {/* Show read toggle */}
        <button onClick={() => setShowRead(p => !p)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
          {showRead ? <><BellOff size={11}/> Hide read</> : <><Bell size={11}/> Show read</>}
        </button>
      </div>

      {/* ── Notification list ──────────────────────────────────────────── */}
      {visible.length === 0 ? (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          <div className="text-5xl mb-4">🔔</div>
          <p className="text-white/40 font-semibold mb-1">
            {notifications.length === 0 ? 'No notifications' : 'No notifications match your filter'}
          </p>
          <p className="text-white/25 text-sm">
            {notifications.length === 0
              ? 'Add income, expenses or subscriptions to get smart alerts'
              : 'Try changing the category or urgency filter'}
          </p>
          {notifications.length > 0 && (
            <button onClick={() => { setCatTab('all'); setFilter('all'); setShowRead(true) }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white/50 hover:text-white transition-colors mx-auto flex items-center gap-1.5"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Filter size={12}/> Clear filters
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {visible.map(notif => (
              <NotificationCard
                key={notif.id}
                notif={notif}
                onMarkRead={markRead}
                onDelete={dismiss}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Footer info ────────────────────────────────────────────────── */}
      {visible.length > 0 && (
        <p className="text-center text-white/20 text-xs pb-2">
          Showing {visible.length} notification{visible.length !== 1 ? 's' : ''} · Auto-generated from your financial data
        </p>
      )}
    </div>
  )
}
