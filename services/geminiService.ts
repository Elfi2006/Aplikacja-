
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ComparisonResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const SYSTEM_INSTRUCTION = `
Jesteś Zaawansowanym Doradcą Finansowym AI i Twoją misją jest matematyczna optymalizacja finansów klienta. 
Działasz jako "Inteligentny Asystent Finansowy i Porównywarka Ofert".

Twoje zadania:
1. Bezlitosna analiza matematyczna: Porównuj RRSO, całkowity koszt kredytu, prowizje i ubezpieczenia.
2. Ranking ofert: Jeśli otrzymasz dane o kilku ofertach (w formie tekstu lub plików), wskaż tę matematycznie najkorzystniejszą i uzasadnij to liczbami.
3. Wykrywanie zagrożeń: Szukasz klauzul abuzywnych i ukrytych kosztów.
4. Negocjacje: Przygotowujesz argumenty do zbicia marży w oparciu o konkurencyjne oferty.
5. Obiektywizm: Jesteś po stronie klienta, nie banku. Twoim celem jest minimalizacja oddawanych bankowi odsetek.

Zawsze zwracaj JSON zgodny ze schematem ComparisonResult przy porównywaniu wielu dokumentów/ofert.
`;

export const analyzeContract = async (
  input: { text?: string; file?: { data: string; mimeType: string } }
): Promise<AnalysisResult & { negotiationScript: string }> => {
  const parts = [];

  if (input.text) {
    parts.push({ text: `Analiza tekstu umowy:\n\n${input.text}` });
  }

  if (input.file) {
    parts.push({
      inlineData: {
        data: input.file.data,
        mimeType: input.file.mimeType,
      },
    });
    parts.push({ text: "Przeanalizuj powyższy dokument. Skup się na punktach, które można wynegocjować." });
  }

  if (parts.length === 0) throw new Error("Brak danych do analizy.");

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          hiddenFees: { type: Type.ARRAY, items: { type: Type.STRING } },
          risks: { type: Type.ARRAY, items: { type: Type.STRING } },
          jargonExplained: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["term", "explanation"]
            }
          },
          savingsTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
          negotiationScript: { type: Type.STRING }
        },
        required: ["summary", "hiddenFees", "risks", "jargonExplained", "savingsTips", "riskLevel", "negotiationScript"]
      }
    }
  });

  try {
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Błąd podczas analizy dokumentu.");
  }
};

export const compareOffers = async (
  inputs: Array<{ text?: string; file?: { data: string; mimeType: string } }>
): Promise<ComparisonResult> => {
  const parts: any[] = [{ text: "Porównaj matematycznie poniższe oferty kredytowe dostarczone jako dokumenty lub tekst. Wskaż najlepszą pod względem finansowym." }];

  inputs.forEach((input, index) => {
    parts.push({ text: `--- START OFERTA #${index + 1} ---` });
    if (input.text) {
      parts.push({ text: input.text });
    }
    if (input.file) {
      parts.push({
        inlineData: {
          data: input.file.data,
          mimeType: input.file.mimeType,
        },
      });
    }
    parts.push({ text: `--- KONIEC OFERTA #${index + 1} ---` });
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          winner: { type: Type.STRING, description: "Nazwa lub numer najlepszej oferty." },
          mathematicalAnalysis: { type: Type.STRING, description: "Szczegółowe wyliczenia różnic." },
          offerSummaries: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                totalCost: { type: Type.STRING },
                rrso: { type: Type.STRING },
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "totalCost", "rrso", "pros", "cons"]
            }
          },
          finalVerdict: { type: Type.STRING, description: "Ostateczna rekomendacja dla klienta." }
        },
        required: ["winner", "mathematicalAnalysis", "offerSummaries", "finalVerdict"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini comparison parse error:", error);
    throw new Error("Błąd podczas porównywania ofert.");
  }
};

export const chatWithAdvisor = async (message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
    history: history
  });
  
  const response = await chat.sendMessage({ message });
  return response.text;
};
