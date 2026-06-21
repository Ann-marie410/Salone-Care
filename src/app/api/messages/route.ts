import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const conversation_id = url.searchParams.get('conversation_id');

    if (!conversation_id) {
      return NextResponse.json({ error: 'conversation_id required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { conversation_id, sender_id, content } = body;

    if (!conversation_id || !sender_id || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert([{ conversation_id, sender_id, content }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const sender_id = url.searchParams.get('sender_id');

    if (!id || !sender_id) {
      return NextResponse.json({ error: 'id and sender_id are required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('messages')
      .delete()
      .eq('id', id)
      .eq('sender_id', sender_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
