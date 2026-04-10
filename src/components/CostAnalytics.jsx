import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useEffect, useRef } from 'react';
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

export const CostAnalytics = ({ categoryData }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      gsap.fromTo(chartRef.current, 
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.7)", delay: 0.2 }
      );
    }
  }, []);

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
    </div>
  );
};
