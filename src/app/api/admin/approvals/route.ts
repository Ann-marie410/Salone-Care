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

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('role', ['doctor', 'pharmacy'])
      .eq('approval_status', 'pending');

    if (error) {
      console.error('[ADMIN APPROVALS] Fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ approvals: data || [] });
  } catch (error) {
    console.error('[ADMIN APPROVALS] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, status } = body;

    if (!userId || !status) {
      return NextResponse.json({ error: 'userId and status are required' }, { status: 400 });
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ approval_status: status })
      .eq('id', userId);

    if (profileError) {
      console.error('[ADMIN APPROVALS] Update error:', profileError);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    await supabaseAdmin
      .from('doctors')
      .update({ approval_status: status })
      .eq('user_id', userId);

    await supabaseAdmin
      .from('pharmacies')
      .update({ approval_status: status })
      .eq('user_id', userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ADMIN APPROVALS] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
