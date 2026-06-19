import { NextResponse } from 'next/server';
import { getChatResponse } from '@/lib/chat-engine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const response = getChatResponse(message.trim());

    return NextResponse.json({
      data: {
        response,
      },
    });
  } catch {
    return NextResponse.json({
      data: {
        response:
          'Sorry, something went wrong on my end. Please try again in a moment.',
      },
    });
  }
}
