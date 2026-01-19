import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize Gemini
// Note: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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