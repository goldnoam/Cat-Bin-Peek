
import React, { useState, useEffect } from 'react';

interface HUDProps {
  score: number;
  timeRemaining: number;
  level: number;
  isMuted: boolean;
  onPause: () => void;
  onToggleMute: () => void;
}

const HUD: React.FC<HUDProps> = ({ score, timeRemaining, level, isMuted, onPause, onToggleMute }) => {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full p-4 flex justify-between items-center z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-700 shadow-2xl">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleMute}
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-all text-gray-300 hover:text-white border border-gray-700 shadow-sm active:scale-90"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          )}
        </button>

        <button 
          onClick={toggleFullscreen}
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-all text-gray-300 hover:text-white border border-gray-700 shadow-sm active:scale-90"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
          )}
        </button>

        <div className="flex flex-col ml-1">
          <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Score</span>
          <span className="text-xl md:text-2xl font-black text-yellow-400 tabular-nums leading-none">{score}</span>
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Remaining</span>
        <span className={`text-2xl md:text-4xl font-black tabular-nums leading-none ${timeRemaining <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
          {timeRemaining}s
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col text-right">
          <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Level</span>
          <span className="text-xl md:text-2xl font-black text-blue-400 leading-none">{level}</span>
        </div>
        <button 
          onClick={onPause}
          className="p-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg active:scale-90 border border-blue-400/30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/></svg>
        </button>
      </div>
    </div>
  );
};

export default HUD;
