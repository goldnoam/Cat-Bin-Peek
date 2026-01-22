
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, BinState, GameSettings, HighScore, CatType } from './types';
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

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setHighScores(JSON.parse(saved));
    setFlavorText(t.encouragement);
    // Set dark theme by default
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleTTS = (text: string) => {
    if (!settings.isMuted) speak(text, lang);
  };

  const showPowerupMessage = (msg: string) => {
    setActiveMessage(msg);
    playSound('powerup', settings.isMuted);
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => setActiveMessage(null), 2000);
  };

  const saveHighScore = (name: string, score: number) => {
    const newScore: HighScore = { name: name || t.playerName, score, date: new Date().toLocaleDateString() };
    const updated = [...highScores, newScore].sort((a, b) => b.score - a.score).slice(0, 5);
    setHighScores(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Fix for error: Cannot find name 'submitScore'
  const submitScore = () => {
    saveHighScore(playerName, settings.score);
    setStatus(GameStatus.MENU);
    setPlayerName('');
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

  const resetGame = () => {
    startGame(true);
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
      getCatEncouragement(lang).then(setFlavorText);
    }
    if (status === GameStatus.GAME_OVER) playSound('gameover', settings.isMuted);
  }, [settings.timeRemaining, status, lang]);

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

      if (bin.catType.startsWith('powerup_')) {
        showPowerupMessage("Power UP!");
      }

      setSettings(s => ({ ...s, score: s.score + (isFrenzy ? gain * 2 : gain) }));
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
    <div className={`min-h-screen ${getEnvColor()} ${highContrast ? 'high-contrast' : ''} font-size-${fontSize} flex flex-col items-center justify-center p-4 font-sans select-none overflow-hidden transition-colors duration-700`} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      
      <AccessibilityToolbar 
        currentLang={lang} setLang={setLang}
        fontSize={fontSize} setFontSize={setFontSize}
        highContrast={highContrast} setHighContrast={setHighContrast}
        theme={theme} setTheme={setTheme}
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
            isMuted={settings.isMuted} 
            isFrenzy={isFrenzy}
            isSlowMotion={isSlowMotion}
            isFrozen={isFrozen}
            onToggleMute={() => setSettings(s => ({ ...s, isMuted: !s.isMuted }))} 
            onPause={() => setStatus(GameStatus.PAUSED)} 
          />
          <div className="mt-32 w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 md:gap-12 place-items-center">
            {bins.map(bin => (
              <TrashBin 
                key={bin.id}
                id={bin.id} isOpen={bin.isOpen} hasCat={bin.hasCat} 
                catType={bin.catType} spawnTime={bin.spawnTime} hitsRemaining={bin.hitsRemaining} 
                isSlowMotion={isSlowMotion} onClick={() => handleBinClick(bin.id)} 
              />
            ))}
          </div>

          {/* Virtual WASD for mobile movement simulation/selection */}
          <div className="fixed bottom-24 right-4 grid grid-cols-3 gap-1 md:hidden opacity-50">
            <div />
            <button onTouchStart={() => {/* Simulate W */}} className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center font-bold">W</button>
            <div />
            <button onTouchStart={() => {/* Simulate A */}} className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center font-bold">A</button>
            <button onTouchStart={() => {/* Simulate S */}} className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center font-bold">S</button>
            <button onTouchStart={() => {/* Simulate D */}} className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center font-bold">D</button>
          </div>
        </>
      )}

      {status === GameStatus.PAUSED && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-6xl font-black text-white mb-10">{t.paused}</h2>
          <div className="flex flex-col gap-5 w-full max-w-xs">
            <button onClick={() => setStatus(GameStatus.PLAYING)} className="py-6 bg-yellow-400 text-black text-2xl font-black rounded-3xl active:scale-95">{t.resume}</button>
            <button onClick={resetGame} className="py-5 bg-blue-600 text-white text-xl font-bold rounded-3xl active:scale-95">Reset Level</button>
            <button onClick={() => setStatus(GameStatus.MENU)} className="py-5 bg-red-600 text-white text-xl font-bold rounded-3xl opacity-80">{t.quit}</button>
          </div>
        </div>
      )}

      {status === GameStatus.LEVEL_WON && (
        <div className="fixed inset-0 bg-gray-950 z-[100] flex flex-col items-center justify-center p-8 text-center overflow-y-auto">
          <h2 className="text-6xl font-black text-blue-400 mb-2">{t.levelWon}</h2>
          <p className="text-3xl text-white font-bold mb-8">{t.score}: <span className="text-yellow-400">{settings.score}</span></p>
          <div className="bg-gray-900/80 p-10 rounded-[2.5rem] mb-10 border-2 border-blue-500/30 max-w-md italic shadow-2xl">
            <p className="text-gray-100 text-2xl font-medium leading-relaxed">"{flavorText}"</p>
          </div>
          <button onClick={() => startGame(false)} className="py-7 px-12 bg-blue-500 hover:bg-blue-400 text-white text-3xl font-black rounded-3xl transition-all shadow-[0_10px_0_rgb(30,64,175)] active:translate-y-2">{t.nextLevel}</button>
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
      
      {/* Footer information */}
      <footer className="fixed bottom-0 left-0 w-full p-2 flex justify-center gap-4 text-[10px] text-gray-500 pointer-events-none">
        <span>{t.copyright}</span>
        <span>{t.feedback}: goldnoamai@gmail.com</span>
      </footer>

      <div className="fixed bottom-0 w-full p-4 pointer-events-none opacity-40"><AdPlaceholder /></div>
    </div>
  );
};

export default App;
