import { TrendingDown, CreditCard, PiggyBank } from 'lucide-react';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const StatCards = ({ mrr, activeCount }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // GSAP Stagger animation for cards
    const cards = containerRef.current.children;
    gsap.fromTo(cards, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power3.out" }
    );

    // GSAP Number Counters
    gsap.to('.mrr-counter', {
      innerText: mrr,
      duration: 1.5,
      snap: { innerText: 0.01 },
      ease: "power2.out",
      onUpdate: function() {
        // Format to fixed 2 decimals during the animation
        const elem = document.querySelector('.mrr-counter');
        if (elem) elem.innerHTML = Number(this.targets()[0].innerText).toFixed(2);
      }
    });

    gsap.to('.active-counter', {
      innerText: activeCount,
      duration: 1.5,
      snap: { innerText: 1 },
      ease: "power2.out"
    });

    gsap.to('.annual-counter', {
      innerText: mrr * 12,
      duration: 1.5,
      snap: { innerText: 1 },
      ease: "power2.out"
    });
  }, [mrr, activeCount]);

  return (
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Burn Rate Card */}
      <div className="glass-panel p-6 border-brand-rose/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingDown size={64} className="text-brand-rose" />
        </div>
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 rounded-full bg-brand-rose/10 text-brand-rose">
            <TrendingDown size={24} />
          </div>
          <h3 className="text-lg font-medium text-slate-300">Monthly Burn Rate</h3>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-bold font-mono tracking-tight">$<span className="mrr-counter">0.00</span></span>
          <span className="text-sm text-slate-400">/ mo</span>
        </div>
      </div>

      {/* Active Subscriptions Card */}
      <div className="glass-panel p-6 border-brand-blue/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <CreditCard size={64} className="text-brand-blue" />
        </div>
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 rounded-full bg-brand-blue/10 text-brand-blue">
            <CreditCard size={24} />
          </div>
          <h3 className="text-lg font-medium text-slate-300">Active Subs</h3>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-bold tracking-tight active-counter">0</span>
          <span className="text-sm text-slate-400">services</span>
        </div>
      </div>

      {/* Projected Yearly Card - Just a scaled visual metric */}
      <div className="glass-panel p-6 border-brand-emerald/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <PiggyBank size={64} className="text-brand-emerald" />
        </div>
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 rounded-full bg-brand-emerald/10 text-brand-emerald">
            <PiggyBank size={24} />
          </div>
          <h3 className="text-lg font-medium text-slate-300">Annual Run Rate</h3>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-bold font-mono tracking-tight">$<span className="annual-counter">0</span></span>
          <span className="text-sm text-slate-400">/ yr</span>
        </div>
      </div>
    </div>
  );
};
