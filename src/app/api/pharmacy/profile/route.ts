import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseServer';
import { verifyToken } from '../../../../lib/auth';

async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.slice(7));
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'pharmacy') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data: pharmacy, error } = await supabaseAdmin
      .from('pharmacies')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('[PHARMACY API] Fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch pharmacy profile' }, { status: 500 });
    }

    if (!pharmacy) {
      return NextResponse.json({ error: 'Pharmacy profile not found' }, { status: 404 });
    }

    return NextResponse.json(pharmacy);
  } catch (error) {
    console.error('[PHARMACY API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
