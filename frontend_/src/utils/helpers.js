export const fmt = (n) =>
  '₹' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })

export const fmtShort = (n) => {
  if (Math.abs(n) >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L'
  if (Math.abs(n) >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K'
  return '₹' + n
}

export const getDaysUntil = (dateStr) => {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0)
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24))
}

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export const CATEGORY_COLORS = {
  Entertainment: '#a855f7',
  Music: '#ec4899',
  Tech: '#06b6d4',
  Design: '#f59e0b',
  Health: '#10b981',
  Professional: '#3b82f6',
  Salary: '#280660ff',
  Freelance: '#06b6d4',
  Passive: '#f59e0b',
  Investment: '#a855f7',
  Food: '#f97316',
  Travel: '#8b5cf6',
  Other: '#6b7280',
}

export const EMOJI_LIST = ['🎬', '🎵', '📦', '☁️', '🎨', '🏋️', '💼', '📱', '🎮', '📰', '🛡️', '💰', '📈', '▶️', '🌐', '🎓', '🏥', '✈️', '🍔', '🛒']

export const CATEGORIES_EXPENSE = ['Entertainment', 'Music', 'Tech', 'Design', 'Health', 'Professional', 'Food', 'Travel', 'Other']
export const CATEGORIES_INCOME = ['Salary', 'Freelance', 'Passive', 'Investment', 'Business', 'Other']
export const CYCLES = ['monthly', 'yearly', 'weekly', 'quarterly', 'one-time']
