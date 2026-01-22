
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, BinState, GameSettings, HighScore, CatType, BinVisualType } from './types';
import HUD from './components/HUD';
import TrashBin from './components/TrashBin';
import AdPlaceholder from './components/AdPlaceholder';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import { getCatEncouragement } from './services/geminiService';
import { playSound } from './services/audioService';
import { translations, Locale } from './locales';
import { speak } from './services/ttsService';

const LEVEL_DURATION = 30;
const STORAGE_KEY = 'cat_bin_high_scores';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [lang, setLang] = useState<Locale>('he');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [highContrast, setHighContrast] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lives, setLives] = useState(5);
  
  const t = translations[lang];

  const [settings, setSettings] = useState<GameSettings>({
    level: 1,
    score: 0,
    timeRemaining: LEVEL_DURATION,
    totalBins: 4,
    speed: 1500,
    isMuted: false
  });
  const [bins, setBins] = useState<BinState[]>([]);
  const [flavorText, setFlavorText] = useState<string>("");
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
  
  // Power-up timers
  const slowMoTimeoutRef = useRef<any>(null);
  const frenzyTimeoutRef = useRef<any>(null);
  const freezeTimeoutRef = useRef<any>(null);
  const repellentTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setHighScores(JSON.parse(saved));
    setFlavorText(t.encouragement);
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const sizeMap = {
      sm: '14px',
      md: '16px',
      lg: '20px'
    };
    root.style.fontSize = sizeMap[fontSize];
  }, [fontSize]);

  const handleTTS = (text: string) => {
    if (!settings.isMuted) speak(text, lang);
  };

  const showPowerupMessage = (msg: string) => {
    setActiveMessage(msg);
    playSound('powerup', settings.isMuted);
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => setActiveMessage(null), 2000);
  };

  const clearPowerups = () => {
    setIsSlowMotion(false);
    setIsFrenzy(false);
    setIsFrozen(false);
    setIsRepelled(false);
    if (slowMoTimeoutRef.current) clearTimeout(slowMoTimeoutRef.current);
    if (frenzyTimeoutRef.current) clearTimeout(frenzyTimeoutRef.current);
    if (freezeTimeoutRef.current) clearTimeout(freezeTimeoutRef.current);
    if (repellentTimeoutRef.current) clearTimeout(repellentTimeoutRef.current);
  };

  const saveHighScore = (name: string, score: number) => {
    const newScore: HighScore = { name: name || t.playerName, score, date: new Date().toLocaleDateString() };
    const updated = [...highScores, newScore].sort((a, b) => b.score - a.score).slice(0, 5);
    setHighScores(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const submitScore = () => {
    saveHighScore(playerName, settings.score);
    setStatus(GameStatus.MENU);
    setPlayerName('');
  };

  const initBins = useCallback((count: number) => {
    const visualTypes: BinVisualType[] = ['metal', 'wooden', 'plastic-blue', 'plastic-green', 'rusty', 'high-tech'];
    const newBins: BinState[] = Array.from({ length: count }, (_, i) => ({
      id: i, 
      isOpen: false, 
      hasCat: false, 
      catType: 'normal', 
      visualType: visualTypes[Math.floor(Math.random() * visualTypes.length)],
      spawnTime: 0, 
      hitsRemaining: 1
    }));
    setBins(newBins);
  }, []);

  const getRandomCatType = (level: number): CatType => {
    const roll = Math.random();
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

  const startGame = (resetTotal = true) => {
    clearPowerups();
    setActiveMessage(null);
    playSound('click', settings.isMuted);
    
    if (resetTotal) {
      setSettings({
        level: 1,
        score: 0,
        timeRemaining: LEVEL_DURATION,
        totalBins: 4,
        speed: 1500,
        isMuted: settings.isMuted
      });
      setLives(5);
      initBins(4);
    } else {
      const nextLevel = settings.level + 1;
      const newBinCount = 4 + Math.floor((nextLevel - 1) / 3);
      const newSpeed = Math.max(1500 - (nextLevel * 50), 400);
      
      setSettings(prev => ({
        ...prev,
        level: nextLevel,
        timeRemaining: LEVEL_DURATION,
        totalBins: newBinCount,
        speed: newSpeed
      }));
      initBins(newBinCount);
    }
    setStatus(GameStatus.PLAYING);
  };

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      timerRef.current = setInterval(() => {
        setSettings(prev => {
          if (prev.timeRemaining <= 1) { 
            clearInterval(timerRef.current!); 
            return { ...prev, timeRemaining: 0 }; 
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      const effectiveSpeed = isSlowMotion ? settings.speed * 2.2 : settings.speed;
      spawnRef.current = setInterval(() => {
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

            nextBins[binIdx] = { 
              ...nextBins[binIdx], 
              isOpen: true, 
              hasCat: true, 
              catType, 
              spawnTime: Date.now(), 
              hitsRemaining: catType === 'sticky' ? 2 : 1 
            };
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

      setBins(currentBins => {
        let changed = false;
        const nextBins = currentBins.map(bin => {
          if (!bin.isOpen) return bin;
          if (isRepelled) return { ...bin, isOpen: false, hasCat: false, hitsRemaining: 1 };

          let mult = 1.5;
          if (bin.catType === 'ninja') mult = 0.6;
          if (bin.catType === 'speedy') mult = 0.4;
          if (bin.catType === 'sleepy') mult = 3.5;
          if (bin.catType === 'sticky') mult = 2.5;

          if (now - bin.spawnTime > (effectiveBaseSpeed * mult)) {
            changed = true;
            // User failed to close the bin - Lose a life if it's a cat
            if (!bin.catType.startsWith('powerup_')) {
              setLives(prevLives => {
                const newLives = prevLives - 1;
                if (newLives <= 0) setStatus(GameStatus.GAME_OVER);
                return newLives;
              });
            }

            if (bin.catType === 'ninja') playSound('exit_ninja', settings.isMuted);
            else if (bin.catType === 'speedy') playSound('exit_speedy', settings.isMuted);
            else playSound('exit_generic', settings.isMuted);

            return { ...bin, isOpen: false, hasCat: false, hitsRemaining: 1 };
          }
          return bin;
        });
        return changed ? nextBins : currentBins;
      });
    }, 200);
    return () => clearInterval(autoClose);
  }, [status, settings.speed, isSlowMotion, isRepelled, settings.isMuted]);

  useEffect(() => {
    if (settings.timeRemaining === 0 && status === GameStatus.PLAYING) {
      setStatus(GameStatus.LEVEL_WON);
      getCatEncouragement(lang).then(setFlavorText);
    }
    if (status === GameStatus.GAME_OVER) playSound('gameover', settings.isMuted);
  }, [settings.timeRemaining, status, lang]);

  const handleBinClick = (id: number) => {
    if (status !== GameStatus.PLAYING) return;
    setBins(currentBins => {
      const binIndex = currentBins.findIndex(b => b.id === id);
      const bin = currentBins[binIndex];
      if (!bin || !bin.isOpen) return currentBins;

      playSound('hit', settings.isMuted);
      if (bin.hitsRemaining > 1) {
        return currentBins.map(b => b.id === id ? { ...b, hitsRemaining: b.hitsRemaining - 1 } : b);
      }

      let gain = 10;
      if (bin.catType === 'ninja') gain = 40;
      if (bin.catType === 'speedy') gain = 50;
      if (bin.catType === 'golden') gain = 150;

      // Powerup Logic
      if (bin.catType.startsWith('powerup_')) {
        const type = bin.catType;
        if (type === 'powerup_slow') {
          setIsSlowMotion(true);
          showPowerupMessage(lang === 'he' ? "הילוך איטי!" : "Slow Motion!");
          if (slowMoTimeoutRef.current) clearTimeout(slowMoTimeoutRef.current);
          slowMoTimeoutRef.current = setTimeout(() => setIsSlowMotion(false), 10000); // 10s
        } else if (type === 'powerup_frenzy') {
          setIsFrenzy(true);
          showPowerupMessage(lang === 'he' ? "שיגעון ניקוד! x3" : "Frenzy! x3 Score");
          if (frenzyTimeoutRef.current) clearTimeout(frenzyTimeoutRef.current);
          frenzyTimeoutRef.current = setTimeout(() => setIsFrenzy(false), 8000); // 8s
        } else if (type === 'powerup_freeze') {
          setIsFrozen(true);
          showPowerupMessage(lang === 'he' ? "קפוא!" : "Frozen!");
          if (freezeTimeoutRef.current) clearTimeout(freezeTimeoutRef.current);
          freezeTimeoutRef.current = setTimeout(() => setIsFrozen(false), 5000); // 5s
        } else if (type === 'powerup_clock') {
          setSettings(s => ({ ...s, timeRemaining: s.timeRemaining + 10 }));
          showPowerupMessage(lang === 'he' ? "+10 שניות" : "+10 Seconds");
        } else if (type === 'powerup_broom') {
          showPowerupMessage(lang === 'he' ? "טאטוא נקי!" : "Clean Sweep!");
          gain = 100;
          // Effect: all current bins close handled by the state return below
          return currentBins.map(b => ({ ...b, isOpen: false, hasCat: false, hitsRemaining: 1 }));
        } else if (type === 'powerup_repellent') {
          setIsRepelled(true);
          showPowerupMessage(lang === 'he' ? "דוחה חתולים!" : "Cat Repellent!");
          if (repellentTimeoutRef.current) clearTimeout(repellentTimeoutRef.current);
          repellentTimeoutRef.current = setTimeout(() => setIsRepelled(false), 5000); // 5s
          return currentBins.map(b => ({ ...b, isOpen: false, hasCat: false, hitsRemaining: 1 }));
        }
      }

      setSettings(s => ({ ...s, score: s.score + (isFrenzy ? gain * 3 : gain) }));
      return currentBins.map(b => b.id === id ? { ...b, isOpen: false, hasCat: false, hitsRemaining: 1 } : b);
    });
  };

  const getEnvColor = () => {
    if (highContrast) return 'bg-black';
    if (theme === 'light') return 'bg-slate-100';
    if (isSlowMotion) return 'bg-cyan-950/60';
    if (isFrenzy) return 'bg-red-950/60';
    return 'bg-gray-900';
  };

  return (
    <div className={`min-h-screen ${getEnvColor()} ${highContrast ? 'high-contrast' : ''} flex flex-col items-center justify-center p-4 font-sans select-none overflow-hidden transition-colors duration-700`} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      
      <AccessibilityToolbar 
        currentLang={lang} setLang={setLang}
        fontSize={fontSize} setFontSize={setFontSize}
        highContrast={highContrast} setHighContrast={setHighContrast}
        theme={theme} setTheme={setTheme}
        isMuted={settings.isMuted}
        setIsMuted={(muted) => setSettings(s => ({ ...s, isMuted: muted }))}
      />

      {status === GameStatus.MENU && (
        <div className="flex flex-col items-center text-center max-w-md w-full animate-in fade-in zoom-in duration-500">
          <div className="relative mb-8">
            <h1 className="text-7xl md:text-8xl font-black text-white dark:text-white tracking-tighter drop-shadow-2xl italic">
              {t.title.split(' ').map((word, i) => (
                <span key={i} className={i === 1 ? "text-yellow-400" : (theme === 'light' ? 'text-gray-900' : 'text-white')}>{word} </span>
              ))}
            </h1>
            <div className="absolute -top-12 -right-12 text-7xl animate-float">🐱</div>
          </div>
          
          <div className="w-full bg-gray-800/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[2rem] p-8 mb-8 border border-gray-700 shadow-2xl">
            <h3 className="text-yellow-400 font-bold mb-6 uppercase tracking-[0.2em] text-sm">{t.highScores}</h3>
            {highScores.length === 0 ? <p className="text-gray-500 italic">{t.noScores}</p> : (
              <div className="space-y-3">
                {highScores.map((hs, i) => (
                  <div key={i} className="flex justify-between items-center text-white border-b border-gray-700/50 pb-2">
                    <span className="font-bold opacity-30 w-8">{i + 1}.</span>
                    <span className="flex-1 px-3 truncate font-medium">{hs.name}</span>
                    <span className="font-black text-yellow-500 text-lg">{hs.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button 
            onMouseEnter={() => handleTTS(t.play)}
            onClick={() => startGame(true)} 
            className="w-full py-7 bg-yellow-400 hover:bg-yellow-300 text-black text-4xl font-black rounded-[2rem] transition-all shadow-[0_12px_0_rgb(161,98,7)] active:translate-y-2 active:shadow-none mb-8 hover:scale-[1.02]"
          >
            {t.play}
          </button>
          
          <div className="mt-4 text-gray-400 dark:text-gray-400 text-sm">
            <p>{t.copyright}</p>
            <p>{t.feedback}: <a href="mailto:goldnoamai@gmail.com" className="text-blue-400 hover:underline">goldnoamai@gmail.com</a></p>
          </div>
        </div>
      )}

      {status === GameStatus.PLAYING && (
        <>
          <HUD 
            score={settings.score} 
            timeRemaining={settings.timeRemaining} 
            level={settings.level} 
            lives={lives}
            isMuted={settings.isMuted} 
            isFrenzy={isFrenzy}
            isSlowMotion={isSlowMotion}
            isFrozen={isFrozen}
            onToggleMute={() => setSettings(s => ({ ...s, isMuted: !s.isMuted }))} 
            onPause={() => setStatus(GameStatus.PAUSED)} 
          />
          
          {activeMessage && (
            <div className="fixed top-32 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-8 py-4 rounded-full font-black text-3xl shadow-2xl animate-bounce z-[60]">
              {activeMessage}
            </div>
          )}

          <div className="mt-32 w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 md:gap-12 place-items-center">
            {bins.map(bin => (
              <TrashBin 
                key={bin.id}
                id={bin.id} isOpen={bin.isOpen} hasCat={bin.hasCat} 
                catType={bin.catType} visualType={bin.visualType} spawnTime={bin.spawnTime} hitsRemaining={bin.hitsRemaining} 
                isSlowMotion={isSlowMotion} onClick={() => handleBinClick(bin.id)} 
              />
            ))}
          </div>

          <div className="fixed bottom-24 right-4 grid grid-cols-3 gap-1 md:hidden opacity-50">
            <div />
            <button className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center font-bold">W</button>
            <div />
            <button className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center font-bold">A</button>
            <button className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center font-bold">S</button>
            <button className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center font-bold">D</button>
          </div>
        </>
      )}

      {status === GameStatus.PAUSED && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-6xl font-black text-white mb-10">{t.paused}</h2>
          <div className="flex flex-col gap-5 w-full max-w-xs">
            <button onClick={() => setStatus(GameStatus.PLAYING)} className="py-6 bg-yellow-400 text-black text-2xl font-black rounded-3xl active:scale-95">{t.resume}</button>
            <button onClick={() => startGame(true)} className="py-5 bg-blue-600 text-white text-xl font-bold rounded-3xl active:scale-95">Reset Level</button>
            <button onClick={() => setStatus(GameStatus.MENU)} className="py-5 bg-red-600 text-white text-xl font-bold rounded-3xl opacity-80">{t.quit}</button>
          </div>
        </div>
      )}

      {status === GameStatus.LEVEL_WON && (
        <div className="fixed inset-0 bg-gray-950 z-[100] flex flex-col items-center justify-center p-8 text-center overflow-y-auto">
          <h2 className="text-6xl font-black text-blue-400 mb-2">{t.levelWon}</h2>
          <p className="text-2xl text-gray-400 mb-4">{lang === 'he' ? `השלמת את שלב ${settings.level}!` : `You completed Stage ${settings.level}!`}</p>
          <p className="text-3xl text-white font-bold mb-8">{t.score}: <span className="text-yellow-400">{settings.score}</span></p>
          <div className="bg-gray-900/80 p-10 rounded-[2.5rem] mb-10 border-2 border-blue-500/30 max-w-md italic shadow-2xl">
            <p className="text-gray-100 text-2xl font-medium leading-relaxed">"{flavorText}"</p>
          </div>
          <div className="flex flex-col gap-4 w-full max-w-sm">
            <button onClick={() => startGame(false)} className="py-7 px-12 bg-blue-500 hover:bg-blue-400 text-white text-3xl font-black rounded-3xl transition-all shadow-[0_10px_0_rgb(30,64,175)] active:translate-y-2">{t.nextLevel}</button>
            <button onClick={() => setStatus(GameStatus.MENU)} className="py-5 bg-red-600 text-white text-xl font-bold rounded-3xl active:scale-95">{t.quit}</button>
          </div>
        </div>
      )}

      {status === GameStatus.GAME_OVER && (
        <div className="fixed inset-0 bg-gray-950 z-[110] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 overflow-y-auto">
          <h2 className="text-7xl font-black text-red-500 mb-4 tracking-tight">{t.gameOver}</h2>
          <p className="text-4xl text-white font-bold mb-10">{t.finalScore}: <span className="text-yellow-400">{settings.score}</span></p>
          <div className="w-full max-w-md bg-gray-900/80 p-8 rounded-[2.5rem] shadow-2xl border border-gray-800 backdrop-blur-sm">
            <label className="block text-gray-400 mb-5 text-xl font-medium">{t.playerName}</label>
            <input 
              type="text" 
              maxLength={15} 
              value={playerName} 
              onChange={(e) => setPlayerName(e.target.value)} 
              placeholder={t.placeholder} 
              className="w-full py-5 px-8 bg-gray-800 text-white rounded-[1.5rem] text-center text-3xl focus:outline-none focus:ring-4 focus:ring-yellow-400/50 mb-8" 
              autoFocus 
            />
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={submitScore} 
                className="w-full py-6 bg-yellow-400 text-black text-3xl font-black rounded-[1.5rem] hover:bg-yellow-300 transition-all shadow-[0_8px_0_rgb(161,98,7)] active:translate-y-2 active:shadow-none"
              >
                {t.saveScore}
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => startGame(true)} 
                  className="py-4 bg-green-600 text-white text-xl font-black rounded-[1.5rem] hover:bg-green-500 transition-all shadow-[0_6px_0_rgb(21,128,61)] active:translate-y-1 active:shadow-none"
                >
                  {t.playAgain}
                </button>
                <button 
                  onClick={() => setStatus(GameStatus.MENU)} 
                  className="py-4 bg-gray-700 text-white text-xl font-black rounded-[1.5rem] hover:bg-gray-600 transition-all shadow-[0_6px_0_rgb(55,65,81)] active:translate-y-1 active:shadow-none"
                >
                  {t.mainMenu}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <footer className="fixed bottom-0 left-0 w-full p-2 flex justify-center gap-4 text-[10px] text-gray-500 pointer-events-none">
        <span>{t.copyright}</span>
        <span>{t.feedback}: goldnoamai@gmail.com</span>
      </footer>

      <div className="fixed bottom-0 w-full p-4 pointer-events-none opacity-40"><AdPlaceholder /></div>
    </div>
  );
};

export default App;
