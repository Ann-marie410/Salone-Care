import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  RateLimitError,
  AuthenticationError,
  APIConnectionError,
  APIConnectionTimeoutError,
  InternalServerError,
} from 'openai';

const SYSTEM_PROMPT = `You are SaloneCare AI, the official AI Health Assistant for SaloneCare — a digital healthcare platform for Sierra Leone.

## Your Role
- Be warm, friendly, and conversational, like a trusted health guide.
- Provide general health and wellness information in simple, easy-to-understand language.
- Support communication in BOTH English and Krio.
- Detect whether the user is writing in English or Krio and reply in the same language whenever possible.
- Give Sierra Leone-specific advice (e.g., mention local hospitals, call 117 for emergencies).
- Explain medical concepts in language that is easy for users to understand.
- Help users understand symptoms, medications, healthy living, and preventive care.
- Guide users to appropriate healthcare services available within SaloneCare.

## Strict Rules
- NEVER diagnose diseases or prescribe medications.
- NEVER claim to be a licensed doctor, pharmacist, or healthcare professional.
- NEVER invent medical facts or provide misleading information.
- Always recommend consulting a licensed doctor, pharmacist, or healthcare facility for diagnosis, treatment, emergencies, or urgent medical concerns.
- End each reply with: "(AI assistant — check with a doctor for medical advice)"
- Keep responses short, natural, and respectful. Remember the conversation context.`;

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your-openai-api-key-here' || apiKey.startsWith('sk-placeholder')) {
      return NextResponse.json({
        data: {
          response:
            'I need a valid OpenAI API key to work! Here\'s how to set me up:\n\n1. Go to https://platform.openai.com/api-keys\n2. Click "Create new secret key"\n3. Copy the key (starts with `sk-...`)\n4. Open your `.env.local` file and add:\n\n```\nOPENAI_API_KEY=sk-your-actual-key-here\n```\n\n5. Save the file and restart your dev server (`npm run dev`)\n\nOnce that\'s done, I\'ll be ready to chat!',
          disclaimer: '',
        },
      });
    }

    const openai = new OpenAI({
      apiKey,
      timeout: 30000,
      maxRetries: 0,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.map((msg: ChatMessage) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user', content: message },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const responseText =
      completion.choices[0]?.message?.content || 'Sorry, I couldn\'t process that. Could you rephrase?';

    return NextResponse.json({
      data: {
        response: responseText,
        disclaimer: '',
      },
    });
  } catch (err: unknown) {
    if (err instanceof RateLimitError) {
      console.error('[AI Chat] Rate limit or quota exhausted:', {
        status: err.status,
        message: err.message,
      });
      return NextResponse.json({
        data: {
          response:
            'The AI assistant is currently unavailable because the API quota has been exhausted. Please ask the app admin to add billing at https://platform.openai.com/account/billing, or try again later.',
          disclaimer: '',
        },
      });
    }

    if (err instanceof AuthenticationError) {
      console.error('[AI Chat] Authentication failed - invalid API key:', {
        status: err.status,
        message: err.message,
      });
      return NextResponse.json({
        data: {
          response:
            'The AI assistant is not configured correctly. The API key appears to be invalid. Please ask the app admin to check the OPENAI_API_KEY in the .env.local file.',
          disclaimer: '',
        },
      });
    }

    if (err instanceof APIConnectionTimeoutError) {
      console.error('[AI Chat] Connection timed out:', { message: (err as Error).message });
      return NextResponse.json({
        data: {
          response:
            'The AI assistant took too long to respond. Please check your internet connection and try again.',
          disclaimer: '',
        },
      });
    }

    if (err instanceof APIConnectionError) {
      console.error('[AI Chat] Network error reaching OpenAI:', { message: (err as Error).message });
      return NextResponse.json({
        data: {
          response:
            'Unable to reach the AI assistant due to a network issue. Please check your internet connection and try again.',
          disclaimer: '',
        },
      });
    }

    if (err instanceof InternalServerError) {
      console.error('[AI Chat] OpenAI server error:', {
        status: err.status,
        message: err.message,
      });
      return NextResponse.json({
        data: {
          response:
            'The AI assistant encountered a server error. Please try again in a moment.',
          disclaimer: '',
        },
      });
    }

    console.error('[AI Chat] Unexpected error:', {
      name: err instanceof Error ? (err as Error).name : typeof err,
      message: err instanceof Error ? (err as Error).message : String(err),
      stack: err instanceof Error ? (err as Error).stack : undefined,
    });

    return NextResponse.json({
      data: {
        response:
          'Sorry, something went wrong on my end. Please try again in a moment.',
        disclaimer: '',
      },
    });
  }
}
