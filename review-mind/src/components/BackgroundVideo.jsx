import React, { useEffect, useRef } from 'react';

export const BackgroundVideo = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Slow down playback for a more cinematic/premium feel
    video.playbackRate = 0.5;

    let animationFrameId;

    const fadeVideo = () => {
      const { currentTime, duration } = video;
      if (!duration) {
         animationFrameId = requestAnimationFrame(fadeVideo);
         return;
      }
      
      const fadeTime = 0.5; // 0.5 seconds
      
      if (currentTime < fadeTime) {
        video.style.opacity = currentTime / fadeTime;
      } else if (duration - currentTime < fadeTime) {
        video.style.opacity = (duration - currentTime) / fadeTime;
      } else {
        video.style.opacity = 1;
      }
      
      animationFrameId = requestAnimationFrame(fadeVideo);
    };

    const handleEnded = () => {
      video.style.opacity = 0;
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(e => console.log("Video replay prevented:", e));
      }, 100);
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', () => {
        animationFrameId = requestAnimationFrame(fadeVideo);
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <video 
        ref={videoRef}
        autoPlay 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0, transition: 'none' }}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4"
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[984px] h-[527px] opacity-90 bg-gray-950 blur-[82px] pointer-events-none" />
    </div>
  );
};
