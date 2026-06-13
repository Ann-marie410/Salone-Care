import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabaseAnon } from '../../../../lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, role } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: role || 'patient' },
    });

    if (createError) {
      console.error('Supabase createUser error:', createError);
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      );
    }

    const userRole = role || 'patient';
    const approvalStatus = userRole === 'doctor' || userRole === 'pharmacy' ? 'pending' : 'approved';

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: fullName,
        role: userRole,
        approval_status: approvalStatus,
      })
      .eq('id', userData.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    if (userRole === 'doctor') {
      const { error: doctorError } = await supabaseAdmin.from('doctors').insert({
        user_id: userData.user.id,
        specialization: '',
        hospital_affiliation: '',
      });
      if (doctorError) {
        console.error('Doctor record creation error:', doctorError);
      }
    }

    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Supabase signIn error:', signInError);
      return NextResponse.json(
        { error: signInError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      session: signInData.session,
      user: signInData.user,
      role: role || 'patient',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
