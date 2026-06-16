import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are SaloneCare AI, a friendly health guide for Sierra Leone.

- Be warm and conversational, like a helpful friend. Use simple English.
- Give Sierra Leone-specific advice. Mention local hospitals, 117 for emergencies.
- NEVER diagnose or prescribe — say "a doctor can help with that."
- Keep responses short and natural. Remember the conversation context.
- End each reply with: "(AI assistant — check with a doctor for medical advice)"`;

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history = [] } = body;

    if (!message) {
      return NextResponse.json({ error: 'message required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your-gemini-api-key-here' || apiKey.startsWith('yourA')) {
      return NextResponse.json({
        data: {
          response:
            'I need a valid API key to work! Here\'s how to set me up:\n\n1. Go to https://aistudio.google.com/apikey\n2. Click "Create API Key"\n3. Copy the key and paste it in your `.env.local` file:\n\n```\nGEMINI_API_KEY=your-actual-key-here\n```\n\n4. Save the file and restart your dev server (`npm run dev`)\n\nOnce that\'s done, I\'ll be ready to chat! 😊',
          disclaimer: '',
        },
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Got it. I\'ll be friendly, conversational, and give Sierra Leone-specific health guidance.' }] },
      ...history.flatMap((msg: ChatMessage) => [
        { role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.content }] },
      ]),
      { role: 'user', parts: [{ text: message }] },
    ];

    const result = await model.generateContent({ contents });
    const responseText = result.response.text();

    return NextResponse.json({
      data: {
        response: responseText,
        disclaimer: '',
      },
    });
  } catch (err: unknown) {
    const errorMessage = String(err);
    return NextResponse.json({
      data: {
        response:
          errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key')
            ? 'That API key doesn\'t seem to work. Make sure you\'re using a **Gemini API key** from https://aistudio.google.com/apikey — it usually starts with `AIza...`.\n\nCopy the key, paste it in `.env.local` as `GEMINI_API_KEY=your-key`, save, and restart your dev server.'
            : errorMessage.includes('429') || errorMessage.includes('quota')
              ? 'The free tier quota for this API key is used up for today. Two ways to fix this:\n\n1. **Get a new key** (fastest): Go to https://aistudio.google.com/apikey, create a new API key in a *new project*, and paste it in `.env.local`.\n\n2. **Enable billing** on your Google Cloud project at https://console.cloud.google.com\n\nOr just wait until the quota resets (usually daily) 🙂'
              : `I ran into an issue: ${errorMessage}`,
        disclaimer: '',
      },
    });
  }
}
