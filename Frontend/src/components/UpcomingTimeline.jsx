import React, { useEffect, useRef, useState } from 'react';
import { Calendar as CalendarIcon, ArrowRight, CreditCard, ExternalLink } from 'lucide-react';
import gsap from 'gsap';
import clsx from 'clsx';

export const UpcomingTimeline = ({ upcomingBills }) => {
  const timelineRef = useRef(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (timelineRef.current) {
      gsap.fromTo(timelineRef.current.children,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.5 }
      );
    }
  }, []);

  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Upcoming Timeline</h2>
        <span className="text-xs text-slate-400 bg-dark-700 px-2 py-1 rounded-md">Next 30 Days</span>
      </div>

      <div className="relative flex-1 pl-4 border-l border-dark-700/50" ref={timelineRef}>
        {upcomingBills.length === 0 && (
          <div className="text-slate-500 text-sm py-4">No upcoming bills in the next 30 days.</div>
        )}
        
        {upcomingBills.map((bill) => {
          const dateObj = new Date(bill.nextBillingDate);
          const isToday = new Date().toDateString() === dateObj.toDateString();
          
          return (
            <div 
              key={`${bill.id}-timeline`} 
              className="mb-8 relative group cursor-pointer"
              onClick={() => setExpandedId(expandedId === bill.id ? null : bill.id)}
              >
              {/* Timeline Dot */}
              <div className={clsx(
                "absolute -left-[21px] w-3 h-3 rounded-full border-2 border-dark-800",
                isToday ? "bg-brand-rose" : "bg-brand-blue group-hover:bg-brand-purple transition-colors"
              )}></div>

              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{bill.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                    <CalendarIcon size={12} />
                    <span>{isToday ? 'Today' : dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-medium text-slate-200">
                    ${bill.cost.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                    {bill.billingCycle}
                  </div>
                </div>
                </div>

              {/* Expanded Timeline Details */}
              {expandedId === bill.id && (
                <div className="mt-4 bg-dark-800/80 p-4 rounded-lg text-sm border border-dark-700/50 origin-top animate-in slide-in-from-top-2 duration-300 shadow-inner">
                  <div className="space-y-3">
                     <div className="flex justify-between items-center text-slate-300">
                        <span className="flex items-center gap-2"><CreditCard size={14} className="text-slate-400"/> Payment Method</span>
                        <span className="font-medium text-slate-200">Visa •••• 4242</span>
                     </div>
                     <div className="flex justify-between items-center text-slate-300">
                        <span className="flex items-center gap-2">Category</span>
                        <span className="text-slate-200">{bill.category}</span>
                     </div>
                     <div className="pt-3 flex justify-end gap-3 border-t border-dark-700/50 mt-3">
                        <button className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors">Skip</button>
                        <button className="px-4 py-1.5 text-xs font-medium bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 rounded flex items-center gap-1.5 transition-colors border border-brand-blue/20">
                          <ExternalLink size={12}/> View Invoice
                        </button>
                     </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
