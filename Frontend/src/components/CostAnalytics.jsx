import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 border-dark-600 text-sm">
        <p className="font-semibold text-slate-200 mb-1">{payload[0].name}</p>
        <p className="text-brand-blue font-mono font-medium">${payload[0].value.toFixed(2)}/mo</p>
      </div>
    );
  }
  return null;
};

export const CostAnalytics = ({ categoryData, subscriptions = [] }) => {
  const chartRef = useRef(null);
  const detailsRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    if (chartRef.current) {
      gsap.fromTo(chartRef.current, 
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.7)", delay: 0.2 }
      );
    }
  }, []);

  useEffect(() => {
    if (activeCategory && detailsRef.current) {
      gsap.fromTo(detailsRef.current, 
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [activeCategory]);

  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-1">Cost Analytics</h2>
        <p className="text-sm text-slate-400">Monthly breakdown by category (normalized)</p>
      </div>
      
      <div ref={chartRef} className="flex-1 min-h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              animationBegin={400}
              animationDuration={800}
              onClick={(data) => setActiveCategory(activeCategory === data.name ? null : data.name)}
              className="cursor-pointer"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{ paddingTop: "20px", fontSize: "14px", color: "#94a3b8" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Expanded Category Details */}
      {activeCategory && subscriptions.length > 0 && (
        <div ref={detailsRef} className="mt-4 border-t border-dark-700/50 pt-4 overflow-hidden origin-top">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-slate-300">
              <span className="text-white font-bold">{activeCategory}</span> Subscriptions
            </h3>
            <button 
              onClick={() => setActiveCategory(null)} 
              className="text-xs px-2 py-1 bg-dark-700 hover:bg-dark-600 rounded text-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {subscriptions.filter(s => s.category === activeCategory).map(sub => (
              <div key={sub.id} className="flex justify-between items-center bg-dark-800/80 p-2.5 rounded-lg text-sm border border-dark-700/50">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[categoryData.findIndex(c => c.name === activeCategory) % COLORS.length]}}></span>
                  <span className="font-medium text-slate-200">{sub.name}</span>
                </span>
                <span className="font-mono text-brand-blue">${(sub.billingCycle === 'annual' ? sub.cost / 12 : sub.cost).toFixed(2)}/mo</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
