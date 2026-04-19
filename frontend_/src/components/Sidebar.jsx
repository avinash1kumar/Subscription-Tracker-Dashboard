import React from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, TrendingUp, TrendingDown, CreditCard,
  Zap, Settings, Bell, LogOut, ChevronRight,
} from 'lucide-react'
import { useApp } from '../content/AppContext'
import { fmtShort } from '../utils/helpers'
import clsx from 'clsx'

const NAV_MAIN = [
  { id: 'dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'income',        label: 'Income',         icon: TrendingUp      },
  { id: 'expenses',      label: 'Expenses',       icon: TrendingDown    },
  { id: 'subscriptions', label: 'Subscriptions',  icon: CreditCard      },
]

const NAV_ACCOUNT = [
  { id: 'notifications', label: 'Notifications', icon: Bell     },
  { id: 'settings',      label: 'Settings',      icon: Settings },
]

export default function Sidebar({ mobileOpen, onClose }) {
  const {
    activePage, setActivePage,
    totalIncome, totalExpenses, balance,
    user, logout,
    subscriptions,
  } = useApp()

  // Unread notification badge count — bills due within 7 days
  const urgentCount = (subscriptions || []).filter(s => {
    if (s.status !== 'active' || !s.nextBilling) return false
    const today  = new Date(); today.setHours(0,0,0,0)
    const bill   = new Date(s.nextBilling); bill.setHours(0,0,0,0)
    const days   = Math.ceil((bill - today) / 86400000)
    return days >= 0 && days <= 7
  }).length

  const handleNav = (id) => {
    setActivePage(id)
    onClose?.()
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <motion.aside
        initial={false}
        className={clsx(
          'fixed top-0 left-0 h-full z-50 flex flex-col w-[260px]',
          'md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'transition-transform duration-300 ease-in-out'
        )}
        style={{
          background:    'linear-gradient(180deg, rgba(15,12,41,0.98) 0%, rgba(30,27,75,0.98) 100%)',
          borderRight:   '1px solid rgba(255,255,255,0.07)',
          backdropFilter:'blur(20px)',
        }}
      >
        {/* ── Logo ─────────────────────────────────────────────────── */}
        <div className="p-6 pb-4">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7928CA, #FF0080)' }}>
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-white text-lg leading-none">SubFlow</div>
              <div className="text-xs text-white/40 mt-0.5 font-mono">v2.0</div>
            </div>
          </motion.div>
        </div>

        {/* ── Balance card ─────────────────────────────────────────── */}
        <div className="px-4 mb-4">
          <motion.div
            className="rounded-2xl p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(121,40,202,0.3), rgba(255,0,128,0.2))',
              border:     '1px solid rgba(139,92,246,0.25)',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
          >
            <div className="text-xs text-white/50 mb-1 font-medium">Net Balance</div>
            <div className={clsx(
              'text-2xl font-bold font-display',
              balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
            )}>
              {balance >= 0 ? '+' : '-'}₹{Math.abs(balance).toLocaleString('en-IN')}
            </div>
            <div className="flex gap-2 mt-2">
              <div className="flex-1">
                <div className="text-[10px] text-white/40">Income</div>
                <div className="text-xs text-emerald-400 font-semibold">{fmtShort(totalIncome)}</div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-white/40">Expenses</div>
                <div className="text-xs text-rose-400 font-semibold">{fmtShort(totalExpenses)}</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Navigation ───────────────────────────────────────────── */}
        <nav className="flex-1 px-3 overflow-y-auto">
          {/* Main nav */}
          <div className="text-[10px] text-white/30 px-3 mb-2 font-semibold tracking-widest uppercase">
            Main
          </div>
          {NAV_MAIN.map(({ id, label, icon: Icon }, i) => (
            <motion.button
              key={id}
              className={clsx('nav-link', activePage === id && 'active')}
              onClick={() => handleNav(id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon size={16} />
              <span>{label}</span>
              {activePage === id && (
                <ChevronRight size={14} className="ml-auto text-purple-400" />
              )}
            </motion.button>
          ))}

          {/* Account nav */}
          <div className="text-[10px] text-white/30 px-3 mb-2 mt-6 font-semibold tracking-widest uppercase">
            Account
          </div>
          {NAV_ACCOUNT.map(({ id, label, icon: Icon }, i) => (
            <motion.button
              key={id}
              className={clsx('nav-link', activePage === id && 'active')}
              onClick={() => handleNav(id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon size={16} />
              <span>{label}</span>
              {/* Unread badge on Notifications */}
              {id === 'notifications' && urgentCount > 0 && activePage !== 'notifications' && (
                <span
                  className="ml-auto text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                >
                  {urgentCount}
                </span>
              )}
              {activePage === id && (
                <ChevronRight size={14} className="ml-auto text-purple-400" />
              )}
            </motion.button>
          ))}
        </nav>

        {/* ── User card ─────────────────────────────────────────────── */}
        <div className="p-4 mt-auto">
          <div
            className="rounded-2xl p-3 flex items-center gap-3"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border:     '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7928CA, #FF0080)' }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</div>
              <div className="text-[11px] text-white/40 truncate">{user?.email || ''}</div>
            </div>
            <LogOut
              size={14}
              className="text-white/30 hover:text-white/70 cursor-pointer transition-colors flex-shrink-0"
              onClick={logout}
            />
          </div>
        </div>
      </motion.aside>
    </>
  )
}
