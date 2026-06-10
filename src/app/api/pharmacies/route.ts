import { NextResponse } from 'next/server';
import supabaseAdmin from '../../../lib/supabaseServer';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('pharmacies')
      .select('*')
      .eq('approval_status', 'approved');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
