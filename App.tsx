
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, BinState, GameSettings, HighScore, CatType } from './types';
import HUD from './components/HUD';
import TrashBin from './components/TrashBin';
import AdPlaceholder from './components/AdPlaceholder';
import { getCatEncouragement } from './services/geminiService';
import { playSound } from './services/audioService';

const LEVEL_DURATION = 30;
const STORAGE_KEY = 'cat_bin_high_scores';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [settings, setSettings] = useState<GameSettings>({
    level: 1,
    score: 0,
    timeRemaining: LEVEL_DURATION,
    totalBins: 4,
    speed: 1500,
    isMuted: false
  });
  const [bins, setBins] = useState<BinState[]>([]);
  const [flavorText, setFlavorText] = useState<string>("החתולים מחכים לך...");
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [playerName, setPlayerName] = useState<string>('');
  
  const [isSlowMotion, setIsSlowMotion] = useState(false);
  const [isFrenzy, setIsFrenzy] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isRepelled, setIsRepelled] = useState(false);
  const [activeMessage, setActiveMessage] = useState<string | null>(null);

  const timerRef = useRef<any>(null);
  const spawnRef = useRef<any>(null);
  const messageTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setHighScores(JSON.parse(saved));
  }, []);

  const showPowerupMessage = (msg: string) => {
    setActiveMessage(msg);
    playSound('powerup', settings.isMuted);
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => setActiveMessage(null), 2000);
  };

  const saveHighScore = (name: string, score: number) => {
    const newScore: HighScore = { name: name || 'אנונימי', score, date: new Date().toLocaleDateString() };
    const updated = [...highScores, newScore].sort((a, b) => b.score - a.score).slice(0, 5);
    setHighScores(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const initBins = useCallback((count: number) => {
    const newBins: BinState[] = Array.from({ length: count }, (_, i) => ({
      id: i, isOpen: false, hasCat: false, catType: 'normal', spawnTime: 0, hitsRemaining: 1
    }));
    setBins(newBins);
  }, []);

  const startGame = (resetTotal = true) => {
    setIsSlowMotion(false);
    setIsFrenzy(false);
    setIsFrozen(false);
    setIsRepelled(false);
    setActiveMessage(null);
    playSound('click', settings.isMuted);
    
    if (resetTotal) {
      setSettings(prev => ({ ...prev, level: 1, score: 0, timeRemaining: LEVEL_DURATION, totalBins: 4, speed: 1500 }));
      initBins(4);
    } else {
      const newBinCount = Math.min(settings.level + 3, 12);
      const newSpeed = Math.max(1500 - (settings.level * 100), 400);
      setSettings(prev => ({ ...prev, timeRemaining: LEVEL_DURATION, totalBins: newBinCount, speed: newSpeed }));
      initBins(newBinCount);
    }
    setStatus(GameStatus.PLAYING);
  };

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      timerRef.current = setInterval(() => {
        setSettings(prev => {
          if (prev.timeRemaining <= 1) { clearInterval(timerRef.current!); return { ...prev, timeRemaining: 0 }; }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  useEffect(() => {
    if (settings.timeRemaining === 0 && status === GameStatus.PLAYING) {
      setStatus(GameStatus.LEVEL_WON);
      getCatEncouragement(settings.level, settings.score).then(setFlavorText);
    }
    if (status === GameStatus.GAME_OVER) playSound('gameover', settings.isMuted);
  }, [settings.timeRemaining, status, settings.level, settings.score, settings.isMuted]);

  const getRandomCatType = (level: number): CatType => {
    const roll = Math.random();
    // Power-ups distribution
    if (roll < 0.03) return 'powerup_broom';
    if (roll < 0.06) return 'powerup_clock';
    if (roll < 0.09) return 'powerup_slow';
    if (roll < 0.12) return 'powerup_frenzy';
    if (roll < 0.15) return 'powerup_freeze';
    if (roll < 0.18) return 'powerup_repellent';

    if (roll < 0.23 && level > 2) return 'golden';
    if (roll < 0.31 && level > 1) return 'ninja';
    if (roll < 0.38) return 'speedy';
    if (roll < 0.45) return 'sticky';
    if (roll < 0.55) return 'grumpy';
    if (roll < 0.65) return 'sleepy';
    if (roll < 0.80) return 'playful';
    return 'normal';
  };

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      const effectiveSpeed = isSlowMotion ? settings.speed * 2.2 : settings.speed;
      spawnRef.current = setInterval(() => {
        // Skip spawn if frozen or repelled
        if (isFrozen || isRepelled) return;

        setBins(currentBins => {
          const closedIndices = currentBins.map((b, i) => b.isOpen ? -1 : i).filter(i => i !== -1);
          if (closedIndices.length === 0) return currentBins;
          const countToOpen = Math.min(Math.floor(settings.level / 3) + 1, 3);
          const nextBins = [...currentBins];
          for (let i = 0; i < countToOpen; i++) {
            if (closedIndices.length === 0) break;
            const binIdx = closedIndices.splice(Math.floor(Math.random() * closedIndices.length), 1)[0];
            const catType = getRandomCatType(settings.level);
            
            if (catType === 'ninja') playSound('spawn_ninja', settings.isMuted);
            else if (catType === 'golden') playSound('spawn_golden', settings.isMuted);
            else if (catType === 'speedy') playSound('spawn_speedy', settings.isMuted);
            else playSound('spawn_normal', settings.isMuted);

            nextBins[binIdx] = { ...nextBins[binIdx], isOpen: true, hasCat: true, catType, spawnTime: Date.now(), hitsRemaining: catType === 'sticky' ? 2 : 1 };
          }
          return nextBins;
        });
      }, effectiveSpeed);
    } else {
      if (spawnRef.current) clearInterval(spawnRef.current);
    }
    return () => { if (spawnRef.current) clearInterval(spawnRef.current); };
  }, [status, settings.speed, settings.level, isSlowMotion, isFrozen, isRepelled, settings.isMuted]);

  useEffect(() => {
    const autoClose = setInterval(() => {
      if (status !== GameStatus.PLAYING) return;
      const now = Date.now();
      const effectiveBaseSpeed = isSlowMotion ? settings.speed * 3 : settings.speed;

      setBins(currentBins => currentBins.map(bin => {
        if (!bin.isOpen) return bin;
        // If repellent is active, close all bins immediately
        if (isRepelled) return { ...bin, isOpen: false, hasCat: false, hitsRemaining: 1 };

        let mult = 1.5;
        if (bin.catType === 'ninja') mult = 0.6;
        if (bin.catType === 'speedy') mult = 0.4;
        if (bin.catType === 'sleepy') mult = 3.5;
        if (bin.catType === 'sticky') mult = 2.5;

        if (now - bin.spawnTime > (effectiveBaseSpeed * mult)) {
          if (bin.catType === 'ninja') playSound('exit_ninja', settings.isMuted);
          else if (bin.catType === 'speedy') playSound('exit_speedy', settings.isMuted);
          else playSound('exit_generic', settings.isMuted);

          return { ...bin, isOpen: false, hasCat: false, hitsRemaining: 1 };
        }
        return bin;
      }));
    }, 200);
    return () => clearInterval(autoClose);
  }, [status, settings.speed, isSlowMotion, isRepelled, settings.isMuted]);

  const handleBinClick = (id: number) => {
    if (status !== GameStatus.PLAYING) return;
    setBins(currentBins => {
      const bin = currentBins.find(b => b.id === id);
      if (!bin || !bin.isOpen) return currentBins;

      playSound('hit', settings.isMuted);
      if (bin.hitsRemaining > 1) return currentBins.map(b => b.id === id ? { ...b, hitsRemaining: b.hitsRemaining - 1 } : b);

      let gain = 10;
      if (bin.catType === 'ninja') gain = 40;
      if (bin.catType === 'speedy') gain = 50;
      if (bin.catType === 'golden') gain = 150;
      if (bin.catType === 'playful') gain = 20;
      if (bin.catType === 'grumpy') gain = 30;
      if (bin.catType === 'sticky') gain = 30;

      if (bin.catType === 'powerup_broom') { 
        showPowerupMessage('ניקוי פחים מהיר! 🧹'); 
        setSettings(s => ({ ...s, score: s.score + 50 })); 
        return currentBins.map(b => ({ ...b, isOpen: false, hasCat: false, hitsRemaining: 1 })); 
      }
      if (bin.catType === 'powerup_clock') showPowerupMessage('זמן נוסף! ⏰');
      if (bin.catType === 'powerup_slow') { 
        showPowerupMessage('הילוך איטי! ❄️'); 
        setIsSlowMotion(true); 
        setTimeout(() => setIsSlowMotion(false), 7000); 
      }
      if (bin.catType === 'powerup_frenzy') { 
        showPowerupMessage('טירוף נקודות! 🔥'); 
        setIsFrenzy(true); 
        setTimeout(() => setIsFrenzy(false), 5000); 
      }
      if (bin.catType === 'powerup_freeze') {
        showPowerupMessage('הקפאת פחים! 🧊');
        setIsFrozen(true);
        setTimeout(() => setIsFrozen(false), 5000);
      }
      if (bin.catType === 'powerup_repellent') {
        showPowerupMessage('מרחיק חתולים! 🧴');
        setIsRepelled(true);
        setTimeout(() => setIsRepelled(false), 4000);
        // Force all current bins to close
        return currentBins.map(b => ({ ...b, isOpen: false, hasCat: false, hitsRemaining: 1 }));
      }

      setSettings(s => ({ ...s, score: s.score + (isFrenzy ? gain * 2 : gain) }));
      return currentBins.map(b => b.id === id ? { ...b, isOpen: false, hasCat: false, hitsRemaining: 1 } : b);
    });
  };

  const pauseGame = () => { playSound('click', settings.isMuted); setStatus(GameStatus.PAUSED); };
  const resumeGame = () => { playSound('click', settings.isMuted); setStatus(GameStatus.PLAYING); };
  const nextLevel = () => { playSound('click', settings.isMuted); setSettings(prev => ({ ...prev, level: prev.level + 1 })); startGame(false); };
  const quitGame = () => { playSound('click', settings.isMuted); settings.score > 0 ? setStatus(GameStatus.GAME_OVER) : setStatus(GameStatus.MENU); };
  const submitScore = () => { playSound('click', settings.isMuted); saveHighScore(playerName, settings.score); setPlayerName(''); setStatus(GameStatus.MENU); };

  const getEnvColor = () => {
    if (isSlowMotion) return 'bg-cyan-950/60';
    if (isFrenzy) return 'bg-red-950/60';
    if (isFrozen) return 'bg-blue-900/60';
    if (isRepelled) return 'bg-purple-900/60';
    const colors = ['bg-neutral-900', 'bg-blue-950/40', 'bg-purple-950/40', 'bg-green-950/40', 'bg-orange-950/40'];
    return colors[settings.level % colors.length];
  };

  return (
    <div className={`min-h-screen ${getEnvColor()} flex flex-col items-center justify-center p-4 font-sans select-none overflow-hidden rtl transition-colors duration-700`} dir="rtl">
      {activeMessage && (
        <div className="fixed top-1/4 left-1/2 -translate-x-1/2 z-[200] animate-bounce bg-yellow-400 text-black px-8 py-3 rounded-full font-black text-3xl shadow-2xl border-4 border-white whitespace-nowrap">
          {activeMessage}
        </div>
      )}

      {status === GameStatus.MENU && (
        <div className="flex flex-col items-center text-center max-w-md w-full animate-in fade-in zoom-in duration-500">
          <div className="relative mb-8">
            <h1 className="text-7xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl italic">חתול <span className="text-yellow-400">בפח!</span></h1>
            <div className="absolute -top-12 -right-12 text-7xl animate-float">🐱</div>
          </div>
          <div className="w-full bg-gray-800/80 backdrop-blur-xl rounded-[2rem] p-8 mb-8 border border-gray-700 shadow-2xl">
            <h3 className="text-yellow-400 font-bold mb-6 uppercase tracking-[0.2em] text-sm">הניקוד הגבוה ביותר</h3>
            {highScores.length === 0 ? <p className="text-gray-500 italic">אין עדיין שיאים...</p> : (
              <div className="space-y-3">
                {highScores.map((hs, i) => (
                  <div key={i} className="flex justify-between items-center text-white border-b border-gray-700/50 pb-2">
                    <span className="font-bold opacity-30 w-8 text-left">{i + 1}.</span>
                    <span className="flex-1 text-right px-3 truncate font-medium">{hs.name}</span>
                    <span className="font-black text-yellow-500 text-lg">{hs.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => startGame(true)} className="w-full py-7 bg-yellow-400 hover:bg-yellow-300 text-black text-4xl font-black rounded-[2rem] transition-all shadow-[0_12px_0_rgb(161,98,7)] active:translate-y-2 active:shadow-none mb-8 hover:scale-[1.02]">שחק עכשיו!</button>
          <div className="mt-4 text-gray-400 text-sm">
            <p>© Noam Gold AI 2026</p>
            <p>Send Feedback: <a href="mailto:goldnoamai@gmail.com" className="text-blue-400 hover:underline">goldnoamai@gmail.com</a></p>
          </div>
        </div>
      )}

      {status === GameStatus.PLAYING && (
        <>
          <HUD score={settings.score} timeRemaining={settings.timeRemaining} level={settings.level} isMuted={settings.isMuted} onToggleMute={() => setSettings(s => ({ ...s, isMuted: !s.isMuted }))} onPause={pauseGame} />
          <div className="mt-24 w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 md:gap-12 place-items-center">
            {bins.map(bin => (
              <TrashBin 
                id={bin.id} key={bin.id} isOpen={bin.isOpen} hasCat={bin.hasCat} 
                catType={bin.catType} spawnTime={bin.spawnTime} hitsRemaining={bin.hitsRemaining} 
                isSlowMotion={isSlowMotion} onClick={() => handleBinClick(bin.id)} 
              />
            ))}
          </div>
        </>
      )}

      {status === GameStatus.PAUSED && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-6xl font-black text-white mb-10">המשחק נעצר</h2>
          <div className="flex flex-col gap-5 w-full max-w-xs">
            <button onClick={resumeGame} className="py-6 bg-yellow-400 text-black text-2xl font-black rounded-3xl shadow-2xl active:scale-95">המשך לשחק</button>
            <button onClick={quitGame} className="py-5 bg-red-600 text-white text-xl font-bold rounded-3xl opacity-80">סיים וצא</button>
          </div>
        </div>
      )}

      {status === GameStatus.LEVEL_WON && (
        <div className="fixed inset-0 bg-gray-950 z-[100] flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-6xl font-black text-blue-400 mb-2">שלב {settings.level} הושלם!</h2>
          <p className="text-3xl text-white font-bold mb-8">ניקוד: <span className="text-yellow-400">{settings.score}</span></p>
          <div className="bg-gray-900/80 p-10 rounded-[2.5rem] mb-10 border-2 border-blue-500/30 max-w-md italic shadow-2xl">
            <p className="text-gray-100 text-2xl font-medium leading-relaxed">"{flavorText}"</p>
          </div>
          <button onClick={nextLevel} className="py-7 px-12 bg-blue-500 hover:bg-blue-400 text-white text-3xl font-black rounded-3xl transition-all shadow-[0_10px_0_rgb(30,64,175)] active:translate-y-2">לשלב הבא!</button>
        </div>
      )}

      {status === GameStatus.GAME_OVER && (
        <div className="fixed inset-0 bg-gray-950 z-[110] flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-7xl font-black text-red-500 mb-4 tracking-tight">נגמר המשחק!</h2>
          <p className="text-4xl text-white font-bold mb-10">הניקוד: <span className="text-yellow-400">{settings.score}</span></p>
          <div className="w-full max-w-md bg-gray-900/80 p-8 rounded-[2.5rem] shadow-2xl border border-gray-800">
            <label className="block text-gray-400 mb-5 text-xl font-medium">איך נקרא לך?</label>
            <input type="text" maxLength={15} value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="הכנס שם..." className="w-full py-5 px-8 bg-gray-800 text-white rounded-[1.5rem] text-center text-3xl focus:outline-none mb-8" autoFocus />
            <button onClick={submitScore} className="w-full py-6 bg-yellow-400 text-black text-3xl font-black rounded-[1.5rem] active:scale-95">שמור ניקוד</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
