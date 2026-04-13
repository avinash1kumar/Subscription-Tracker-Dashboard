import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Mail, Lock, User, Wallet, X } from 'lucide-react';

export const AuthScreen = ({ onLogin, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const containerRef = useRef(null);
  const formRef = useRef(null);

  // Entrance animation
  useEffect(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0, scale: 0.95, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  }, []);

  // Form toggle animation
  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current,
        { opacity: 0, x: isLogin ? -20 : 20 },
        { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [isLogin]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulate API delay
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = "Authenticating...";
    btn.disabled = true;
    
    setTimeout(() => {
      onLogin(isLogin ? "Avinash" : fullName); // Pass dynamic name if signing up
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-900/50 backdrop-blur-xl">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div ref={containerRef} className="glass-panel w-full max-w-md p-8 relative overflow-hidden border border-brand-blue/20 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
        
        {onClose && (
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors z-20"
          >
            <X size={20} />
          </button>
        )}

        {/* Decorative flair */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-blue/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-brand-purple/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center shadow-lg shadow-brand-blue/30 mb-4">
            <Wallet size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-1">SubTrack</h2>
          <p className="text-slate-400 text-sm text-center">
            {isLogin ? "Welcome back! Login to see your finances." : "Take control of your recurring expenses."}
          </p>
        </div>

        <div className="flex bg-dark-800 rounded-lg p-1 mb-6 relative z-10">
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-dark-700 text-slate-200 shadow' : 'text-slate-500 hover:text-slate-300'}`}
            onClick={() => setIsLogin(true)}
          >
            Log In
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-dark-700 text-slate-200 shadow' : 'text-slate-500 hover:text-slate-300'}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-slate-500" />
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={16} className="text-slate-500" />
              </div>
              <input 
                type="email" 
                required
                placeholder="hello@example.com"
                className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all"
              />
            </div>
          </div>

          <div>
             <div className="flex justify-between items-end mb-1">
               <label className="block text-xs font-medium text-slate-400">Password</label>
               {isLogin && <a href="#" className="text-[10px] text-brand-blue hover:underline">Forgot password?</a>}
             </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-slate-500" />
              </div>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full mt-2 bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-brand-blue/20"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-500 mt-6 relative z-10">
          By continuing, you agree to SubTrack's Terms of Service and Privacy Policy.
        </p>

      </div>
    </div>
  );
};
