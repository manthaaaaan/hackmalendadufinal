import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const CircularProgress = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const strokeWidth = 12;
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    // Count up animation
    let start = 0;
    const duration = 1500; // 1.5s
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(easeOut * score));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [score]);

  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Background track */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-[#38383A]" // subtle apple border color
          />
          {/* Animated ring */}
          <motion.circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-brand-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
            strokeLinecap="round"
          />
        </svg>
        
        {/* Inside score text */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-white text-7xl font-bold tracking-tighter">
            {displayScore}
          </span>
          <span className="text-brand-textSecondary text-xl mt-1">
            / 100
          </span>
        </div>
      </div>
      <div className="mt-6 text-white text-lg font-semibold tracking-wide">
        Brand Health Score
      </div>
    </div>
  );
};
