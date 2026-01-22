
import { Locale, translations } from '../locales';

export const getCatEncouragement = async (lang: Locale): Promise<string> => {
  // Offline-friendly static messages
  const t = translations[lang] || translations.en;
  return t.encouragement;
};
