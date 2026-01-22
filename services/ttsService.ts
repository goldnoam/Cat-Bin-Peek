
export const speak = (text: string, lang: string = 'en') => {
  if (!window.speechSynthesis) return;
  
  // Cancel existing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  
  window.speechSynthesis.speak(utterance);
};
