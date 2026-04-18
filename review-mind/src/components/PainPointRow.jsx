import React from 'react';
import { motion } from 'framer-motion';
import { getSeverityBadge } from '../utils/scoring';

export const PainPointRow = ({ category, data, index }) => {
  const percentage = data.count > 0 ? (data.positive / data.count) * 100 : 100;
  const severity = getSeverityBadge(percentage);
  
  // Pick one negative snippet as example, if any
  const snippet = data.snippets && data.snippets.length > 0 
      ? `"${data.snippets[0].length > 100 ? data.snippets[0].substring(0, 100) + '...' : data.snippets[0]}"`
      : "No specific negative feedback provided.";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-[#2C2C2E]/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/5"
    >
      <div className="flex flex-col gap-1 flex-1">
         <span className="text-white font-semibold capitalize">
            {category} reported ({data.count} mentions)
         </span>
         <span className="text-brand-textSecondary text-sm italic">
            {snippet}
         </span>
      </div>
      <div>
         <span className={`px-3 py-1 text-xs font-bold rounded-md ${severity.colorClass}`}>
            {severity.label}
         </span>
      </div>
    </motion.div>
  );
};
