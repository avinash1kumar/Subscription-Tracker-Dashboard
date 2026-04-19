import React from 'react'
import { motion } from 'framer-motion'
import { Menu, Bell, Plus } from 'lucide-react'
import { useApp } from '../content/AppContext'

const PAGE_TITLES = {
  dashboard:     { title: 'Dashboard',     sub: 'Overview of your financial flow'       },
  income:        { title: 'Income',         sub: 'Track all your earnings'               },
  expenses:      { title: 'Expenses',       sub: 'Manage your spending'                  },
  subscriptions: { title: 'Subscriptions', sub: 'Manage your recurring payments'        },
  notifications: { title: 'Notifications', sub: 'Smart alerts from your financial data' },
  settings:      { title: 'Settings',      sub: 'Manage your account and preferences'   },
}

export default function Navbar({ onMenuClick, onAddClick }) {
  const { activePage, setActivePage, subscriptions } = useApp()

  // Unread notification badge count — bills due within 7 days
  const urgentCount = (subscriptions || []).filter(s => {
    if (s.status !== 'active' || !s.nextBilling) return false
    const today  = new Date(); today.setHours(0,0,0,0)
    const bill   = new Date(s.nextBilling); bill.setHours(0,0,0,0)
    const days   = Math.ceil((bill - today) / 86400000)
    return days >= 0 && days <= 7
  }).length
  const { title, sub } = PAGE_TITLES[activePage] || PAGE_TITLES.dashboard

  return (
    <motion.header
      className="sticky top-0 z-30 flex items-center justify-between px-6 py-4"
      style={{
        background: 'rgba(15,12,41,0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center btn-ghost"
          onClick={onMenuClick}
        >
          <Menu size={16} />
        </button>
        <div>
          <h1 className="font-display font-bold text-white text-xl leading-none">{title}</h1>
          <p className="text-white/40 text-xs mt-0.5">{sub}</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button 
          className="relative w-9 h-9 rounded-xl flex items-center justify-center btn-ghost"
          onClick={() => setActivePage('notifications')}
        >
          <Bell size={15} />
          {urgentCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white" 
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
            >
              {urgentCount}
            </span>
          )}
        </button>

        {/* Add button */}
        <motion.button
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-semibold"
          onClick={onAddClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={15} />
          <span>Add New</span>
        </motion.button>
      </div>
    </motion.header>
  )
}
