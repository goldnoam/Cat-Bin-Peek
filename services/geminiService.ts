
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client following standard guidelines: const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCatEncouragement = async (level: number, score: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The player just finished level ${level} of a game called 'Cat Bin Peek' with a score of ${score}. Write a short, funny, 1-sentence message in Hebrew from the perspective of a grumpy cat who got their bin closed.`,
    });
    return response.text || "מיאו! סגרת לי את הפח!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "מיאו! כל הכבוד!";
  }
};
