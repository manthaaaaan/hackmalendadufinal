import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronUp, Bot, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const TicketCard = ({ ticket }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-[#2C2C2E]/50 rounded-2xl border-l-[4px] border-l-brand-primary border-t border-b border-r border-white/5 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
    >
      <div className="flex justify-between items-start gap-4">
         <h4 className="text-white font-bold text-lg leading-tight">{ticket.title}</h4>
         <span className={`px-2 py-0.5 text-xs font-bold rounded-full whitespace-nowrap ${ticket.priorityColor}`}>
            {ticket.priority}
         </span>
      </div>
      
      <div className="flex flex-col gap-1">
         <span className="text-brand-textSecondary text-xs font-semibold uppercase tracking-wider">Suggested Action:</span>
         <span className="text-white text-sm">{ticket.action}</span>
      </div>

      <AnimatePresence>
         {isOpen && (
            <motion.div
               initial={{ height: 0, opacity: 0, marginTop: 0 }}
               animate={{ height: "auto", opacity: 1, marginTop: 12 }}
               exit={{ height: 0, opacity: 0, marginTop: 0 }}
               className="overflow-hidden flex flex-col gap-4 border-t border-white/10 pt-4"
            >
               {ticket.description && (
                  <div className="flex flex-col gap-1.5">
                     <span className="text-brand-primary text-xs font-bold uppercase flex items-center gap-1.5">
                        <Bot size={14} /> AI Issue Summary
                     </span>
                     <p className="text-brand-textSecondary text-sm leading-relaxed">
                        {ticket.description}
                     </p>
                  </div>
               )}

               {ticket.snippet && (
                  <div className="bg-brand-dark/50 p-3 rounded-lg border border-white/5 border-l-brand-error flex flex-col gap-1">
                      <span className="text-brand-textSecondary text-[10px] font-bold uppercase flex items-center gap-1">
                         <ShieldAlert size={12} /> Customer Evidence
                      </span>
                      <p className="text-white/80 text-xs italic">"{ticket.snippet}"</p>
                  </div>
               )}

               {ticket.solutionDetails && (
                  <div className="flex flex-col gap-1.5">
                     <span className="text-brand-success text-xs font-bold uppercase flex items-center gap-1.5">
                        <CheckCircle2 size={14} /> Proposed Solution Details
                     </span>
                     <p className="text-brand-textSecondary text-sm leading-relaxed">
                        {ticket.solutionDetails}
                     </p>
                  </div>
               )}
            </motion.div>
         )}
      </AnimatePresence>

      <div className="mt-2 text-right">
         <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-brand-primary text-sm font-semibold hover:text-indigo-400 transition-colors inline-flex items-center gap-1 z-10 relative cursor-pointer"
         >
            {isOpen ? (
               <>Close Ticket <ChevronUp size={16} /></>
            ) : (
               <>Open Ticket <ArrowRight size={16} /></>
            )}
         </button>
      </div>
    </motion.div>
  );
};
