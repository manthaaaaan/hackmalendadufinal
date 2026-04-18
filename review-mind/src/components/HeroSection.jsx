import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingNavbar } from './LandingNavbar';
import { Button } from './ui/button';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative z-10 flex flex-col items-center w-full flex-grow">
      <LandingNavbar />
      
      <div className="flex flex-col items-center pt-20 px-4 w-full">
        <h1 
          className="text-center font-normal leading-[1.02] tracking-[-0.024em] bg-clip-text text-transparent"
          style={{
             fontSize: 'clamp(80px, 15vw, 230px)',
             backgroundImage: 'linear-gradient(223deg, #E8E8E9 0%, #3A7BBF 104.15%)',
             fontFamily: '"Geist Sans", sans-serif' // Emulating General Sans with Geist
          }}
        >
          Analyze
        </h1>
        
        <p className="text-hero-sub text-center text-lg md:text-xl leading-8 max-w-md mt-4 opacity-80">
          The most powerful AI ever deployed <br className="hidden md:block" />
          in customer review analysis
        </p>
        
        <div className="mt-8 mb-[66px]">
          <Button 
            variant="heroSecondary" 
            className="px-[29px] py-[24px]"
            onClick={() => navigate('/upload')}
          >
            Start Analyzing
          </Button>
        </div>
      </div>
    </section>
  );
};
