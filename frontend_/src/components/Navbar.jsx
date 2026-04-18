import React from 'react'
import { motion } from 'framer-motion'
import { Menu, Bell, Search, Plus } from 'lucide-react'
import { useApp } from '../content/AppContext'

const PAGE_TITLES = {
  dashboard: { title: 'Dashboard', sub: 'Overview of your financial flow' },
  income: { title: 'Income', sub: 'Track all your earnings' },
  expenses: { title: 'Expenses', sub: 'Manage your subscriptions & spending' },
}

export default function Navbar({ onMenuClick, onAddClick }) {
  const { activePage } = useApp()
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
        {/* Search (decorative on mobile) */}
        <div className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/40"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Search size={14} />
          <span className="text-xs">Search...</span>
          <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono">⌘K</span>
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center btn-ghost">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
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
