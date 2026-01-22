
export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  LEVEL_WON = 'LEVEL_WON',
  GAME_OVER = 'GAME_OVER'
}

export type CatType = 
  | 'normal' 
  | 'ninja' 
  | 'golden' 
  | 'grumpy' 
  | 'sleepy' 
  | 'playful' 
  | 'speedy'
  | 'sticky'
  | 'powerup_broom' 
  | 'powerup_clock' 
  | 'powerup_slow' 
  | 'powerup_frenzy'
  | 'powerup_freeze'
  | 'powerup_repellent';

export type BinVisualType = 
  | 'metal'
  | 'wooden'
  | 'plastic-blue'
  | 'plastic-green'
  | 'rusty'
  | 'high-tech';

export interface BinState {
  id: number;
  isOpen: boolean;
  hasCat: boolean;
  catType: CatType;
  visualType: BinVisualType;
  spawnTime: number;
  hitsRemaining: number;
}

export interface GameSettings {
  level: number;
  score: number;
  timeRemaining: number;
  totalBins: number;
  speed: number;
  isMuted: boolean;
}

export interface HighScore {
  name: string;
  score: number;
  date: string;
}
