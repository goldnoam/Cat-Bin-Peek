
import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

interface HUDProps {
  score: number;
  timeRemaining: number;
  level: number;
  lives: number;
  isMuted: boolean;
  isFrenzy: boolean;
  isSlowMotion: boolean;
  isFrozen: boolean;
  onPause: () => void;
  onToggleMute: () => void;
}

const HUD: React.FC<HUDProps> = ({ 
  score, 
  timeRemaining, 
  level, 
  lives,
  isMuted, 
  isFrenzy, 
  isSlowMotion, 
  isFrozen, 
  onPause, 
  onToggleMute 
}) => {
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
    <div className="fixed top-0 left-0 w-full p-4 flex flex-col gap-2 z-50">
      <div className="w-full flex justify-between items-center bg-gray-900/90 backdrop-blur-md border-b border-gray-700 shadow-2xl p-3 rounded-2xl">
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleMute}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-all text-gray-300 hover:text-white border border-gray-700 shadow-sm active:scale-90"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button 
            onClick={toggleFullscreen}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-all text-gray-300 hover:text-white border border-gray-700 shadow-sm active:scale-90"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          <div className="flex flex-col ml-1">
            <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Lives</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`text-sm ${i < lives ? 'opacity-100' : 'opacity-20'}`}>❤️</span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Remaining</span>
          <span className={`text-2xl md:text-4xl font-black tabular-nums leading-none ${timeRemaining <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {timeRemaining}s
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right mr-2">
            <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Score</span>
            <span className="text-xl md:text-2xl font-black text-yellow-400 leading-none">{score}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Level</span>
            <span className="text-xl md:text-2xl font-black text-blue-400 leading-none">{level}</span>
          </div>
          <button 
            onClick={onPause}
            className="p-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg active:scale-90 border border-blue-400/30"
          >
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-white rounded-full"></div>
              <div className="w-1 h-4 bg-white rounded-full"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Active Power-up Badges */}
      <div className="flex gap-2 justify-center">
        {isFrenzy && (
          <div className="bg-orange-600 text-white text-xs font-black px-3 py-1 rounded-full animate-bounce shadow-lg flex items-center gap-1 border border-orange-400">
            <span>🔥</span> Multiplier X2
          </div>
        )}
        {isSlowMotion && (
          <div className="bg-cyan-600 text-white text-xs font-black px-3 py-1 rounded-full animate-pulse shadow-lg flex items-center gap-1 border border-cyan-400">
            <span>❄️</span> Slow Mo
          </div>
        )}
        {isFrozen && (
          <div className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full animate-pulse shadow-lg flex items-center gap-1 border border-blue-400">
            <span>🧊</span> Frozen
          </div>
        )}
      </div>
    </div>
  );
};

export default HUD;
