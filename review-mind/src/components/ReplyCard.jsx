import React, { useState } from 'react';
import { motion } from 'framer-motion';

const getToneBadgeColor = (tone) => {
  const t = tone.toLowerCase();
  if (t === 'empathetic') return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
  if (t === 'professional') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  return 'bg-gray-500/20 text-gray-400 border-gray-500/30'; // concise/other
};

export const ReplyCard = ({ reply, index }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reply.reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-[#2C2C2E]/60 rounded-2xl p-5 border border-white/5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div>
         <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${getToneBadgeColor(reply.tone)}`}>
            {reply.tone}
         </span>
      </div>
      
      <p className="text-white text-sm leading-relaxed">
         {reply.reply}
      </p>

      <div className="mt-auto pt-2">
         <button 
           onClick={handleCopy}
           className="px-4 py-1.5 rounded-full border border-brand-primary text-brand-primary text-sm font-semibold hover:bg-brand-primary/10 transition-colors"
         >
            {copied ? '✓ Copied!' : 'Copy Reply'}
         </button>
      </div>
    </motion.div>
  );
};
