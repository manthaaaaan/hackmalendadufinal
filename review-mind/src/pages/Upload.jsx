import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { AppContext } from '../context/AppContext';
import { runAnalysisPipeline } from '../api/pipeline';

export const Upload = () => {
  const [parsedData, setParsedData] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const { setIsLoading, setStatusMessage, saveToHistory } = useContext(AppContext);
  const navigate = useNavigate();

  const handleAnalyze = async (data) => {
    setIsLoading(true);
    setStatusMessage("Initializing...");
    
    try {
      const result = await runAnalysisPipeline(data, setStatusMessage);
      saveToHistory(result);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Check console for details.");
    } finally {
      setIsLoading(false);
      setStatusMessage("");
    }
  };

  const submitCsv = () => {
     if (parsedData) {
        handleAnalyze(parsedData);
     }
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    let cleanedUrl = urlInput.trim();
    
    // Safety check: strip accidental console log copy-pastes (e.g., "client:510 Scrape failed...")
    if (cleanedUrl.toLowerCase().includes('client:')) {
       cleanedUrl = cleanedUrl.split(/\s+/).find(part => part.startsWith('http')) || cleanedUrl;
    }

    if (!cleanedUrl || !cleanedUrl.startsWith('http')) {
       alert("Please enter a valid URL starting with http:// or https://");
       return;
    }
    
    setIsLoading(true);
    setStatusMessage("Scraping URL for review text...");

    try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${API_BASE_URL}/api/scrape`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: urlInput })
        });

        if (!response.ok) {
           const errData = await response.json().catch(()=>({}));
           throw new Error(errData.error || `Scrape failed: ${response.status}`);
        }

        const data = await response.json();
        
        // Map the deep scraped objects that contain texts and nested images
        const mappedData = data.reviews.map(r => ({ text: r.text, images: r.images }));
        
        // Stash the extracted global assets so pipeline.js can locate them
        if (mappedData.length > 0) {
            if (data.productImage) mappedData[0].productImage = data.productImage;
            if (data.productName) mappedData[0].product_name = data.productName;
        }
        
        // Pass the scraped array to the same analyze flow as the CSV
        handleAnalyze(mappedData);
    } catch (err) {
        console.error("Scraping failed:", err);
        alert(err.message || "Failed to scrape URL. Check console.");
        setIsLoading(false);
        setStatusMessage("");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6"
    >
      <div className="text-center mb-12">
         <h1 className="text-white text-5xl font-extrabold tracking-tight mb-4 pointer-events-none">
            ReviewMind
         </h1>
         <p className="text-brand-textSecondary text-xl font-medium tracking-wide pointer-events-none">
            Turn reviews into decisions
         </p>
      </div>

      <div className="w-full max-w-2xl space-y-8">
         <div className="apple-card p-8">
            <h3 className="text-white font-bold text-lg mb-6 text-center">INPUT OPTION A</h3>
            <DropZone onDataParsed={(data) => setParsedData(data)} />
            
            {parsedData && (
              <div className="mt-6 flex justify-center">
                 <button 
                   onClick={submitCsv}
                   className="bg-brand-primary hover:bg-indigo-600 text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-brand-primary/25"
                 >
                    Analyze Reviews
                 </button>
              </div>
            )}
         </div>

         <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-brand-border/50"></div>
            <span className="flex-shrink-0 mx-4 text-brand-textSecondary text-sm font-semibold uppercase tracking-wider">— or —</span>
            <div className="flex-grow border-t border-brand-border/50"></div>
         </div>

         <div className="apple-card p-8">
             <h3 className="text-white font-bold text-lg mb-6 text-center">INPUT OPTION B</h3>
             <form onSubmit={handleUrlSubmit} className="relative">
                <input
                  type="url"
                  placeholder="Paste a product review URL (Demo Note: Requires CORS proxy)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-brand-dark text-white border-2 border-brand-border focus:border-brand-primary outline-none px-6 py-4 rounded-full transition-colors placeholder:text-brand-textSecondary/50"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 aspect-square bg-brand-primary hover:bg-indigo-600 rounded-full flex items-center justify-center transition-colors shadow-md shadow-brand-primary/20 text-white"
                >
                   <ArrowRight size={20} />
                </button>
             </form>
         </div>
      </div>
    </motion.div>
  );
};
