import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseServer';

export async function GET() {
  try {
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'doctor')
      .eq('approval_status', 'approved');

    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

    const userIds = (profiles || []).map((p: { id: string }) => p.id);

    if (userIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const { data: doctors, error: doctorError } = await supabaseAdmin
      .from('doctors')
      .select('*')
      .in('user_id', userIds);

    if (doctorError) return NextResponse.json({ error: doctorError.message }, { status: 500 });

    const profileMap = new Map((profiles || []).map((p: { id: string; full_name: string }) => [p.id, p.full_name]));

    const result = (doctors || []).map((d: { user_id: string }) => ({
      ...d,
      full_name: profileMap.get(d.user_id) || 'Unknown',
    }));

    return NextResponse.json({ data: result });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
