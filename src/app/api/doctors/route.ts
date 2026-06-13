import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseServer';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('doctors')
      .select('id, user_id, specialization, hospital_affiliation, approval_status, bio, profiles(full_name)')
      .eq('approval_status', 'approved');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Flatten the joined profile data for easier consumption
    const doctors = (data || []).map((d: { profiles?: { full_name?: string }[] | null }) => ({
      ...d,
      full_name: d.profiles?.[0]?.full_name || 'Unknown',
      profiles: undefined,
    }));

    return NextResponse.json({ data: doctors });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
