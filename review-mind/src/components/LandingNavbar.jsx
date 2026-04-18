import React from 'react';
import { ChevronDown, BrainCircuit } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

export const LandingNavbar = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col">
      <nav className="w-full py-5 px-8 flex flex-row items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          {/* Simulated Logo since logo.png doesn't exist */}
          <div className="bg-primary/20 p-2.5 rounded-xl">
             <BrainCircuit className="w-6 h-6 text-primary" />
          </div>
          <span className="text-white font-extrabold text-3xl tracking-tight">ReviewMind</span>
        </div>

        {/* Center: Nav Items */}
        <div className="hidden md:flex flex-row items-center gap-2">
          <button 
             onClick={() => navigate('/features')}
             className="flex items-center gap-1 text-foreground/90 text-lg font-medium hover:text-white px-4 py-2 transition-colors"
          >
             Features
          </button>
          <button 
             onClick={() => navigate('/solutions')}
             className="text-foreground/90 text-lg font-medium hover:text-white px-4 py-2 transition-colors"
          >
            Solutions
          </button>
          <button 
             onClick={() => navigate('/plans')}
             className="text-foreground/90 text-lg font-medium hover:text-white px-4 py-2 transition-colors"
          >
            Plans
          </button>
          <button className="flex items-center gap-1 text-foreground/90 text-lg font-medium hover:text-white px-4 py-2 transition-colors">
            Learning <ChevronDown className="w-5 h-5 opacity-70" />
          </button>
        </div>

        {/* Right: CTA */}
        <div>
          <Button 
             variant="heroSecondary" 
             className="px-4 py-2 text-sm !h-auto"
             onClick={() => navigate('/upload')}
          >
            Launch App
          </Button>
        </div>
      </nav>

      {/* Gradient Divider */}
      <div className="mt-[3px] w-full h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
    </div>
  );
};
