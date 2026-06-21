import { NextResponse } from 'next/server';
import { processMessage, createInitialState, ConversationState } from '@/lib/chat-engine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, conversation } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const prevState: ConversationState = conversation && typeof conversation === 'object'
      ? { ...createInitialState(), ...conversation }
      : createInitialState();

    const { response, newState } = processMessage(message.trim(), prevState);

    return NextResponse.json({
      data: {
        response,
        conversation: newState,
      },
    });
  } catch {
    return NextResponse.json({
      data: {
        response: 'Sorry, something went wrong on my end. Please try again in a moment.',
        conversation: createInitialState(),
      },
    });
  }
}
