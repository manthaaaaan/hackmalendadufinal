import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence as MotionAnimatePresence } from 'framer-motion';
import { Download, Search, Filter, X } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { CircularProgress } from '../components/CircularProgress';
import { MetricRow } from '../components/MetricRow';
import { EmotionDonut } from '../components/EmotionDonut';
import { PainPointRow } from '../components/PainPointRow';
import { TicketCard } from '../components/TicketCard';
import { ReplyCard } from '../components/ReplyCard';
import { getTrendArrow } from '../utils/scoring';

export const Dashboard = () => {
  const { currentAnalysis, history } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentAnalysis) {
      navigate('/');
    }
  }, [currentAnalysis, navigate]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [botFilter, setBotFilter] = useState('all');

  const filteredReviews = useMemo(() => {
    if (!currentAnalysis?.processedReviews) return [];
    
    return currentAnalysis.processedReviews.filter(review => {
      // Search Term check
      const matchesSearch = !searchTerm || review.text.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Sentiment check
      const matchesSentiment = sentimentFilter === 'all' || review.sentiment === sentimentFilter;
      
      // Language check
      const matchesLanguage = languageFilter === 'all' || review.language === languageFilter;
      
      // Bot check
      const matchesBot = botFilter === 'all' || 
                        (botFilter === 'bot' && review.isBot) || 
                        (botFilter === 'verified' && !review.isBot);
      
      return matchesSearch && matchesSentiment && matchesLanguage && matchesBot;
    });
  }, [currentAnalysis, searchTerm, sentimentFilter, languageFilter, botFilter]);

  if (!currentAnalysis) return null;

  const {
    brandHealthScore,
    scores,
    emotionCounts,
    painPointAggregations,
    tickets,
    replies,
    processedReviews,
    verifiedReviewPercentage,
    topLocations
  } = currentAnalysis;

  // Calculate trends by looking at previous history item
  const prevIndex = history.findIndex(h => h === currentAnalysis) + 1;
  const previousAnalysis = history[prevIndex] || null;
  const prevScores = previousAnalysis?.scores;

  const trends = {
    productQuality: getTrendArrow(scores.productQuality, prevScores?.productQuality),
    deliveryExperience: getTrendArrow(scores.deliveryExperience, prevScores?.deliveryExperience),
    packagingIntegrity: getTrendArrow(scores.packagingIntegrity, prevScores?.packagingIntegrity),
    sentimentTrend: getTrendArrow(scores.sentimentTrend, prevScores?.sentimentTrend)
  };

  const painPointEntries = Object.entries(painPointAggregations)
     .sort((a, b) => b[1].count - a[1].count)
     .slice(0, 5); // top 5

  const downloadReport = async () => {
     // Invokes native browser engine for perfect vector-based 'Save as PDF' 
     window.print();
  };

  return (
    <div className="dashboard-container">
      {/* 
        ========================================================================
        DEDICATED PRINT REPORT (Hidden on Web, Visible in PDF)
        ========================================================================
      */}
      <div className="hidden print:block bg-white min-h-screen text-slate-900 font-sans p-0 m-0 print-report">
        <style>{`
          @media print {
            @page { margin: 12mm; size: A4; }
            body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .print-break-inside-avoid { page-break-inside: avoid; }
            .print-break-after-always { page-break-after: always; }
          }
        `}</style>
        
        {/* Report Header */}
        <header className="flex justify-between items-center border-b-2 border-slate-100 pb-6 mb-8">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                 <span className="text-white font-black text-xl">R</span>
              </div>
              <div>
                 <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">ReviewMind <span className="text-indigo-600">AI</span></h1>
                 <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Intelligence Report</p>
              </div>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Report Generated</p>
              <p className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
           </div>
        </header>

        {/* Executive Scorecard */}
        <section className="grid grid-cols-12 gap-8 mb-10 print-break-inside-avoid">
           <div className="col-span-4 flex flex-col items-center justify-center bg-indigo-50 border border-indigo-100 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Brand Health</div>
              <div className="relative">
                 <div className="text-7xl font-black text-indigo-600 drop-shadow-sm">{brandHealthScore}</div>
                 <div className="absolute -bottom-2 right-[-20px] text-xs font-bold text-indigo-400">/100</div>
              </div>
              <div className="mt-8 flex flex-col items-center gap-1">
                 <div className="h-1.5 w-32 bg-indigo-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${brandHealthScore}%` }}></div>
                 </div>
                 <span className="text-[10px] font-bold text-indigo-400 mt-2 uppercase">Overall Performance</span>
              </div>
           </div>

           <div className="col-span-8 grid grid-cols-2 gap-4">
              {[
                { label: 'Product Quality', score: scores.productQuality, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: '✦' },
                { label: 'Delivery Exp.', score: scores.deliveryExperience, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: '🚚' },
                { label: 'Packaging', score: scores.packagingIntegrity, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: '📦' },
                { label: 'Sentiment', score: scores.sentimentTrend, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: '📈' }
              ].map((m, i) => (
                <div key={i} className={`${m.bg} ${m.border} border rounded-2xl p-5 flex flex-col justify-between`}>
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{m.label}</span>
                      <span className="text-lg">{m.icon}</span>
                   </div>
                   <div className="flex items-baseline gap-1">
                      <span className={`text-2xl font-black ${m.color}`}>{m.score}</span>
                      <span className="text-[10px] font-bold text-slate-400">Pts</span>
                   </div>
                </div>
              ))}
              <div className="col-span-2 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                       <Search size={16} className="text-slate-400" />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Authenticity Audit</p>
                       <p className="text-sm font-bold text-slate-700">{verifiedReviewPercentage}% Verified Reviews</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Coverage</p>
                    <p className="text-sm font-bold text-slate-700">{topLocations.length > 0 ? topLocations[0].name : 'N/A'} Source</p>
                 </div>
              </div>
           </div>
        </section>

        {/* Product Focus Section */}
        {currentAnalysis.productName && currentAnalysis.productName !== "General Upload" && (
           <section className="mb-10 bg-slate-900 rounded-3xl p-6 flex items-center justify-between text-white print-break-inside-avoid shadow-xl">
              <div className="flex items-center gap-6">
                 {currentAnalysis.productImage && (
                    <img src={currentAnalysis.productImage} alt="" className="w-16 h-16 rounded-xl object-cover border-2 border-white/20" />
                 )}
                 <div>
                    <h2 className="text-lg font-bold tracking-tight opacity-90 leading-tight">Subject Analysis:</h2>
                    <p className="text-xl font-black">{currentAnalysis.productName}</p>
                 </div>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1 text-center">Data Pool</p>
                 <p className="text-lg font-black text-center">{processedReviews.length} Reviews</p>
              </div>
           </section>
        )}

        {/* Behavioral & Structural Pulse */}
        <div className="grid grid-cols-2 gap-8 mb-10">
           <section className="bg-white border-2 border-slate-50 rounded-3xl p-6 print-break-inside-avoid">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-50 pb-4">Emotional Pulse</h2>
              <div className="space-y-4">
                 {Object.entries(emotionCounts)
                   .sort((a,b) => b[1] - a[1])
                   .filter(([_,v]) => v > 0)
                   .map(([emo, count], idx) => {
                     const pct = Math.round((count / processedReviews.length) * 100);
                     const colors = {
                        joy: 'bg-emerald-500', anger: 'bg-rose-500', neutral: 'bg-slate-400', 
                        sadness: 'bg-blue-500', disgust: 'bg-orange-500', fear: 'bg-pink-500', surprise: 'bg-purple-500'
                     };
                     return (
                        <div key={emo} className="relative">
                           <div className="flex justify-between items-center text-[10px] font-bold mb-1 font-mono uppercase">
                              <span className="text-slate-600">{emo}</span>
                              <span className="text-slate-400">{pct}%</span>
                           </div>
                           <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${colors[emo] || 'bg-slate-300'} rounded-full`} style={{ width: `${pct}%` }}></div>
                           </div>
                        </div>
                     );
                 })}
              </div>
           </section>

           <section className="bg-white border-2 border-slate-50 rounded-3xl p-6 print-break-inside-avoid">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-50 pb-4">Ranked Pain Points</h2>
              <div className="space-y-4">
                 {painPointEntries.length > 0 ? (
                    painPointEntries.map(([category, data], idx) => {
                       const pct = Math.round((data.count / processedReviews.length) * 100);
                       return (
                          <div key={category} className="flex items-center gap-4">
                             <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-500">
                                0{idx + 1}
                             </div>
                             <div className="flex-grow">
                                <p className="text-[10px] font-black uppercase text-slate-700 leading-none mb-1">{category}</p>
                                <p className="text-[10px] font-bold text-slate-400">{data.count} Critical Reports</p>
                             </div>
                             <div className="text-right">
                                <span className="text-xs font-black text-slate-900">{pct}%</span>
                             </div>
                          </div>
                       );
                    })
                 ) : (
                    <p className="text-sm text-slate-400 italic">No significant friction detected.</p>
                 )}
              </div>
           </section>
        </div>

        {/* Actionable Intelligence Section - Force page break if it gets too crowded */}
        <section className="print-break-inside-avoid mb-10">
           <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-50 pb-4">Strategy & Action Roadmap</h2>
           <div className="grid grid-cols-2 gap-6">
              {tickets.slice(0, 4).map((ticket, idx) => (
                 <div key={idx} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-3">
                       <span className={`w-2 h-2 rounded-full ${ticket.priority === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                       <span className="text-[10px] font-black uppercase text-slate-400">{ticket.priority} Priority</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight mb-2">{ticket.title}</h3>
                    <p className="text-[10px] text-slate-500 line-clamp-2">{ticket.description}</p>
                 </div>
              ))}
           </div>
        </section>

        {/* Footer for the first page */}
        <footer className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
           <div>ReviewMind AI · Proprietary Intelligence</div>
           <div>Page 1 of 2</div>
        </footer>

        {/* Second Page: Raw Data Analysis */}
        <div className="print-break-after-always"></div>
        
        <section className="pt-10">
           <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              Comprehensive Data Appendix
              <span className="text-xs bg-indigo-50 text-indigo-500 px-3 py-1 rounded-full">{processedReviews.length} Entries</span>
           </h2>
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50 border-b-2 border-slate-200">
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Review Segment</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Sentiment</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Auth.</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {processedReviews.slice(0, 50).map((review, i) => (
                    <tr key={i} className="print-break-inside-avoid">
                       <td className="px-4 py-3">
                          <p className="text-[11px] text-slate-700 leading-relaxed font-medium line-clamp-3">{review.text}</p>
                          <div className="flex gap-2 mt-2">
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-50 px-1.5 rounded">{review.language}</span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-50 px-1.5 rounded capitalize">{review.location}</span>
                          </div>
                       </td>
                       <td className="px-4 py-3 text-center">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                             review.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-600' : 
                             review.sentiment === 'negative' ? 'bg-rose-100 text-rose-600' : 
                             'bg-slate-100 text-slate-500'
                          }`}>{review.sentiment}</span>
                       </td>
                       <td className="px-4 py-3 text-center">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                             review.isBot ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-400'
                          }`}>{review.isBot ? 'Bot' : 'Verified'}</span>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
           {processedReviews.length > 50 && (
              <p className="text-[10px] text-slate-400 mt-6 text-center italic font-medium">... ({processedReviews.length - 50} more entries excluded from print optimization) ...</p>
           )}
        </section>

        <footer className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
           <div>Powered by Gemini 1.5 Flash · Groq Llama 3</div>
           <div>Page 2 of 2</div>
        </footer>
      </div>

      {/* 
        ========================================================================
        WEB DASHBOARD (Hidden on Print, Visible on Web)
        ========================================================================
      */}
      <div className="print:hidden">
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-6 py-12"
    >

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 hide-on-print">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Analysis Dashboard</h1>
        <button 
          onClick={downloadReport}
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-full font-bold transition-all shadow-lg hover:shadow-brand-primary/25"
        >
          <Download size={18} />
          Export Report (.pdf)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Main Content */}
        <div className="lg:col-span-8 flex flex-col gap-12">
            
            {/* Top Section - Brand Health */}
            <section className="flex flex-col md:flex-row gap-12 items-center apple-card p-8 relative overflow-hidden">
               {currentAnalysis.productImage && (
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-luminosity" style={{ backgroundImage: `url(${currentAnalysis.productImage})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(30px) saturate(2)' }}></div>
               )}
               
               <div className="flex-shrink-0 z-10">
                  <CircularProgress score={brandHealthScore} />
               </div>
               
               {currentAnalysis.productImage && (
                  <div className="flex-shrink-0 z-10 hidden lg:block">
                     <img src={currentAnalysis.productImage} alt="Product Insight" className="w-40 h-40 object-cover rounded-3xl shadow-2xl ring-1 ring-white/10 opacity-90" />
                  </div>
               )}
               
               <div className="flex-grow w-full flex flex-col gap-4 justify-center z-10">
                  {currentAnalysis.productName && currentAnalysis.productName !== "General Upload" && (
                      <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight mb-2 opacity-95 line-clamp-2">
                          {currentAnalysis.productName}
                      </h2>
                  )}
                  <MetricRow name="Product Quality" score={scores.productQuality} trend={trends.productQuality} />
                  <MetricRow name="Delivery Experience" score={scores.deliveryExperience} trend={trends.deliveryExperience} />
                  <MetricRow name="Packaging Integrity" score={scores.packagingIntegrity} trend={trends.packagingIntegrity} />
                  <MetricRow name="Sentiment Trend" score={scores.sentimentTrend} trend={trends.sentimentTrend} />
               </div>
               
               <div className="flex flex-col gap-4 min-w-[200px]">
                  <div className="apple-card p-4 flex flex-col items-center justify-center text-center flex-1">
                     <span className="text-brand-textSecondary text-[10px] font-bold uppercase tracking-widest mb-1">Authenticity Score</span>
                     <div className="text-3xl font-extrabold text-white">
                       {currentAnalysis.verifiedReviewPercentage || 0}%
                     </div>
                     <span className="text-brand-success text-[10px] font-medium">Verified Reviews</span>
                  </div>
                  
                  <div className="apple-card p-4 flex-1">
                     <h3 className="text-white font-bold text-[10px] uppercase tracking-wider mb-2 border-b border-white/5 pb-1">Geographic Intel</h3>
                     <div className="space-y-1.5">
                        {currentAnalysis.topLocations && currentAnalysis.topLocations.length > 0 ? (
                          currentAnalysis.topLocations.slice(0, 3).map((loc, i) => (
                            <div key={i} className="flex justify-between items-center text-[10px]">
                              <span className="text-brand-textSecondary capitalize truncate max-w-[80px]">{loc.name}</span>
                              <span className="text-white font-bold bg-white/5 px-1.5 py-0.5 rounded-full">{loc.count}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-brand-textSecondary text-[10px] italic">Unknown</p>
                        )}
                     </div>
                  </div>
               </div>
            </section>

            {/* Middle Section - Emotion & Top Pain Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Emotion Breakdown */}
                <section className="apple-card p-6">
                   <h2 className="text-white font-bold text-2xl mb-6">Emotion Breakdown</h2>
                   <EmotionDonut data={emotionCounts} />
                </section>

                {/* Top Pain Points */}
                <section className="apple-card p-6">
                   <h2 className="text-white font-bold text-2xl mb-6">Top Pain Points</h2>
                   {painPointEntries.length > 0 ? (
                      <div className="flex flex-col gap-4">
                         {painPointEntries.map(([category, data], idx) => (
                            <PainPointRow key={category} category={category} data={data} index={idx} />
                         ))}
                      </div>
                   ) : (
                      <div className="h-full flex items-center justify-center text-brand-textSecondary italic pb-12">
                         No major pain points detected.
                      </div>
                   )}
                </section>
            </div>

            {/* Bottom Section - Action Tickets */}
            <section>
               <h2 className="text-white font-bold text-2xl mb-6 flex items-center gap-3">
                  Auto-Generated Action Tickets
                  <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-1 rounded tracking-wide uppercase font-bold">Jira Integration</span>
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tickets.map((ticket, idx) => (
                     <TicketCard key={ticket.id || idx} ticket={ticket} />
                  ))}
               </div>
               {tickets.length === 0 && (
                   <p className="text-brand-textSecondary mt-4">No critical tickets require immediate action.</p>
               )}
            </section>
            
        </div>

        {/* Right Column - AI Reply Suggestions */}
        <div className="lg:col-span-4">
           <div className="sticky top-24 apple-card p-8">
              <div className="mb-6">
                 <h2 className="text-white font-bold text-2xl">AI Reply Suggestions</h2>
                 <p className="text-brand-textSecondary text-xs mt-1 font-mono">Generated by Groq · llama3-8b-8192</p>
              </div>
              
              <div className="flex flex-col gap-5">
                 {replies && replies.length > 0 ? (
                    replies.map((reply, idx) => (
                       <ReplyCard key={idx} reply={reply} index={idx} />
                    ))
                 ) : (
                    <p className="text-brand-textSecondary text-sm">Failed to generate replies.</p>
                 )}
              </div>
           </div>
        </div>

      </div>

      {/* Individual Reviews Table */}
      <section className="apple-card overflow-hidden mt-12">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <h2 className="text-white font-bold text-2xl">Individual Review Analysis</h2>
           
           <div className="flex flex-wrap items-center gap-3">
              {/* Search Box */}
              <div className="relative group">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-textSecondary group-focus-within:text-brand-primary transition-colors" />
                 <input 
                   type="text"
                   placeholder="Search reviews..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-brand-primary/50 focus:bg-white/10 transition-all min-w-[200px]"
                 />
              </div>

              {/* Sentiment Filter */}
              <select 
                 value={sentimentFilter}
                 onChange={(e) => setSentimentFilter(e.target.value)}
                 className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-primary/50 cursor-pointer"
              >
                 <option value="all" className="bg-brand-dark">All Sentiments</option>
                 <option value="positive" className="bg-brand-dark">Positive</option>
                 <option value="negative" className="bg-brand-dark">Negative</option>
                 <option value="neutral" className="bg-brand-dark">Neutral</option>
              </select>

              {/* Language Filter */}
              <select 
                 value={languageFilter}
                 onChange={(e) => setLanguageFilter(e.target.value)}
                 className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-primary/50 cursor-pointer"
              >
                 <option value="all" className="bg-brand-dark">All Languages</option>
                 <option value="english" className="bg-brand-dark">English</option>
                 <option value="hindi" className="bg-brand-dark">Hindi</option>
                 <option value="hinglish" className="bg-brand-dark">Hinglish</option>
                 <option value="emoji" className="bg-brand-dark">Emoji</option>
              </select>

              {/* Bot Filter */}
              <select 
                 value={botFilter}
                 onChange={(e) => setBotFilter(e.target.value)}
                 className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-primary/50 cursor-pointer"
              >
                 <option value="all" className="bg-brand-dark">All Authenticity</option>
                 <option value="verified" className="bg-brand-dark">Verified Only</option>
                 <option value="bot" className="bg-brand-dark">Suspected Bots</option>
              </select>

              {/* Reset Button */}
              {(searchTerm || sentimentFilter !== 'all' || languageFilter !== 'all' || botFilter !== 'all') && (
                 <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSentimentFilter('all');
                    setLanguageFilter('all');
                    setBotFilter('all');
                  }}
                  className="p-2 text-brand-textSecondary hover:text-white transition-colors"
                  title="Reset Filters"
                 >
                    <X size={16} />
                 </button>
              )}
           </div>
        </div>
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 z-20">
              <tr className="bg-[#2C2C2E] border-b border-white/10 text-brand-textSecondary text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold bg-[#2C2C2E]">Review</th>
                <th className="px-6 py-4 font-semibold text-center whitespace-nowrap bg-[#2C2C2E]">Location</th>
                <th className="px-6 py-4 font-semibold text-center whitespace-nowrap bg-[#2C2C2E]">Sentiment</th>
                <th className="px-6 py-4 font-semibold text-center whitespace-nowrap bg-[#2C2C2E]">Authenticity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {filteredReviews.length > 0 ? (
                  filteredReviews.map((review, idx) => {
                    return (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white text-sm">
                          <div className="flex items-center gap-2">
                            <div className="max-w-md truncate" title={review.text}>
                                {review.text}
                            </div>
                            {review.language && review.language !== 'english' && (
                                <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                  {review.language}
                                </span>
                            )}
                          </div>
                          {review.images && review.images.length > 0 && (
                              <div className="mt-3 flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
                                {review.images.map((imgSrc, imgIdx) => (
                                    <img key={imgIdx} src={imgSrc} alt="Review attachment" className="h-16 w-16 object-cover rounded-lg border border-white/10 shadow-sm" />
                                ))}
                              </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-brand-textSecondary text-sm capitalize">{review.location || 'unknown'}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                            review.sentiment === 'positive' ? 'bg-brand-success/20 text-brand-success border border-brand-success/30' : 
                            review.sentiment === 'negative' ? 'bg-brand-error/20 text-brand-error border border-brand-error/30' : 
                            'bg-white/5 text-brand-textSecondary border border-white/10'
                          }`}>
                            {review.sentiment}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            {review.isBot ? (
                              <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 text-[9px] font-bold uppercase border border-orange-500/30 animate-pulse">
                                Suspected Bot
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-brand-success/10 text-brand-success/60 text-[9px] font-bold uppercase border border-brand-success/20">
                                Verified content
                              </span>
                            )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                       <div className="flex flex-col items-center gap-3">
                          <div className="p-4 rounded-full bg-white/5 text-brand-textSecondary">
                             <Search size={32} />
                          </div>
                          <p className="text-brand-textSecondary font-medium">No reviews match your filters.</p>
                          <button 
                            onClick={() => {
                               setSearchTerm('');
                               setSentimentFilter('all');
                               setLanguageFilter('all');
                               setBotFilter('all');
                            }}
                            className="text-brand-primary text-sm hover:underline"
                          >
                             Clear all filters
                          </button>
                       </div>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </section>

    </motion.div>
    </div>
    </div>
  );
};
