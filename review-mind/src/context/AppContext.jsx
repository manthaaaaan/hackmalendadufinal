import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('reviewMindHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading history from localStorage", e);
      }
    }
  }, []);

  const saveToHistory = (analysisResult) => {
    const newHistory = [analysisResult, ...history];
    setHistory(newHistory);
    localStorage.setItem('reviewMindHistory', JSON.stringify(newHistory));
    setCurrentAnalysis(analysisResult);
  };

  const loadFromHistory = (index) => {
      if(history[index]){
          setCurrentAnalysis(history[index]);
      }
  }

  return (
    <AppContext.Provider value={{
      history,
      currentAnalysis,
      setCurrentAnalysis,
      saveToHistory,
      loadFromHistory,
      isLoading,
      setIsLoading,
      statusMessage,
      setStatusMessage
    }}>
      {children}
    </AppContext.Provider>
  );
};
