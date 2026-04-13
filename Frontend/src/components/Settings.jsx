import React, { useEffect, useRef } from 'react';
import { Shield, Bell, Moon, SwitchCamera, Banknote, HelpCircle } from 'lucide-react';
import gsap from 'gsap';

export const Settings = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current.children, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6" ref={containerRef}>
      <h2 className="text-2xl font-bold text-slate-100 mb-6">Settings</h2>

      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Shield size={18} className="text-brand-purple" /> Account Details
        </h3>
        <div className="space-y-4 text-sm text-slate-300">
          <div className="flex justify-between items-center py-2 border-b border-dark-700/50">
            <span>Primary Email</span>
            <span className="font-medium text-slate-200">user@example.com</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-dark-700/50">
            <span>Password</span>
            <button className="text-brand-blue hover:text-brand-blue/80 transition text-xs font-medium">Change Password</button>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Bell size={18} className="text-brand-emerald" /> Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-slate-200">Email Notifications</p>
              <p className="text-xs text-slate-400">Receive alerts for price creeps and low balances.</p>
            </div>
            <div className="w-12 h-6 bg-brand-blue rounded-full relative cursor-pointer border border-brand-blue/50">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-slate-200">Dark Mode</p>
              <p className="text-xs text-slate-400">You are already in the dark void.</p>
            </div>
            <div className="w-12 h-6 bg-brand-blue rounded-full relative cursor-pointer border border-brand-blue/50">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 border border-brand-rose/20">
        <h3 className="text-lg font-semibold text-brand-rose mb-2 flex items-center gap-2">
           Danger Zone
        </h3>
        <p className="text-sm text-slate-400 mb-4">Permanently delete your account and all mapped subscriptions.</p>
        <button className="px-4 py-2 bg-brand-rose/10 hover:bg-brand-rose/20 text-brand-rose rounded-lg text-sm font-medium transition border border-brand-rose/20">
          Delete Account
        </button>
      </div>

    </div>
  );
};
