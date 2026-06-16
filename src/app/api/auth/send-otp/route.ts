import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseServer';
import { sendOTPEmail } from '../../../../lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await supabaseAdmin
      .from('email_verifications')
      .delete()
      .eq('email', email);

    const { error: insertError } = await supabaseAdmin
      .from('email_verifications')
      .insert({
        email,
        code: otp,
        expires_at: expiresAt,
        verified: false,
      });

    if (insertError) {
      console.error('Failed to save OTP:', insertError);
      return NextResponse.json(
        { error: 'Failed to generate verification code' },
        { status: 500 }
      );
    }

    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      const msg = emailError instanceof Error ? emailError.message : String(emailError);
      console.error('[SEND-OTP] Failed to send email:', msg);
      return NextResponse.json(
        { error: `Failed to send verification email: ${msg}` },
        { status: 500 }
      );
    }

    console.log('[SEND-OTP] New OTP sent successfully to:', email);

    return NextResponse.json({ success: true, message: 'Verification code sent' });
  } catch (error) {
    console.error('[SEND-OTP] Error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
