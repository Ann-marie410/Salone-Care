import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabaseAnon } from '../../../../lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const { data: otpRecord, error: selectError } = await supabaseAdmin
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .eq('code', otp)
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (selectError || !otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    await supabaseAdmin
      .from('email_verifications')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    const { data: userData } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    const user = userData?.users?.find((u) => u.email === email);

    if (user) {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });
    }

    const role = user?.user_metadata?.role || 'patient';

    let session = null;

    if (user) {
      const { data: linkData, error: linkError } =
        await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email,
        });

      if (!linkError && linkData?.properties?.hashed_token) {
        const { data: sessionData } = await supabaseAnon.auth.verifyOtp({
          email,
          token: linkData.properties.hashed_token,
          type: 'magiclink',
        });
        session = sessionData?.session ?? null;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      session,
      user: {
        id: user?.id,
        email,
        role,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
