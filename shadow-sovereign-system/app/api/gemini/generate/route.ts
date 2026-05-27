import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Standard initialization using the GEMINI_API_KEY secret environment variable
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Insira uma diretriz de entrada de mana para o Sistema." },
        { status: 400 }
      );
    }

    // Call Gemini 3.5 Flash model
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const generatedText = response.text || "Sem resposta vinda do Sistema.";

    return NextResponse.json({ text: generatedText });
  } catch (error: any) {
    console.warn("Gemini server-side fault:", error.message || error);
    return NextResponse.json(
      { error: "Conexão com o Núcleo Imperial interrompida. Tente recalibrar o transceptor de mana." },
      { status: 500 }
    );
  }
}
