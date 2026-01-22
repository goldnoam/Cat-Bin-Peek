
import React, { useMemo } from 'react';
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

    switch (catType) {
      case 'speedy':
        return {
          emoji: getVariant(speedyVariants),
          accessory: '💨',
          extraAccessory: seed % 2 === 0 ? '⚡' : null,
          aura: 'bg-cyan-400/40',
          animation: 'animate-sprint',
          entryAnimation: 'animate-pop-speedy',
          glow: 'rgba(34,211,238,1)'
        };
      case 'sticky':
        return {
          emoji: '🧟',
          accessory: '🕸️',
          extraAccessory: '🍯',
          aura: 'bg-green-600/40',
          animation: 'animate-float [animation-duration:5s]',
          entryAnimation: 'animate-pop-sticky',
          glow: 'rgba(34,197,94,1)'
        };
      case 'grumpy':
        return {
          emoji: getVariant(grumpyVariants),
          accessory: '💢',
          extraAccessory: seed % 4 === 0 ? '🦴' : null,
          aura: 'bg-red-600/30',
          animation: 'animate-wiggle',
          entryAnimation: 'animate-bounce',
          glow: 'rgba(220,38,38,0.9)'
        };
      case 'sleepy':
        return {
          emoji: getVariant(sleepyVariants),
          accessory: '💤',
          extraAccessory: seed % 3 === 0 ? '🥛' : null,
          aura: 'bg-blue-400/20',
          animation: 'opacity-80',
          entryAnimation: '',
          glow: 'rgba(59,130,246,0.6)'
        };
      case 'playful':
        return {
          emoji: getVariant(playfulVariants),
          accessory: getVariant(toyAccessories),
          extraAccessory: seed % 2 === 0 ? getVariant(foodAccessories) : '🌈',
          aura: 'bg-green-400/20',
          animation: 'animate-bounce [animation-duration:1s]',
          entryAnimation: '',
          glow: 'rgba(34,197,94,0.6)'
        };
      case 'ninja':
        return {
          emoji: '🐈‍⬛',
          accessory: '🥷',
          extraAccessory: seed % 5 === 0 ? '🌑' : null,
          aura: 'bg-gray-500/40',
          animation: 'grayscale brightness-[0.05]',
          entryAnimation: 'animate-pop-ninja',
          glow: 'rgba(0,0,0,1)'
        };
      case 'golden':
        return {
          emoji: '🐱',
          accessory: '👑',
          extraAccessory: getVariant(rareAccessories),
          aura: 'bg-gradient-conic from-yellow-500/0 via-yellow-200/70 to-yellow-500/0',
          animation: 'animate-float',
          entryAnimation: 'animate-bounce',
          glow: 'rgba(255,215,0,1)'
        };
      default:
        return {
          emoji: getVariant(normalVariants),
          accessory: seed % 2 === 0 ? getVariant(allRandomAccessories) : null,
          extraAccessory: seed % 10 === 0 ? '✨' : null,
          aura: '',
          animation: 'animate-float [animation-duration:3s]',
          entryAnimation: '',
          glow: 'transparent'
        };
    }
  }, [catType, seed]);

  const renderOccupant = () => {
    if (!hasCat) return null;

    if (catType.startsWith('powerup_')) {
      const pUpClass = "animate-in zoom-in fade-in duration-300";
      switch (catType) {
        case 'powerup_broom':
          return (
            <div className={`relative flex flex-col items-center ${pUpClass}`}>
               <div className="absolute inset-0 bg-blue-500/40 blur-3xl rounded-full animate-burst"></div>
               <div className="relative animate-float">
                  <span className="text-7xl md:text-9xl drop-shadow-[0_0_25px_rgba(59,130,246,1)] transform -rotate-12 inline-block">🧹</span>
                  <span className="absolute top-0 right-0 text-3xl animate-ping">⚡</span>
               </div>
            </div>
          );
        case 'powerup_clock':
          return (
            <div className={`relative flex items-center justify-center scale-110 ${pUpClass}`}>
              <div className="absolute inset-0 bg-emerald-500/40 blur-3xl rounded-full animate-burst"></div>
              <div className="absolute inset-0 border-4 border-dashed border-emerald-400/50 rounded-full animate-spin-slow"></div>
              <span className="text-6xl md:text-8xl drop-shadow-[0_0_20px_rgba(16,185,129,1)] animate-bounce">⏰</span>
            </div>
          );
        case 'powerup_slow':
          return (
            <div className={`relative flex items-center justify-center ${pUpClass}`}>
              <div className="absolute inset-0 bg-cyan-300/50 blur-3xl rounded-full animate-burst"></div>
              <div className="relative flex items-center justify-center animate-float">
                 <span className="text-6xl md:text-8xl drop-shadow-[0_0_15px_rgba(103,232,249,1)]">❄️</span>
                 <span className="absolute -bottom-2 -right-2 text-3xl animate-pulse">🧊</span>
              </div>
            </div>
          );
        case 'powerup_frenzy':
          return (
            <div className={`relative flex items-center justify-center ${pUpClass}`}>
              <div className="absolute inset-0 bg-red-600/60 blur-[40px] rounded-full animate-ping scale-150"></div>
              <div className="absolute inset-0 bg-orange-500/30 blur-3xl rounded-full animate-burst"></div>
              <div className="relative flex items-center animate-bounce [animation-duration:0.6s]">
                <span className="text-8xl md:text-[10rem] drop-shadow-[0_0_40px_rgba(239,68,68,1)]">🔥</span>
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-black text-white italic drop-shadow-[0_4px_0_rgba(0,0,0,1)] uppercase">X2</span>
              </div>
            </div>
          );
        default: return null;
      }
    }

    return (
      <div className={`relative flex items-center justify-center ${catType === 'golden' ? 'scale-125' : 'scale-110'} ${catVisuals.entryAnimation}`}>
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
                <span className="absolute text-5xl opacity-20 animate-trail" style={{ animationDelay: '0.1s' }}>💨</span>
             </div>
           )}

           {catType === 'golden' && (
             <div className="absolute inset-0 border-2 border-yellow-300/60 rounded-full animate-ping scale-150"></div>
           )}
           
           <span className={`text-4xl md:text-6xl drop-shadow-[0_0_20px_${catVisuals.glow}]`}>
             {catVisuals.emoji}
           </span>

           {catType === 'sticky' && hitsRemaining > 1 && (
             <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-bounce">
               צריך 2 לחיצות!
             </div>
           )}

           {catVisuals.accessory && (
             <span className={`absolute ${catType === 'sleepy' ? '-top-6 -right-4' : '-top-4 -right-4'} text-3xl drop-shadow-md`}>
               {catVisuals.accessory}
             </span>
           )}

           {catVisuals.extraAccessory && (
             <span className="absolute -bottom-2 -left-4 text-2xl drop-shadow-md animate-pulse">
               {catVisuals.extraAccessory}
             </span>
           )}

           {catType === 'speedy' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <span className="absolute -left-10 text-3xl animate-ping opacity-40">⚡</span>
                 <span className="absolute -right-10 text-3xl animate-ping opacity-40" style={{ animationDelay: '0.05s' }}>⚡</span>
              </div>
           )}
           {catType === 'golden' && (
             <div className="absolute inset-0 pointer-events-none">
               <span className="absolute -top-4 -left-4 text-2xl animate-sparkle [animation-delay:0s]">✨</span>
               <span className="absolute -bottom-4 -right-4 text-2xl animate-sparkle [animation-delay:0.7s]">✨</span>
             </div>
           )}
           {catType === 'ninja' && (
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-20 h-20 bg-gray-500/40 rounded-full animate-smoke pointer-events-none"></div>
             </div>
           )}
           
           {isSlowMotion && (
             <div className="absolute inset-0 pointer-events-none">
                <span className="absolute -top-2 -left-2 text-xs animate-spin-slow opacity-60">❄️</span>
                <span className="absolute -bottom-2 -right-2 text-xs animate-spin-slow opacity-60" style={{ animationDelay: '1s' }}>❄️</span>
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
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4/5 h-2 bg-slate-800/50 rounded-full" />
        <div className="flex justify-around w-full px-4 mt-6 opacity-40">
          <div className="w-2 h-16 bg-slate-900 rounded-full shadow-inner"></div>
          <div className="w-2 h-16 bg-slate-900 rounded-full shadow-inner"></div>
          <div className="w-2 h-16 bg-slate-900 rounded-full shadow-inner"></div>
        </div>
      </div>

      <div 
        className={`absolute bottom-6 w-full h-full transition-all duration-500 pop-out z-10 flex items-center justify-center ${
          isOpen && hasCat ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        {renderOccupant()}
      </div>

      <div 
        className={`absolute top-0 w-full h-1/4 bg-slate-400 rounded-t-3xl border-t-4 border-slate-200 shadow-2xl z-30 transition-all duration-500 origin-bottom-left ${
          isOpen ? '-translate-y-20 -rotate-45 scale-110' : 'translate-y-6'
        }`}
      >
        <div className="w-12 h-4 bg-slate-600 mx-auto rounded-full mt-2 border-b-2 border-slate-800 group-hover:bg-slate-500 transition-colors" />
      </div>
    </div>
  );
};

export default TrashBin;
