import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabaseAnon } from '../../../../lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const { email, token, password } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email and verification token are required' },
        { status: 400 }
      );
    }

    // Verify the OTP token
    const { data, error } = await supabaseAnon.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      );
    }

    // Set the user's password (signInWithOtp doesn't set one)
    if (password) {
      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
        data.user.id,
        { password }
      );
      if (passwordError) {
        console.error('Password update error:', passwordError);
      }
    }

    // Get user metadata
    const fullName = data.user.user_metadata?.full_name || 'User';
    const role = data.user.user_metadata?.role || 'patient';

    // Check if profile exists (auto-trigger should have created it)
    const { data: profileData } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .single();

    // Create profile if it doesn't exist (fallback)
    if (!profileData) {
      const { error: createProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          role,
        });

      if (createProfileError && createProfileError.code !== '23505') {
        console.error('Profile creation error:', createProfileError);
      }
    }

    // For doctors and pharmacies, check approval status
    let requiresApproval = false;
    let approvalStatus = 'approved';

    if (role === 'doctor' || role === 'pharmacy') {
      requiresApproval = true;
      approvalStatus = 'pending';
    }

    return NextResponse.json({
      success: true,
      message: requiresApproval 
        ? 'Email verified! Your account is pending admin approval. You will receive an email once approved.'
        : 'Email verified successfully!',
      user: data.user,
      session: data.session,
      requiresApproval,
      approvalStatus,
      role,
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred during verification' },
      { status: 500 }
    );
  }
}
