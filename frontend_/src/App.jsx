import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AppProvider, useApp } from './content/AppContext'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import BackgroundOrbs from './components/BackgroundOrbs'
import AddModal from './components/AddModal'
import Dashboard      from './pages/Dashboard'
import Income         from './pages/Income'
import Expenses       from './pages/Expenses'
import Subscriptions  from './pages/Subscriptions'
import Notifications  from './pages/Notifications'
import Settings       from './pages/Settings'
import AuthPage       from './pages/AuthPage'

const PAGE_COMPONENTS = {
  dashboard:     Dashboard,
  income:        Income,
  expenses:      Expenses,
  subscriptions: Subscriptions,
  notifications: Notifications,
  settings:      Settings,
}

// Full-screen loading spinner shown while checking saved session
function SplashScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #1a0533 100%)' }}>
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse"
          style={{ background: 'linear-gradient(135deg, #7928CA, #FF0080)' }}>
          <span className="text-white text-2xl">⚡</span>
        </div>
        <p className="text-white/40 text-sm">Loading SubFlow...</p>
      </div>
    </div>
  )
}

function AppInner() {
  const { user, authLoading, activePage } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalOpen, setModalOpen]     = useState(false)

  // 1. Still checking if user has a saved token → show splash
  if (authLoading) return <SplashScreen />

  // 2. Not logged in → show Auth page
  if (!user) return <AuthPage />

  // 3. Logged in → show dashboard
  const PageComponent = PAGE_COMPONENTS[activePage] || Dashboard

  return (
    <div className="min-h-screen relative">
      <BackgroundOrbs />

      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative z-10 md:pl-[260px] min-h-screen flex flex-col">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          onAddClick={() => setModalOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 max-w-[1400px] w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <PageComponent />
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="py-4 px-6 text-center">
          <p className="text-white/20 text-xs font-mono">
            SubFlow v2.0 · Built with React + Tailwind + Node.js
          </p>
        </footer>
      </div>

      <AddModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
