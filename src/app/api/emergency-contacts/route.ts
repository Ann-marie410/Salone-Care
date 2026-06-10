import { NextResponse } from 'next/server';
import supabaseAdmin from '../../../lib/supabaseServer';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('emergency_contacts')
      .select('*')
      .eq('is_active', true)
      .order('contact_type', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
