import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are SaloneCare AI Health Assistant, a helpful health guidance bot for people in Sierra Leone (Salone). 

Guidelines:
- Answer the user's question directly and accurately. Do not give generic responses.
- Provide practical, actionable health guidance based on established medical knowledge.
- Include relevant Sierra Leone context when applicable (e.g., mention 117 for emergencies, local health resources).
- Keep responses clear, concise, and easy to understand. Use plain language.
- Always end with a brief disclaimer that this is not medical advice.
- If you don't know something, say so honestly.
- For emergencies, always advise calling 117 or visiting the nearest hospital.
- NEVER diagnose conditions or prescribe medication. Suggest consulting a doctor for proper diagnosis.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'message required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      return NextResponse.json({
        data: {
          response: 'AI assistant is not configured yet. Please set your GEMINI_API_KEY in .env.local.\n\nGet a free key at: https://aistudio.google.com/apikey',
          disclaimer: '',
        },
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: `User question: ${message}` },
    ]);
    const responseText = result.response.text();

    return NextResponse.json({
      data: {
        response: responseText,
        disclaimer: '',
      },
    });
  } catch (err: unknown) {
    const errorMessage = String(err);
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key')) {
      return NextResponse.json({
        data: {
          response: 'Invalid Gemini API key. Please check your GEMINI_API_KEY in .env.local.\n\nGet a free key at: https://aistudio.google.com/apikey',
          disclaimer: '',
        },
      });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
