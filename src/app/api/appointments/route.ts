import { NextResponse } from 'next/server';
import supabaseAdmin from '../../../lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const patient_id = url.searchParams.get('patient_id');
    const doctor_id = url.searchParams.get('doctor_id');

    let query = supabaseAdmin.from('appointments').select('*');

    if (patient_id) query = query.eq('patient_id', patient_id);
    else if (doctor_id) query = query.eq('doctor_id', doctor_id);

    const { data, error } = await query.order('scheduled_at', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { patient_id, doctor_id, scheduled_at, reason } = body;

    if (!patient_id || !doctor_id || !scheduled_at) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('appointments')
      .insert([{ patient_id, doctor_id, scheduled_at, reason }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
