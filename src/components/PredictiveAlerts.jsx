import { AlertTriangle, TrendingUp, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import clsx from 'clsx';

export const PredictiveAlerts = ({ alerts: initialAlerts }) => {
  const containerRef = useRef(null);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [expandedAlert, setExpandedAlert] = useState(null);

  useEffect(() => {
    if (containerRef.current && alerts.length > 0) {
      gsap.fromTo(containerRef.current.children,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.15, ease: "power2.out", delay: 0.6 }
      );
    }
  }, []);

  const dismissAlert = (id) => {
    // Animate out
    const element = document.getElementById(`alert-${id}`);
    gsap.to(element, {
      opacity: 0,
      height: 0,
      marginBottom: 0,
      padding: 0,
      duration: 0.3,
      onComplete: () => {
        setAlerts(alerts.filter(a => a.id !== id));
      }
    });
  };

  if (alerts.length === 0) {
    return (
      <div className="glass-panel p-6 h-full flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-dark-700/50 rounded-full flex items-center justify-center mb-3">
          <AlertTriangle className="text-slate-500" size={24} />
        </div>
        <p className="text-slate-400">All clear! No alerts at the moment.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <span>Smart Alerts</span>
        <span className="bg-brand-rose px-2 py-0.5 rounded-full text-xs font-bold text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]">
          {alerts.length}
        </span>
      </h2>
      
      <div ref={containerRef} className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {alerts.map((alert) => (
          <div 
            id={`alert-${alert.id}`}
            key={alert.id}
            className={clsx(
              "p-4 rounded-xl relative overflow-hidden group",
              alert.severity === 'critical' ? "bg-brand-rose/10 border border-brand-rose/30" : "bg-brand-emerald/10 border border-brand-emerald/30",
              alert.type === 'price_creep' && "bg-brand-blue/10 border-brand-blue/30"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={clsx(
                  "mt-0.5 p-2 rounded-full",
                  alert.severity === 'critical' ? "bg-brand-rose/20 text-brand-rose" : "bg-brand-blue/20 text-brand-blue"
                )}>
                  {alert.type === 'price_creep' ? <TrendingUp size={16} /> : <AlertTriangle size={16} />}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm mb-1">{alert.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{alert.message}</p>
                  
                  {alert.type === 'price_creep' && (
                    <div className="mt-3 flex gap-2">
                      <button 
                        onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                        className="px-3 py-1 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-md text-xs font-medium transition-colors"
                      >
                        {expandedAlert === alert.id ? 'Hide Details' : 'Review Plan'}
                      </button>
                      <button onClick={() => dismissAlert(alert.id)} className="px-3 py-1 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-md text-xs font-medium transition-colors shadow-lg shadow-brand-blue/20">
                        Accept Cost
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => dismissAlert(alert.id)}
                className="text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>

            {/* Expanded Content View */}
            {expandedAlert === alert.id && (
              <div className="mt-3 pt-3 border-t border-dark-700/50 origin-top animate-in slide-in-from-top-2 duration-300">
                <p className="text-xs text-slate-300 mb-3 leading-relaxed">This service has steadily increased in price over the last year. Choose an action below or evaluate lower tier plans to reduce your burn rate.</p>
                <div className="grid grid-cols-2 gap-2">
                   <div 
                     onClick={() => dismissAlert(alert.id)}
                     className="bg-dark-800/80 p-2.5 text-center rounded-lg border border-brand-rose/20 cursor-pointer hover:bg-dark-700 transition"
                   >
                     <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Cancel Plan</span>
                     <span className="block text-sm font-medium text-brand-rose mt-1">Delete Subscription</span>
                   </div>
                   <div className="bg-dark-800/80 p-2.5 text-center rounded-lg border border-dark-700 cursor-pointer hover:bg-dark-700 transition">
                     <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Downgrade</span>
                     <span className="block text-sm font-medium text-slate-200 mt-1">View Basic Tier</span>
                   </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
