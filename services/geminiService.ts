import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Lazy initialization holder
let aiClient: GoogleGenAI | null = null;

// Helper to safely access environment variables in various environments (Vite, Webpack, Browser Polyfill)
const getApiKey = (): string | undefined => {
  try {
    // Check standard node process (handled by bundlers)
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {}

  try {
    // Check browser window polyfill (for static GitHub Pages)
    // @ts-ignore
    if (typeof window !== 'undefined' && window.process?.env?.API_KEY) {
      // @ts-ignore
      return window.process.env.API_KEY;
    }
  } catch (e) {}
  
  return undefined;
};

// Lazy getter for the client
const getGeminiClient = (): GoogleGenAI | null => {
  if (aiClient) return aiClient;

  const apiKey = getApiKey();
  // If no API key is found, return null so the app can fallback to offline mode
  // instead of crashing with a "API Key must be set" error.
  if (!apiKey) return null;

  try {
    aiClient = new GoogleGenAI({ apiKey });
    return aiClient;
  } catch (error) {
    console.warn("Failed to initialize Gemini Client:", error);
    return null;
  }
};

const SYSTEM_INSTRUCTION = `
You are "Ouyi AI," a printing and packaging specialist for Ouyi, a factory based in Shanghai, China.
Your goal is to assist international clients with personalized printing and custom packaging needs.

Key Business Policies (Crucial to explain):
1. **Location**: We are based in Shanghai. We welcome factory visits!
2. **Small Business Friendly**: We accept small orders.
3. **Pricing Reality**: You MUST explain that "Price is strongly connected to quantity." 
   - Low quantity = Much higher unit price (expensive).
   - High quantity = Very cheap unit price.
4. **Design**: We can design packaging for clients if they don't have files.
5. **Specialty**: We excel at "rare craft" packaging and complex structures.

Capabilities:
- Personalized Printing (Marketing materials, stationery)
- Custom Packaging (Rigid boxes, gift boxes, rare crafts)
- Structural Design Services
- Global Shipping

If the user asks for a quote, ask for dimensions, material preference, and MOST IMPORTANTLY, quantity.
Always be polite, professional, and encourage them to visit our Shanghai factory if they are interested in a long-term partnership.
`;

export const sendMessageToGemini = async (
  history: { role: string; text: string }[],
  message: string
): Promise<string> => {
  const ai = getGeminiClient();

  // Graceful fallback if API key is missing (e.g. GitHub Pages demo)
  if (!ai) {
    return "Thank you for your message. Our AI system is currently in 'Showcase Mode'. Please contact our team directly via the form below or email contact@ouyiprint.com for a personalized quote from our Shanghai factory.";
  }

  try {
    const model = 'gemini-3-flash-preview';

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      history: history.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      })),
    });

    const result: GenerateContentResponse = await chat.sendMessage({
      message: message
    });

    return result.text || "I apologize, I'm having trouble connecting to the Ouyi server. Please try again or contact our Shanghai team directly.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I am currently experiencing high traffic. Please reach out to us via the contact form for an immediate response.";
  }
};