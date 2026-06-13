import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const doctor_id = url.searchParams.get('doctor_id');
    const patient_id = url.searchParams.get('patient_id');

    let query = supabaseAdmin
      .from('conversations')
      .select('*, profiles!conversations_patient_id_fkey(full_name, phone)');

    if (doctor_id) query = query.eq('doctor_id', doctor_id);
    else if (patient_id) query = query.eq('patient_id', patient_id);

    const { data, error } = await query.order('updated_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { patient_id, doctor_id, appointment_id } = body;

    if (!patient_id || !doctor_id) {
      return NextResponse.json({ error: 'patient_id and doctor_id required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('conversations')
      .insert([{ patient_id, doctor_id, appointment_id }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
