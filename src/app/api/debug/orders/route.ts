import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pharmacyId = url.searchParams.get('pharmacy_id');

    if (pharmacyId) {
      const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('pharmacy_id', pharmacyId);

      return NextResponse.json({ pharmacyId, orders, error: error?.message });
    }

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .limit(50);

    const { data: pharmacies } = await supabaseAdmin
      .from('pharmacies')
      .select('id, name, user_id');

    const { data: meds } = await supabaseAdmin
      .from('medicines')
      .select('id, pharmacy_id, name')
      .limit(5);

    return NextResponse.json({
      orders: orders || [],
      error: error?.message,
      pharmacies: pharmacies || [],
      sampleMeds: meds || [],
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
