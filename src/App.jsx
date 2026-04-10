import { useState } from 'react';
import { mockUser, mockSubscriptions, getNormalizedMonthlyMRR, getCategoryBreakdown, getUpcomingBills, getAlerts } from './data/mockData';
import { StatCards } from './components/StatCards';
import { SubscriptionList } from './components/SubscriptionList';
import { CostAnalytics } from './components/CostAnalytics';
import { PredictiveAlerts } from './components/PredictiveAlerts';
import { UpcomingTimeline } from './components/UpcomingTimeline';
import { Wallet, BellRing, Settings, LogOut, LayoutDashboard } from 'lucide-react';


function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Computed Data
  const mrr = getNormalizedMonthlyMRR(mockSubscriptions);
  const activeCount = mockSubscriptions.filter(s => s.status === 'active').length;
  const categoryData = getCategoryBreakdown(mockSubscriptions);
  const upcomingBills = getUpcomingBills(mockSubscriptions, 30);
  const alerts = getAlerts(mockSubscriptions, mockUser.bankBalance);

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-dark-900 border-r border-dark-700/50 flex flex-col z-20 shrink-0">
        <div className="p-6 border-b border-dark-700/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center shadow-lg shadow-brand-blue/20">
            <Wallet size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">SubTrack</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-brand-blue/10 text-brand-blue' : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-dark-800 transition-all cursor-not-allowed opacity-50"
          >
            <Settings size={18} /> Settings (WIP)
          </button>
        </nav>

        <div className="p-4 border-t border-dark-700/50">
          <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-slate-200 cursor-pointer transition-colors">
            <LogOut size={18} /> Logout
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative h-screen overflow-hidden bg-dark-900">
        
        {/* Background decorative gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-purple/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-brand-blue/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* TOPBAR */}
        <header className="h-16 border-b border-dark-700/50 backdrop-blur-md bg-dark-900/50 flex items-center justify-between px-6 z-10 shrink-0">
          <div>
            <h1 className="text-lg font-medium text-slate-200">Welcome back, {mockUser.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-dark-800/80 px-3 py-1.5 rounded-full border border-dark-700/50">
              <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
              <span className="text-xs text-slate-300">Bank Synced</span>
            </div>
            <div className="text-sm font-mono bg-dark-800/80 px-3 py-1.5 rounded-full border border-dark-700/50 border border-brand-emerald/20 text-brand-emerald">
              Balance: ${mockUser.bankBalance.toFixed(2)}
            </div>
            <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors">
              <BellRing size={20} />
              {alerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-brand-rose rounded-full"></span>
              )}
            </button>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative z-10">
          <div className="max-w-6xl mx-auto space-y-6">
            <StatCards mrr={mrr} activeCount={activeCount} />
            
            {/* Layout Updates */}
            <div className="space-y-8">
              {/* Full Width List */}
              <SubscriptionList subscriptions={mockSubscriptions} />
              
              {/* Layout: Smart Alerts full width, Chart & Timeline split in a row */}
              <div className="space-y-6">
                <div className="h-[400px] lg:h-auto lg:min-h-[300px]">
                  <PredictiveAlerts alerts={alerts} />
                </div>
                
                {/* 2-Column Row for Analytics and Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-[400px] lg:h-auto lg:min-h-[400px]">
                    <CostAnalytics categoryData={categoryData} />
                  </div>
                  <div className="h-[400px] lg:h-auto lg:min-h-[400px]">
                    <UpcomingTimeline upcomingBills={upcomingBills} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

    </div>
  );
}

export default App;
