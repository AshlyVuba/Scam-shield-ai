import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ScamAnalysisResult {
  score: number;
  status: 'Safe' | 'Suspicious' | 'Scam';
  reasons: string[];
}

export async function analyzeScam(text: string): Promise<ScamAnalysisResult> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `You are a scam detection expert. Analyze the provided text or transcription. 
  Use this scoring system: 
  - Urgency (+2)
  - Money (+3)
  - Job Scam (+4)
  - Emotional Manipulation (+3). 
  
  Calculate the total score based on these criteria. 
  Determine the status based on the score:
  - 0-2: Safe
  - 3-5: Suspicious
  - 6+: Scam

  Text to analyze: "${text}"

  Output ONLY a JSON object conforming to this schema:
  {
    "score": number,
    "status": "Safe" | "Suspicious" | "Scam",
    "reasons": string[]
  }`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            status: { type: Type.STRING, enum: ["Safe", "Suspicious", "Scam"] },
            reasons: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["score", "status", "reasons"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from AI");
    }

    return JSON.parse(resultText) as ScamAnalysisResult;
  } catch (error) {
    console.error("Scam analysis failed:", error);
    return {
      score: 0,
      status: 'Safe',
      reasons: ["Failed to analyze the text. Please try again later."]
    };
  }
}
