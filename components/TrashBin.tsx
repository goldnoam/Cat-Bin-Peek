
import React, { useMemo, useState, useEffect } from 'react';
import { CatType } from '../types';

interface TrashBinProps {
  id: number;
  isOpen: boolean;
  hasCat: boolean;
  catType: CatType;
  spawnTime: number;
  hitsRemaining: number;
  isSlowMotion: boolean;
  onClick: () => void;
}

const TrashBin: React.FC<TrashBinProps> = ({ id, isOpen, hasCat, catType, spawnTime, hitsRemaining, isSlowMotion, onClick }) => {
  const seed = useMemo(() => id + spawnTime, [id, spawnTime]);
  const [isVisuallyExiting, setIsVisuallyExiting] = useState(false);

  useEffect(() => {
    if (!isOpen && hasCat) {
      setIsVisuallyExiting(true);
      const timer = setTimeout(() => {
        setIsVisuallyExiting(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasCat]);

  const catVisuals = useMemo(() => {
    const normalVariants = ['🐱', '🐈', '🐈‍⬛', '😻', '😸', '😼', '😺', '🐾', '🦁', '🐯'];
    const grumpyVariants = ['😾', '😿', '🙀', '👹'];
    const sleepyVariants = ['😽', '😴', '🥱', '💤'];
    const playfulVariants = ['😺', '😻', '😹', '🌈'];
    const speedyVariants = ['🐈‍💨', '🐆', '⚡', '🛸'];
    const stickyVariants = ['🐸', '🍯', '🕸️', '🧟'];
    
    const foodAccessories = ['🐟', '🥛', '🍪', '🍗', '🥨'];
    const toyAccessories = ['🧶', '🐭', '🦋', '⚽', '🎈', '🎀'];
    const rareAccessories = ['💎', '🎩', '🕶️', '🍀'];
    const allRandomAccessories = [...foodAccessories, ...toyAccessories, '🦴'];

    const getVariant = (arr: string[]) => arr[seed % arr.length];

    let base = {
      emoji: getVariant(normalVariants),
      accessory: seed % 2 === 0 ? getVariant(allRandomAccessories) : null,
      extraAccessory: seed % 10 === 0 ? '✨' : null,
      aura: '',
      animation: 'animate-float [animation-duration:3s]',
      entryAnimation: 'animate-in zoom-in slide-in-from-bottom-5',
      exitAnimation: 'animate-exit-sink',
      glow: 'transparent'
    };

    switch (catType) {
      case 'speedy':
        base = { ...base,
          emoji: getVariant(speedyVariants),
          accessory: '💨',
          aura: 'bg-cyan-400/40',
          animation: 'animate-sprint',
          entryAnimation: 'animate-pop-speedy',
          exitAnimation: 'animate-exit-dash',
          glow: 'rgba(34,211,238,1)'
        };
        break;
      case 'sticky':
        base = { ...base,
          emoji: '🧟',
          aura: 'bg-green-600/40',
          animation: 'animate-float [animation-duration:5s]',
          entryAnimation: 'animate-pop-sticky',
          exitAnimation: 'animate-exit-sink',
          glow: 'rgba(34,197,94,1)'
        };
        break;
      case 'grumpy':
        base = { ...base,
          emoji: getVariant(grumpyVariants),
          accessory: '💢',
          aura: 'bg-red-600/30',
          animation: 'animate-wiggle',
          entryAnimation: 'animate-bounce',
          exitAnimation: 'animate-exit-sink',
          glow: 'rgba(220,38,38,0.9)'
        };
        break;
      case 'sleepy':
        base = { ...base,
          emoji: getVariant(sleepyVariants),
          accessory: '💤',
          aura: 'bg-blue-400/20',
          animation: 'opacity-80',
          entryAnimation: 'animate-in fade-in duration-1000',
          exitAnimation: 'animate-exit-fade-slow',
          glow: 'rgba(59,130,246,0.6)'
        };
        break;
      case 'playful':
        base = { ...base,
          emoji: getVariant(playfulVariants),
          aura: 'bg-green-400/20',
          animation: 'animate-bounce [animation-duration:1s]',
          exitAnimation: 'animate-exit-sink',
          glow: 'rgba(34,197,94,0.6)'
        };
        break;
      case 'ninja':
        base = { ...base,
          emoji: '🐈‍⬛',
          accessory: '🥷',
          aura: 'bg-gray-500/40',
          animation: 'grayscale brightness-[0.05]',
          entryAnimation: 'animate-pop-ninja',
          exitAnimation: 'animate-exit-teleport',
          glow: 'rgba(0,0,0,1)'
        };
        break;
      case 'golden':
        base = { ...base,
          emoji: '🐱',
          accessory: '👑',
          aura: 'bg-gradient-conic from-yellow-500/0 via-yellow-200/70 to-yellow-500/0',
          animation: 'animate-float',
          entryAnimation: 'animate-bounce',
          exitAnimation: 'animate-exit-teleport',
          glow: 'rgba(255,215,0,1)'
        };
        break;
    }
    return base;
  }, [catType, seed]);

  const renderOccupant = () => {
    const shouldShow = (isOpen && hasCat) || isVisuallyExiting;
    if (!shouldShow) return null;

    if (catType.startsWith('powerup_')) {
      const pUpClass = "animate-in zoom-in fade-in duration-300";
      return (
        <div className={`relative flex items-center justify-center ${pUpClass} ${!isOpen ? 'animate-out zoom-out fade-out' : ''}`}>
           {catType === 'powerup_broom' && (
             <div className="relative">
                <div className="absolute inset-0 bg-blue-500/40 blur-3xl rounded-full animate-burst"></div>
                <span className="text-7xl md:text-9xl drop-shadow-[0_0_25px_rgba(59,130,246,1)] transform -rotate-12 inline-block animate-float">🧹</span>
             </div>
           )}
           {catType === 'powerup_clock' && (
             <div className="relative scale-110">
                <div className="absolute inset-0 bg-emerald-500/40 blur-3xl rounded-full animate-burst"></div>
                <div className="absolute inset-0 border-4 border-dashed border-emerald-400/50 rounded-full animate-spin-slow"></div>
                <span className="text-6xl md:text-8xl drop-shadow-[0_0_20px_rgba(16,185,129,1)] animate-bounce">⏰</span>
             </div>
           )}
           {catType === 'powerup_slow' && (
             <div className="relative">
                <div className="absolute inset-0 bg-cyan-300/50 blur-3xl rounded-full animate-burst"></div>
                <span className="text-6xl md:text-8xl drop-shadow-[0_0_15px_rgba(103,232,249,1)] animate-float">❄️</span>
             </div>
           )}
           {catType === 'powerup_frenzy' && (
             <div className="relative">
                <div className="absolute inset-0 bg-red-600/60 blur-[40px] rounded-full animate-ping scale-150"></div>
                <span className="text-8xl md:text-[10rem] drop-shadow-[0_0_40px_rgba(239,68,68,1)] animate-bounce">🔥</span>
             </div>
           )}
           {catType === 'powerup_freeze' && (
             <div className="relative">
                <div className="absolute inset-0 bg-blue-300/50 blur-3xl rounded-full animate-burst"></div>
                <span className="text-7xl md:text-9xl drop-shadow-[0_0_25px_rgba(37,99,235,1)] animate-float">🧊</span>
             </div>
           )}
           {catType === 'powerup_repellent' && (
             <div className="relative">
                <div className="absolute inset-0 bg-purple-500/40 blur-3xl rounded-full animate-burst"></div>
                <span className="text-7xl md:text-9xl drop-shadow-[0_0_25px_rgba(147,51,234,1)] animate-bounce">🧴</span>
             </div>
           )}
        </div>
      );
    }

    return (
      <div className={`relative flex items-center justify-center ${catType === 'golden' ? 'scale-125' : 'scale-110'} ${isOpen ? catVisuals.entryAnimation : catVisuals.exitAnimation}`}>
        {catVisuals.aura && (
          <div className={`absolute inset-0 ${catVisuals.aura} blur-2xl rounded-full ${catType === 'golden' || catType === 'speedy' ? 'animate-spin-slow' : 'animate-pulse'}`}></div>
        )}
        {isSlowMotion && (
          <div className="absolute inset-0 bg-cyan-300/40 blur-3xl rounded-full animate-pulse z-0"></div>
        )}
        
        <div className={`relative flex flex-col items-center ${catVisuals.animation} ${isSlowMotion ? 'brightness-125' : ''}`}>
           {catType === 'speedy' && (
             <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <span className="absolute text-5xl opacity-30 animate-trail">💨</span>
             </div>
           )}
           <span className={`text-4xl md:text-6xl drop-shadow-[0_0_20px_${catVisuals.glow}]`}>
             {catVisuals.emoji}
           </span>
           {catType === 'sticky' && hitsRemaining > 1 && (
             <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-bounce">
               צריך 2!
             </div>
           )}
           {catVisuals.accessory && (
             <span className={`absolute ${catType === 'sleepy' ? '-top-6 -right-4' : '-top-4 -right-4'} text-3xl drop-shadow-md`}>
               {catVisuals.accessory}
             </span>
           )}
           {catType === 'ninja' && (
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-20 h-20 bg-gray-500/40 rounded-full animate-smoke pointer-events-none"></div>
             </div>
           )}
        </div>
      </div>
    );
  };

  return (
    <div 
      onClick={onClick}
      className={`relative w-24 h-24 md:w-32 md:h-32 cursor-pointer transition-transform active:scale-90 flex items-end justify-center group`}
    >
      <div className={`absolute bottom-0 w-full h-3/4 bg-slate-500 rounded-b-2xl border-b-[10px] border-slate-700 shadow-2xl z-20 overflow-hidden ${catType === 'sticky' && isOpen ? 'ring-4 ring-green-500 ring-inset animate-pulse' : ''} ${isOpen && hasCat ? 'animate-spin-very-slow' : ''}`}>
        <div className="w-full h-full bg-gradient-to-t from-slate-600 to-transparent opacity-70" />
        <div className="flex justify-around w-full px-4 mt-6 opacity-40">
          <div className="w-2 h-16 bg-slate-900 rounded-full shadow-inner"></div>
          <div className="w-2 h-16 bg-slate-900 rounded-full shadow-inner"></div>
          <div className="w-2 h-16 bg-slate-900 rounded-full shadow-inner"></div>
        </div>
      </div>

      <div className={`absolute bottom-6 w-full h-full z-10 flex items-center justify-center`}>
        {renderOccupant()}
      </div>

      <div 
        className={`absolute top-0 w-full h-1/4 bg-slate-400 rounded-t-3xl border-t-4 border-slate-200 shadow-2xl z-30 transition-all duration-500 origin-bottom-left ${
          isOpen ? '-translate-y-20 -rotate-45 scale-110' : 'translate-y-6'
        }`}
      >
        <div className="w-12 h-4 bg-slate-600 mx-auto rounded-full mt-2 border-b-2 border-slate-800" />
      </div>
    </div>
  );
};

export default TrashBin;
