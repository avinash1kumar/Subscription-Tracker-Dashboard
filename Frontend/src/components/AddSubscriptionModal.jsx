import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import gsap from 'gsap';

export const AddSubscriptionModal = ({ onClose, onAdd }) => {
  const modalRef = useRef(null);
  const getDefaultNextBill = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    category: 'Entertainment',
    billingCycle: 'monthly',
    nextBillingDate: getDefaultNextBill()
  });

  // Automatically adjust the default date if they toggle annual/monthly
  useEffect(() => {
    const d = new Date();
    if (formData.billingCycle === 'annual') {
      d.setFullYear(d.getFullYear() + 1);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setFormData(prev => ({ ...prev, nextBillingDate: d.toISOString().split('T')[0] }));
  }, [formData.billingCycle]);

  useEffect(() => {
    gsap.fromTo(modalRef.current,
      { opacity: 0, scale: 0.95, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    );
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.cost || !formData.nextBillingDate) return;

    const newSub = {
      id: `sub-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      cost: parseFloat(formData.cost),
      status: 'active',
      billingCycle: formData.billingCycle,
      nextBillingDate: new Date(formData.nextBillingDate).toISOString(),
      iconUrl: null,
      history: []
    };

    onAdd(newSub);
  };

  const closeOut = () => {
    gsap.to(modalRef.current, {
      opacity: 0, scale: 0.95, y: 20, duration: 0.2, ease: 'power2.in',
      onComplete: onClose
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={closeOut}></div>
      <div ref={modalRef} className="glass-panel w-full max-w-md p-6 relative z-10 border border-dark-600/50 shadow-2xl">
        <button onClick={closeOut} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors">
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-slate-100 mb-6">Add Subscription</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Service Name</label>
            <input 
              type="text" 
              required
              className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all"
              placeholder="e.g. Netflix"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Cost ($)</label>
              <input 
                type="number" 
                step="0.01"
                required
                className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-blue/50 transition-all"
                placeholder="19.99"
                value={formData.cost}
                onChange={e => setFormData({...formData, cost: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Billing Cycle</label>
              <select 
                className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-blue/50 transition-all"
                value={formData.billingCycle}
                onChange={e => setFormData({...formData, billingCycle: e.target.value})}
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
              <select 
                className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-blue/50 transition-all"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="Entertainment">Entertainment</option>
                <option value="Music">Music</option>
                <option value="Software">Software</option>
                <option value="Health">Health</option>
                <option value="News">News</option>
                <option value="Shopping">Shopping</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Next Billing Date</label>
              <input 
                type="date" 
                required
                className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-blue/50 transition-all"
                value={formData.nextBillingDate}
                onChange={e => setFormData({...formData, nextBillingDate: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full mt-6 bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity flex justify-center items-center gap-2 shadow-lg shadow-brand-blue/20"
          >
            Create Subscription
          </button>
        </form>
      </div>
    </div>
  );
};
