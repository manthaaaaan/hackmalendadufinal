import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const messages = [
  "Reading your reviews...",
  "Detecting emotions with AI...",
  "Calculating Brand Health Score...",
  "Generating action tickets...",
  "Almost ready..."
];

export const LoadingOverlay = ({ isVisible, currentApiStatus }) => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    
    // Rotate messages only if an explicit API status isn't overriding
    if (currentApiStatus) return;

    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible, currentApiStatus]);

  const displayMessage = currentApiStatus || messages[msgIndex];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-dark/95 backdrop-blur-sm"
        >
          {/* Animated Spinner Ring */}
          <div className="relative w-24 h-24 mb-8">
             <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-[4px] border-brand-border"
             />
             <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-[4px] border-transparent border-t-brand-primary"
             />
          </div>

          <motion.div
            key={displayMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-white text-xl font-medium tracking-wide"
          >
            {displayMessage}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
