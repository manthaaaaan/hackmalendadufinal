import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { getTrendArrow } from '../utils/scoring';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const History = () => {
  const { history, loadFromHistory } = useContext(AppContext);
  const navigate = useNavigate();

  const handleRowClick = (index) => {
    loadFromHistory(index);
    navigate('/dashboard');
  };

  // Setup data for the chart, reverse it so oldest is left, newest is right
  const chartData = [...history].reverse().map(run => ({
    date: new Date(run.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: run.brandHealthScore
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-card border border-brand-border p-3 rounded-lg shadow-xl">
          <p className="text-brand-textSecondary text-xs">{label}</p>
          <p className="text-white font-bold text-lg mt-1">Score: <span className="text-brand-primary">{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-6 py-12"
    >
      <h1 className="text-white text-4xl font-extrabold tracking-tight mb-12">Analysis History</h1>

      {history.length === 0 ? (
        <div className="apple-card p-12 text-center">
           <p className="text-brand-textSecondary text-xl">No analyses yet. Upload your first CSV to begin.</p>
           <button 
             onClick={() => navigate('/')}
             className="mt-6 bg-brand-primary hover:bg-indigo-600 text-white px-8 py-3 rounded-full font-bold transition-all"
           >
              Go to Upload
           </button>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
           
           {/* Line Chart */}
           {chartData.length > 1 && (
              <section className="apple-card p-8">
                 <h2 className="text-white font-bold text-2xl mb-6">Brand Health Score Over Time</h2>
                 <div className="h-[300px] w-full mt-8">
                    <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                          <XAxis 
                             dataKey="date" 
                             stroke="#9CA3AF" 
                             tickLine={false} 
                             axisLine={false}
                             tick={{ fill: '#9CA3AF', fontSize: 12 }}
                             dy={10}
                          />
                          <YAxis 
                             domain={[0, 100]} 
                             stroke="#9CA3AF" 
                             tickLine={false} 
                             axisLine={false}
                             tick={{ fill: '#9CA3AF', fontSize: 12 }}
                          />
                          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#374151', strokeWidth: 1 }} />
                          <Line 
                             type="monotone" 
                             dataKey="score" 
                             stroke="#6366F1" 
                             strokeWidth={3} 
                             dot={{ fill: '#6366F1', r: 5, strokeWidth: 2, stroke: '#0A0F1E' }}
                             activeDot={{ r: 7, strokeWidth: 0 }}
                          />
                       </LineChart>
                    </ResponsiveContainer>
                 </div>
              </section>
           )}

           {/* Table */}
           <section className="apple-card overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-brand-dark/50 border-b border-brand-border/50 text-brand-textSecondary text-sm uppercase tracking-wider">
                     <th className="px-6 py-4 font-semibold">Date</th>
                     <th className="px-6 py-4 font-semibold">Product Name</th>
                     <th className="px-6 py-4 font-semibold">Brand Health Score</th>
                     <th className="px-6 py-4 font-semibold text-right">Trend</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-brand-border/30">
                    {history.map((run, idx) => {
                       // Find previous for trend
                       const prev = history[idx + 1];
                       const trend = getTrendArrow(run.brandHealthScore, prev?.brandHealthScore);
                       
                       const dateObj = new Date(run.date);
                       const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                       let scoreBadge = "bg-brand-success text-white";
                       if (run.brandHealthScore < 50) scoreBadge = "bg-brand-error text-white";
                       else if (run.brandHealthScore <= 75) scoreBadge = "bg-brand-warning text-white";

                       return (
                         <tr 
                           key={run.date} 
                           onClick={() => handleRowClick(idx)}
                           className="group hover:bg-brand-border/30 cursor-pointer transition-colors"
                         >
                           <td className="px-6 py-4 whitespace-nowrap text-brand-textSecondary group-hover:text-white transition-colors">
                              {dateStr}
                           </td>
                           <td className="px-6 py-4 text-white font-medium">
                              {run.productName}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 font-bold rounded-md ${scoreBadge}`}>
                                 {run.brandHealthScore}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right whitespace-nowrap font-medium">
                              {trend.text === 'NEW' ? (
                                  <span className="text-brand-primary text-xs uppercase font-bold px-2 py-1 bg-brand-primary/10 rounded">New</span>
                              ) : (
                                  <span className={`inline-flex items-center gap-1 ${trend.color}`}>
                                     {trend.symbol} {trend.text}
                                  </span>
                              )}
                           </td>
                         </tr>
                       );
                    })}
                 </tbody>
               </table>
             </div>
           </section>
        </div>
      )}
    </motion.div>
  );
};
