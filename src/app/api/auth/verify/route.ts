import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: { persistSession: false },
  }
);

export async function POST(request: NextRequest) {
  try {
    const { email, token, type } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email and verification token are required' },
        { status: 400 }
      );
    }

    // Verify the OTP token
    const { data, error } = await supabase.auth.verifyOtp({
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

    // Get user metadata
    const fullName = data.user.user_metadata?.full_name || 'User';
    const role = data.user.user_metadata?.role || 'patient';

    // Create profile if it doesn't exist
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .single();

    if (!profileData) {
      const { error: createProfileError } = await supabase
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
