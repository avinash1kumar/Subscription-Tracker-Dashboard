import { useState } from 'react';
import { mockUser, mockSubscriptions, getNormalizedMonthlyMRR, getCategoryBreakdown, getUpcomingBills, getAlerts } from './data/mockData';
import { StatCards } from './components/StatCards';
import { SubscriptionList } from './components/SubscriptionList';
import { CostAnalytics } from './components/CostAnalytics';
import { PredictiveAlerts } from './components/PredictiveAlerts';
import { UpcomingTimeline } from './components/UpcomingTimeline';
import { Wallet, BellRing, Settings, LogOut, LayoutDashboard, Plus, UserCircle } from 'lucide-react';
import { Settings as SettingsView } from './components/Settings';
import { AddSubscriptionModal } from './components/AddSubscriptionModal';
import { AuthScreen } from './components/AuthScreen';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeUser, setActiveUser] = useState(mockUser.name);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Computed Data
  const mrr = getNormalizedMonthlyMRR(subscriptions);
  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const categoryData = getCategoryBreakdown(subscriptions);
  const upcomingBills = getUpcomingBills(subscriptions, 30);
  const alerts = getAlerts(subscriptions, mockUser.bankBalance);

  return (
    <>
      {isAuthModalOpen && <AuthScreen onClose={() => setIsAuthModalOpen(false)} onLogin={(name) => { 
        setIsAuthenticated(true); 
        setActiveUser(name || mockUser.name);
        setIsAuthModalOpen(false); 
      }} />}

      <div className="min-h-screen bg-transparent flex flex-col md:flex-row font-sans">
        
        {/* SIDEBAR */}
        <aside className="w-full md:w-64 bg-dark-900/40 backdrop-blur-xl border-r border-dark-700/50 flex flex-col z-20 shrink-0">
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
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-brand-blue/10 text-brand-blue' : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800'}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} /> Settings
          </button>
          <div className="pt-4 border-t border-dark-700/50 mt-4">
            <button 
              onClick={() => isAuthenticated ? setIsAddModalOpen(true) : setIsAuthModalOpen(true)}
              className="w-full flex justify-center items-center gap-2 px-4 py-3 rounded-lg text-sm font-bold bg-brand-purple hover:bg-brand-purple/90 text-white transition-colors shadow-lg shadow-brand-purple/20"
            >
              <Plus size={18} /> Add Subscription
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-dark-700/50">
          {isAuthenticated ? (
            <div 
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
            >
              <LogOut size={18} /> Logout
            </div>
          ) : (
            <div className="px-4 py-3 text-xs text-slate-500 font-medium">
              Dashboard is in view-only mode
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative h-screen overflow-hidden bg-transparent">
        
        {/* Background decorative gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-purple/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-brand-blue/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* TOPBAR */}
        <header className="h-16 border-b border-dark-700/50 backdrop-blur-md bg-dark-900/50 flex items-center justify-between px-6 z-10 shrink-0">
          <div>
            <h1 className="text-lg font-medium text-slate-200">
              {isAuthenticated ? `Welcome back, ${activeUser}` : "Welcome, Guest"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-dark-800/80 px-3 py-1.5 rounded-full border border-dark-700/50">
              <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
              <span className="text-xs text-slate-300">Bank Synced</span>
            </div>
            <div className="text-sm font-mono bg-dark-800/80 px-3 py-1.5 rounded-full border border-dark-700/50 border border-brand-emerald/20 text-brand-emerald">
              Balance: ${mockUser.bankBalance.toFixed(2)}
            </div>

            <button 
              onClick={() => {
                setActiveTab('dashboard');
                setTimeout(() => {
                  const section = document.getElementById('alerts-section');
                  const scroller = document.getElementById('main-scroller');
                  if (section && scroller) {
                    scroller.scrollTo({ top: section.offsetTop - 20, behavior: 'smooth' });
                  }
                }, 100);
              }}
              className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <BellRing size={20} />
              {alerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-brand-rose rounded-full animate-[pulse_2s_ease-in-out_infinite]"></span>
              )}
            </button>

            {/* Auth Module */}
            {!isAuthenticated ? (
               <button 
                 onClick={() => setIsAuthModalOpen(true)}
                 className="p-1.5 ml-2 text-slate-400 hover:text-brand-blue transition-colors flex items-center gap-2 bg-dark-800/50 rounded-lg border border-dark-700 hover:border-brand-blue/50"
               >
                 <UserCircle size={20} />
                 <span className="text-sm font-medium hidden md:block">Sign In</span>
               </button>
            ) : (
               <button className="p-1.5 ml-2 text-brand-blue transition-colors flex items-center gap-2 bg-brand-blue/10 rounded-lg border border-brand-blue/30 cursor-default">
                 <UserCircle size={20} />
               </button>
            )}

          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div id="main-scroller" className="flex-1 overflow-y-auto p-6 custom-scrollbar relative z-10">
          {activeTab === 'dashboard' ? (
            <div className="max-w-6xl mx-auto space-y-6">
              <StatCards mrr={mrr} activeCount={activeCount} />
              
              {/* Layout Updates */}
              <div className="space-y-8">
                {/* Full Width List */}
                <SubscriptionList 
                  subscriptions={subscriptions} 
                  onDelete={(id) => setSubscriptions(prev => prev.filter(s => s.id !== id))} 
                />
                
                {/* Layout: Smart Alerts full width, Chart & Timeline split in a row */}
                <div className="space-y-6">
                  <div className="h-[400px] lg:h-auto lg:min-h-[300px]" id="alerts-section">
                    <PredictiveAlerts alerts={alerts} />
                  </div>
                  
                  {/* 2-Column Row for Analytics and Timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-[400px] lg:h-auto lg:min-h-[400px]">
                      <CostAnalytics categoryData={categoryData} subscriptions={subscriptions} />
                    </div>
                    <div className="h-[400px] lg:h-auto lg:min-h-[400px]">
                      <UpcomingTimeline upcomingBills={upcomingBills} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <SettingsView />
          )}
        </div>

        {/* Add Modal Rendering */}
        {isAddModalOpen && isAuthenticated && (
          <AddSubscriptionModal 
            onClose={() => setIsAddModalOpen(false)}
            onAdd={(newSub) => {
              setSubscriptions(prev => [...prev, newSub]);
              setIsAddModalOpen(false);
            }}
          />
        )}
      </main>
    </div>
    </>
  );
}

export default App;
