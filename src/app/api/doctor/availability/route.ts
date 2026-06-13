import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const doctor_id = url.searchParams.get('doctor_id');

    if (!doctor_id) {
      return NextResponse.json({ error: 'doctor_id required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('doctors')
      .select('id, availability')
      .eq('id', doctor_id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { doctor_id, availability } = body;

    if (!doctor_id || !availability) {
      return NextResponse.json({ error: 'doctor_id and availability required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('doctors')
      .update({ availability })
      .eq('id', doctor_id)
      .select('id, availability')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
