import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export const MetricRow = ({ name, score, trend }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000; // 1s count up
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(easeOut * score));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [score]);

  return (
    <div className="bg-[#2C2C2E]/60 rounded-2xl px-6 py-4 flex items-center justify-between shadow-xs border border-white/5">
      <div className="text-white font-medium">{name}</div>
      <div className="text-brand-primary text-xl font-bold">{displayScore}</div>
      <div className="flex items-center space-x-1 min-w-[60px] justify-end">
         {trend.text === 'NEW' ? (
             <span className="bg-brand-primary/20 text-brand-primary text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider">NEW</span>
         ) : (
             <>
                <span className={cn(trend.color)}>{trend.symbol}</span>
                <span className={cn("text-sm font-semibold", trend.color)}>{trend.text}</span>
             </>
         )}
      </div>
    </div>
  );
};
