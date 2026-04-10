import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Calendar, RefreshCw, ChevronDown, ChevronRight, TrendingUp, XCircle } from 'lucide-react';
import clsx from 'clsx';

export const SubscriptionList = ({ subscriptions }) => {
  const listRef = useRef(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    // Stagger row rows
    if (listRef.current) {
      gsap.fromTo(listRef.current.children, 
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.4 }
      );
    }
  }, []);

  return (
    <div className="glass-panel overflow-hidden">
      <div className="p-6 border-b border-dark-700/50 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Active Subscriptions</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-dark-800/30 text-slate-400 text-sm">
              <th className="px-6 py-4 font-medium">Service</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Cost / Cycle</th>
              <th className="px-6 py-4 font-medium">Monthly MRR</th>
              <th className="px-6 py-4 font-medium">Next Bill</th>
            </tr>
          </thead>
          <tbody ref={listRef} className="divide-y divide-dark-700/30 text-slate-200">
            {subscriptions.map((sub) => {
              const normalizedMRR = sub.billingCycle === 'annual' ? sub.cost / 12 : sub.cost;
              const dateObj = new Date(sub.nextBillingDate);
              const formattedDate = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
              const isSoon = (dateObj - new Date()) / (1000 * 60 * 60 * 24) <= 5; // <= 5 days away
              const isExpanded = expandedId === sub.id;

              return (
                <React.Fragment key={sub.id}>
                  <tr 
                    onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                    className="hover:bg-dark-700/20 transition-colors duration-200 group cursor-pointer"
                  >
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <div className="mr-2">
                        {isExpanded ? <ChevronDown size={16} className="text-brand-blue" /> : <ChevronRight size={16} className="text-slate-500 group-hover:text-slate-300" />}
                      </div>
                      {sub.iconUrl ? (
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center p-1">
                          <img src={sub.iconUrl} alt={sub.name} className="max-w-full max-h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center">
                          <span className="text-sm font-bold text-slate-300">{sub.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="font-medium text-slate-200">{sub.name}</span>
                    </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-dark-700 text-slate-300 border border-dark-600 group-hover:border-slate-500 transition-colors">
                      {sub.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">
                    ${sub.cost.toFixed(2)} 
                    <span className="text-xs text-slate-500 ml-1 ml-2 inline-flex items-center gap-1">
                      <RefreshCw size={12} /> {sub.billingCycle}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm border-l border-dark-700/50">
                    <span className={clsx(sub.billingCycle === 'annual' && "text-brand-emerald")}>
                      ${normalizedMRR.toFixed(2)}/mo
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} className={clsx(isSoon ? "text-brand-rose" : "text-slate-400")} />
                      <span className={clsx("text-sm", isSoon && "text-brand-rose font-medium")}>{formattedDate}</span>
                      {isSoon && <span className="w-2 h-2 rounded-full bg-brand-rose animate-pulse"></span>}
                    </div>
                  </td>
                </tr>
                {/* Expandable Details Row */}
                {isExpanded && (
                  <tr>
                    <td colSpan="5" className="px-0 py-0 border-b border-dark-700/30">
                      <div className="bg-dark-800/80 p-6 overflow-hidden origin-top animate-in slide-in-from-top-2 duration-300 shadow-inner">
                        <div className="flex flex-col md:flex-row gap-8">
                          {/* Price History */}
                          <div className="flex-1">
                            <h4 className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
                              <TrendingUp size={16} /> Price History
                            </h4>
                            <div className="space-y-3">
                              {sub.history && sub.history.length > 0 ? (
                                sub.history.map((record, i) => (
                                  <div key={i} className="flex justify-between items-center text-sm border-b border-dark-700/50 pb-2">
                                    <span className="text-slate-300">{record.date}</span>
                                    <span className="font-mono text-slate-200">
                                      ${record.cost.toFixed(2)}
                                      {i > 0 && record.cost > sub.history[i-1].cost && (
                                        <span className="text-brand-rose ml-2 text-xs">+{((record.cost - sub.history[i-1].cost)/sub.history[i-1].cost*100).toFixed(0)}%</span>
                                      )}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-slate-500 italic">No price data recorded.</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Quick Actions */}
                          <div className="w-full md:w-64 space-y-3">
                             <h4 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Quick Actions</h4>
                             <button className="w-full py-2.5 px-4 rounded-lg bg-brand-rose/10 text-brand-rose hover:bg-brand-rose/20 transition-colors flex items-center justify-center gap-2 text-sm font-medium border border-brand-rose/20">
                               <XCircle size={16} /> Cancel Subscription
                             </button>
                             <button className="w-full py-2.5 px-4 rounded-lg bg-dark-700 text-slate-300 hover:bg-dark-600 transition-colors text-sm font-medium border border-dark-600 shadow-sm">
                               Configure Alerts
                             </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
