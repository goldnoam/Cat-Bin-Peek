
import React from 'react';
import { Locale, translations } from '../locales';
import { Settings, Type, Languages, Contrast, Moon, Sun, Volume2, VolumeX } from 'lucide-react';

interface AccessibilityToolbarProps {
  currentLang: Locale;
  setLang: (lang: Locale) => void;
  fontSize: 'sm' | 'md' | 'lg';
  setFontSize: (size: 'sm' | 'md' | 'lg') => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
}

const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({
  currentLang, setLang, fontSize, setFontSize, highContrast, setHighContrast, theme, setTheme, isMuted, setIsMuted
}) => {
  const languages: Locale[] = ['en', 'he', 'zh', 'hi', 'de', 'es', 'fr'];

  return (
    <div className="fixed bottom-4 left-4 flex gap-2 z-[200]">
      <div className="group relative">
        <button className="p-3 bg-gray-800 rounded-full shadow-lg border border-gray-700 hover:bg-gray-700 transition-colors text-white" aria-label="Accessibility Settings">
          <Settings className="w-6 h-6" />
        </button>
        
        <div className="absolute bottom-full left-0 mb-2 p-4 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col gap-4 min-w-[200px]">
          {/* Mute Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-400 flex items-center gap-1">
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />} MUTE
            </label>
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`w-10 h-5 rounded-full relative transition-colors ${isMuted ? 'bg-yellow-400' : 'bg-gray-600'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${isMuted ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Theme Switcher */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 flex items-center gap-1">
              {theme === 'dark' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />} THEME
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 py-1 rounded text-xs border ${theme === 'dark' ? 'bg-yellow-400 text-black border-yellow-400' : 'border-gray-600 text-gray-300'}`}
              >
                DARK
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 py-1 rounded text-xs border ${theme === 'light' ? 'bg-yellow-400 text-black border-yellow-400' : 'border-gray-600 text-gray-300'}`}
              >
                LIGHT
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 flex items-center gap-1">
              <Type className="w-3 h-3" /> FONT SIZE
            </label>
            <div className="flex gap-2">
              {(['sm', 'md', 'lg'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`flex-1 py-1 rounded text-xs border ${fontSize === size ? 'bg-yellow-400 text-black border-yellow-400' : 'border-gray-600 text-gray-300'}`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 flex items-center gap-1">
              <Languages className="w-3 h-3" /> LANGUAGE
            </label>
            <select 
              value={currentLang}
              onChange={(e) => setLang(e.target.value as Locale)}
              className="bg-gray-900 border border-gray-600 rounded p-1 text-sm outline-none text-white"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{translations[lang].langName}</option>
              ))}
            </select>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-400 flex items-center gap-1">
              <Contrast className="w-3 h-3" /> CONTRAST
            </label>
            <button 
              onClick={() => setHighContrast(!highContrast)}
              className={`w-10 h-5 rounded-full relative transition-colors ${highContrast ? 'bg-yellow-400' : 'bg-gray-600'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${highContrast ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityToolbar;
