import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ title, value, sub, icon: Icon, gradient, trend, trendValue, delay = 0 }) {
  const isPositiveTrend = trend === 'up'

  return (
    <motion.div
      className="relative rounded-3xl p-6 overflow-hidden cursor-default"
      style={{
        background: gradient || 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {/* Glow orb */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)' }} />

      {/* Shimmer line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)' }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
      />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">{title}</p>
          <motion.div
            className="text-3xl font-display font-bold text-white mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
          >
            {value}
          </motion.div>
          {sub && <p className="text-white/50 text-xs">{sub}</p>}
        </div>

        <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
          <Icon size={20} className="text-white" />
        </div>
      </div>

      {trendValue !== undefined && (
        <div className="flex items-center gap-1.5 mt-4 pt-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {isPositiveTrend
            ? <TrendingUp size={13} className="text-emerald-300" />
            : <TrendingDown size={13} className="text-rose-300" />}
          <span className={`text-xs font-semibold ${isPositiveTrend ? 'text-emerald-300' : 'text-rose-300'}`}>
            {trendValue}
          </span>
          <span className="text-white/40 text-xs">vs last month</span>
        </div>
      )}
    </motion.div>
  )
}
