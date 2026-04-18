import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { AppProvider, AppContext } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LoadingOverlay } from './components/LoadingOverlay';

import { Home } from './pages/Home';
import { Upload } from './pages/Upload';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Features } from './pages/Features';
import { Plans } from './pages/Plans';
import { Solutions } from './pages/Solutions';
import { Comparison } from './pages/Comparison';
import { BackgroundVideo } from './components/BackgroundVideo';

const AppContent = () => {
  const location = useLocation();
  const { isLoading, statusMessage } = useContext(AppContext);

  const isHome = location.pathname === '/';
  const showVideoBg = ['/', '/upload', '/dashboard', '/history', '/features', '/solutions', '/plans', '/comparison'].includes(location.pathname);

  return (
    <div className={`relative flex flex-col min-h-screen overflow-x-hidden ${showVideoBg ? 'bg-background' : 'bg-brand-dark'}`}>
      
      {showVideoBg && <BackgroundVideo />}

      {/* Hide global app navbar on the landing page */}
      <div className="relative z-10 flex flex-col flex-grow w-full">
         {!isHome && <Navbar />}

         <main className="flex-grow">
            <AnimatePresence mode="wait">
               <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<Home />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/solutions" element={<Solutions />} />
                  <Route path="/comparison" element={<Comparison />} />
               </Routes>
            </AnimatePresence>
         </main>
      </div>

      <LoadingOverlay isVisible={isLoading} currentApiStatus={statusMessage} />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;
