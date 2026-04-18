import React, { useState, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { runAnalysisPipeline } from '../api/pipeline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, Plus, Trash2, History as HistoryIcon, Globe, X, TrendingUp, ShieldCheck } from 'lucide-react';

export const Comparison = () => {
   const { history, setIsLoading, setStatusMessage, saveToHistory } = useContext(AppContext);

   const [slots, setSlots] = useState([null, null]);
   const [selectingSlot, setSelectingSlot] = useState(null);
   const [urlInputs, setUrlInputs] = useState(['', '', '']);
   const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

   // --- Handlers ---

   const handleHistorySelect = (analysisResult) => {
      const newSlots = [...slots];
      newSlots[selectingSlot] = analysisResult;
      setSlots(newSlots);
      setIsHistoryModalOpen(false);
      setSelectingSlot(null);
   };

   const handleUrlSubmit = async (slotIdx) => {
      const url = urlInputs[slotIdx].trim();
      if (!url || !url.startsWith('http')) return;

      setIsLoading(true);
      setStatusMessage(`Scraping Slot ${slotIdx + 1}...`);

      try {
         const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
         const response = await fetch(`${API_BASE_URL}/api/scrape`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
         });

         if (!response.ok) throw new Error("Scrape failed.");

         const data = await response.json();
         const mappedData = data.reviews.map(r => ({ text: r.text, images: r.images }));
         if (mappedData.length > 0) {
            if (data.productImage) mappedData[0].productImage = data.productImage;
            if (data.productName) mappedData[0].product_name = data.productName;
         }

         const result = await runAnalysisPipeline(mappedData, setStatusMessage);
         saveToHistory(result);

         const newSlots = [...slots];
         newSlots[slotIdx] = result;
         setSlots(newSlots);
      } catch (err) {
         console.error(err);
         alert("Analysis failed.");
      } finally {
         setIsLoading(false);
         setStatusMessage("");
      }
   };

   const clearSlot = (idx) => {
      const newSlots = [...slots];
      newSlots[idx] = null;
      setSlots(newSlots);
   };

   const addSlot = () => {
      if (slots.length < 3) setSlots([...slots, null]);
   };

   // --- Memoized Chart Data ---
   const healthData = useMemo(() => ([
      { name: 'Overall', ...slots.reduce((acc, s, idx) => ({ ...acc, [`p${idx}`]: s?.brandHealthScore || 0 }), {}) },
      { name: 'Quality', ...slots.reduce((acc, s, idx) => ({ ...acc, [`p${idx}`]: s?.scores.productQuality || 0 }), {}) },
      { name: 'Delivery', ...slots.reduce((acc, s, idx) => ({ ...acc, [`p${idx}`]: s?.scores.deliveryExperience || 0 }), {}) },
      { name: 'Packaging', ...slots.reduce((acc, s, idx) => ({ ...acc, [`p${idx}`]: s?.scores.packagingIntegrity || 0 }), {}) },
      { name: 'Sentiment', ...slots.reduce((acc, s, idx) => ({ ...acc, [`p${idx}`]: s?.scores.sentimentTrend || 0 }), {}) },
   ]), [slots]);

   // Safe grid col class (avoids dynamic Tailwind purge issues)
   const colClass = (n) => ({ 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3' }[n] ?? 'md:grid-cols-2');

   const activeSlots = slots.filter(Boolean);

   // --- SlotSelector ---
   const SlotSelector = ({ idx }) => (
      <div className="apple-card p-6 flex flex-col justify-center min-h-[300px] border-dashed border-2 border-brand-border hover:border-brand-primary transition-all group relative overflow-hidden">
         {slots.length > 2 && (
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => setSlots(slots.filter((_, i) => i !== idx))}>
                  <Trash2 size={16} className="text-brand-error" />
               </button>
            </div>
         )}
         <div className="flex flex-col gap-4 w-full">
            <button
               onClick={() => { setSelectingSlot(idx); setIsHistoryModalOpen(true); }}
               className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 p-5 rounded-3xl hover:bg-white/10 transition-all text-white font-bold"
            >
               <HistoryIcon size={22} className="text-brand-primary" />
               Select from History
            </button>

            <div className="relative flex items-center py-2">
               <div className="flex-grow border-t border-brand-border/50" />
               <span className="flex-shrink-0 mx-3 text-[9px] text-brand-textSecondary uppercase font-black tracking-widest">Or Analyze Link</span>
               <div className="flex-grow border-t border-brand-border/50" />
            </div>

            <div className="relative">
               <input
                  type="url"
                  placeholder="Paste product URL..."
                  value={urlInputs[idx] || ''}
                  onChange={(e) => {
                     const newInp = [...urlInputs];
                     newInp[idx] = e.target.value;
                     setUrlInputs(newInp);
                  }}
                  className="w-full bg-brand-dark border-2 border-brand-border focus:border-brand-primary rounded-xl px-4 py-4 pr-14 outline-none text-white text-sm"
               />
               <button
                  onClick={() => handleUrlSubmit(idx)}
                  className="absolute right-2 top-2 bottom-2 aspect-square bg-brand-primary rounded-xl flex items-center justify-center text-white"
               >
                  <Plus size={18} />
               </button>
            </div>
         </div>
      </div>
   );

   return (
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         className="max-w-7xl mx-auto px-6 py-12"
      >
         {/* ── Header ── */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
               <h1 className="text-white text-4xl font-extrabold tracking-tight">Comparison Intelligence</h1>
               <p className="text-brand-textSecondary mt-2">Column-based benchmarking for targeted product analysis.</p>
            </div>
            {slots.length < 3 && (
               <button
                  onClick={addSlot}
                  className="px-6 py-2.5 bg-brand-card hover:bg-brand-border border border-brand-border rounded-full text-white font-bold transition-all shadow-xl flex-shrink-0"
               >
                  + Add Slot
               </button>
            )}
         </div>

         {/* ── Slot Grid ── */}
         <div className={`grid grid-cols-1 ${colClass(slots.length)} gap-8 mb-16`}>
            {slots.map((s, i) => (
               <div key={i} className="min-w-0">
                  {!s ? (
                     <SlotSelector idx={i} />
                  ) : (
                     <div className="apple-card p-6 flex flex-col gap-5 border-2 border-brand-primary/20 relative group min-w-0 overflow-hidden">
                        <button
                           onClick={() => clearSlot(i)}
                           className="absolute top-4 right-4 z-20 p-2 rounded-full bg-brand-error/10 text-brand-error opacity-0 group-hover:opacity-100 transition-opacity border border-brand-error/20"
                        >
                           <Trash2 size={16} />
                        </button>
                        <div className="flex items-center gap-4 min-w-0">
                           <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                              {s.productImage
                                 ? <img src={s.productImage} className="w-full h-full object-cover" alt="" />
                                 : <Globe size={24} className="m-auto text-brand-textSecondary" />
                              }
                           </div>
                           {/* KEY FIX: flex-1 + min-w-0 + overflow-hidden on text wrapper */}
                           <div className="flex-1 min-w-0 overflow-hidden">
                              <span className="text-[10px] font-black uppercase text-brand-primary tracking-tighter block">
                                 Product Slot {i + 1}
                              </span>
                              <h3
                                 className="text-white font-bold text-lg truncate leading-tight mt-0.5 block w-full"
                                 title={s.productName}
                              >
                                 {s.productName}
                              </h3>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            ))}
         </div>

         {/* ── Comparison Sections ── */}
         <AnimatePresence>
            {activeSlots.length >= 2 ? (
               <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-16"
               >
                  {/* 1. Executive Summary */}
                  <section>
                     <div className="flex items-center gap-3 mb-8">
                        <TrendingUp size={24} className="text-brand-primary" />
                        <h2 className="text-white font-extrabold text-2xl tracking-tight">Executive Summary Benchmarks</h2>
                     </div>
                     <div className={`grid grid-cols-1 ${colClass(activeSlots.length)} gap-8`}>
                        {activeSlots.map((s, idx) => (
                           <div key={idx} className="bg-brand-card border border-brand-border rounded-3xl p-8 flex flex-col gap-8 shadow-2xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                              <div className="flex flex-col items-center justify-center py-6 border-b border-white/5">
                                 <span className="text-[10px] uppercase font-black tracking-[0.2em] text-brand-textSecondary mb-4">Overall Score</span>
                                 <div className="text-7xl font-black text-white">{s.brandHealthScore}</div>
                                 <div className="mt-4">
                                    <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                                       <div className="h-full bg-brand-primary" style={{ width: `${s.brandHealthScore}%` }} />
                                    </div>
                                 </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                    <span className="text-[9px] uppercase font-bold text-brand-textSecondary block mb-1">Authenticity</span>
                                    <span className="text-xl font-black text-brand-success">{s.verifiedReviewPercentage}%</span>
                                 </div>
                                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                    <span className="text-[9px] uppercase font-bold text-brand-textSecondary block mb-1">Sentiment</span>
                                    <span className="text-xl font-black text-blue-400">{s.scores.sentimentTrend}%</span>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </section>

                  {/* 2. Chart */}
                  <section className="apple-card p-10">
                     <h2 className="text-white font-bold text-2xl mb-12 text-center underline decoration-brand-primary/30 underline-offset-8">
                        Categorical Performance Analysis
                     </h2>
                     <div className="h-[450px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={healthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                              <XAxis dataKey="name" stroke="#666" tick={{ fill: '#999', fontSize: 13, fontWeight: 'bold' }} dy={10} />
                              <YAxis domain={[0, 100]} stroke="#666" tick={{ fill: '#999', fontSize: 12 }} />
                              <Tooltip
                                 contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid #333', borderRadius: '16px', color: '#fff', padding: '12px' }}
                                 itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                                 cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                              />
                              <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '12px', fontWeight: 'bold' }} />
                              {activeSlots.map((s, i) => (
                                 <Bar key={i} dataKey={`p${i}`} name={s.productName} fill={['#6366F1', '#A855F7', '#F43F5E'][i]} radius={[6, 6, 0, 0]} barSize={32} />
                              ))}
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </section>

                  {/* 3. Matrix */}
                  <section>
                     <div className="flex items-center gap-3 mb-8">
                        <ShieldCheck size={24} className="text-brand-primary" />
                        <h2 className="text-white font-extrabold text-2xl tracking-tight">Comparative Category Matrix</h2>
                     </div>

                     <div className="apple-card overflow-hidden">
                        {/* Header */}
                        <div className="grid grid-cols-12 bg-white/[0.03] border-b border-white/10 uppercase text-[9px] font-black tracking-widest text-brand-textSecondary">
                           <div className="col-span-3 p-8 border-r border-white/5">Analysis Focus</div>
                           {activeSlots.map((s, idx) => (
                              <div
                                 key={idx}
                                 className={`${activeSlots.length === 2 ? 'col-span-4' : 'col-span-3'} p-8 border-r border-white/5 last:border-r-0 flex items-center justify-between gap-3 overflow-hidden min-w-0`}
                              >
                                 <span className="truncate min-w-0 block" title={s.productName}>{s.productName}</span>
                                 <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: ['#6366F1', '#A855F7', '#F43F5E'][idx] }} />
                              </div>
                           ))}
                        </div>

                        {/* Rows */}
                        {['Product Quality', 'Delivery Issue', 'Packaging Problem'].map((category) => {
                           const catId = category.toLowerCase();
                           return (
                              <div key={category} className="grid grid-cols-12 border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-colors">
                                 <div className="col-span-3 p-8 border-r border-white/5 flex flex-col justify-center">
                                    <span className="text-white font-bold text-base tracking-tight">{category}</span>
                                    <span className="text-[9px] text-brand-textSecondary uppercase font-bold mt-2 tracking-wider opacity-60">Impact Weighting</span>
                                 </div>
                                 {activeSlots.map((s, idx) => {
                                    const count = s.painPointAggregations[catId]?.count || 0;
                                    const pct = Math.round((count / s.totalReviews) * 100) || 0;
                                    return (
                                       <div
                                          key={idx}
                                          className={`${activeSlots.length === 2 ? 'col-span-4' : 'col-span-3'} p-8 border-r border-white/5 last:border-r-0 flex items-center gap-6 overflow-hidden`}
                                       >
                                          <div className="text-3xl font-black text-white tabular-nums flex-shrink-0 min-w-[3.5ch]">{pct}%</div>
                                          <div className="flex-grow min-w-0">
                                             <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                                                <div
                                                   className="h-full rounded-full transition-all duration-1000 delay-300"
                                                   style={{ width: `${pct}%`, backgroundColor: ['#6366F1', '#A855F7', '#F43F5E'][idx] }}
                                                />
                                             </div>
                                             <p className="text-[10px] font-bold text-brand-textSecondary uppercase mt-3 tracking-wide truncate">
                                                {count} Recorded Grievances
                                             </p>
                                          </div>
                                       </div>
                                    );
                                 })}
                              </div>
                           );
                        })}
                     </div>
                  </section>
               </motion.div>
            ) : (
               <div className="mt-20 flex flex-col items-center justify-center text-center max-w-xl mx-auto opacity-40">
                  <div className="bg-brand-card p-8 rounded-full mb-8 border border-brand-border animate-pulse shadow-2xl">
                     <Search size={48} className="text-brand-primary" />
                  </div>
                  <h3 className="text-white font-extrabold text-2xl mb-3 tracking-tight">Gathering Intelligence...</h3>
                  <p className="text-brand-textSecondary text-lg leading-relaxed">
                     Select at least <strong>two products</strong> to activate the comparative matrix.
                  </p>
               </div>
            )}
         </AnimatePresence>

         {/* ── History Modal ── */}
         <AnimatePresence>
            {isHistoryModalOpen && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                  {/* Backdrop */}
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setIsHistoryModalOpen(false)}
                     className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                  />
                  {/* Panel */}
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 30 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 30 }}
                     className="relative z-10 w-full max-w-lg bg-[#0D0D0F] border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh]"
                  >
                     <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <div>
                           <h3 className="text-white font-bold text-xl tracking-tight">Repository History</h3>
                           <p className="text-brand-textSecondary text-[10px] mt-0.5 tracking-wide">Select to benchmark.</p>
                        </div>
                        <button
                           onClick={() => setIsHistoryModalOpen(false)}
                           className="bg-white/5 p-1.5 rounded-full text-brand-textSecondary hover:text-white transition-colors border border-white/10"
                        >
                           <X size={16} />
                        </button>
                     </div>

                     <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                        <div className="flex flex-col gap-3">
                           {history.length === 0 && (
                              <p className="text-center py-20 text-brand-textSecondary italic">
                                 No analysis history found in repository.
                              </p>
                           )}
                           {history.slice(0, 4).map((h, i) => (
                              <button
                                 key={i}
                                 onClick={() => handleHistorySelect(h)}
                                 className="flex items-center gap-4 p-4 bg-white/[0.01] hover:bg-white/[0.05] rounded-[1.2rem] transition-all border border-white/5 hover:border-brand-primary/30 text-left group w-full min-w-0"
                              >
                                 <div className="w-12 h-12 bg-brand-dark rounded-lg flex-shrink-0 overflow-hidden border border-white/10">
                                    {h.productImage
                                       ? <img src={h.productImage} className="w-full h-full object-cover" alt="" />
                                       : <TrendingUp size={20} className="m-auto text-brand-primary" />
                                    }
                                 </div>
                                 <div className="flex-grow min-w-0 overflow-hidden">
                                    <h4
                                       className="text-white font-bold text-base truncate block w-full group-hover:text-brand-primary transition-colors leading-tight"
                                       title={h.productName}
                                    >
                                       {h.productName}
                                    </h4>
                                    <div className="flex items-center gap-2.5 mt-1 text-[9px] text-brand-textSecondary font-bold tracking-wide uppercase">
                                       <span className="flex-shrink-0">{new Date(h.date).toLocaleDateString()}</span>
                                       <span className="w-1 h-1 bg-white/20 rounded-full flex-shrink-0" />
                                       <span className="flex-shrink-0">{h.totalReviews} Samples</span>
                                    </div>
                                 </div>
                                 <div className="flex flex-col items-center flex-shrink-0">
                                    <span className="text-brand-primary font-black text-xl">{h.brandHealthScore}</span>
                                    <span className="text-[7px] font-black uppercase text-brand-textSecondary tracking-tighter mt-[-2px]">Score</span>
                                 </div>
                              </button>
                           ))}
                        </div>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </motion.div>
   );
};