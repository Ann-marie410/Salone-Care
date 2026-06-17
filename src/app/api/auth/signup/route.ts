import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseServer';
import { sendOTPEmail } from '../../../../lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    let fullName = '';

    if (role === 'patient') {
      fullName = body.fullName;
      if (!fullName) {
        return NextResponse.json(
          { error: 'Full name is required' },
          { status: 400 }
        );
      }
    } else if (role === 'doctor') {
      fullName = body.fullName;
      if (!fullName || !body.specialty || !body.licenseNumber) {
        return NextResponse.json(
          { error: 'Full name, specialty, and license number are required' },
          { status: 400 }
        );
      }
    } else if (role === 'pharmacy') {
      fullName = body.pharmacyName;
      if (!fullName || !body.pharmacyIdNumber) {
        return NextResponse.json(
          { error: 'Pharmacy name and identification number are required' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid role. Must be patient, doctor, or pharmacy' },
        { status: 400 }
      );
    }

    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { full_name: fullName, role },
    });

    if (createError) {
      console.error('Supabase createUser error:', createError);
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      );
    }

    const approvalStatus = role === 'doctor' || role === 'pharmacy' ? 'pending' : 'approved';

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userData.user.id,
        full_name: fullName,
        role,
        approval_status: approvalStatus,
      });

    if (profileError) {
      console.error('Profile upsert error:', profileError);
    }

    if (role === 'doctor') {
      const { error: doctorError } = await supabaseAdmin.from('doctors').insert({
        user_id: userData.user.id,
        specialization: body.specialty,
        hospital_affiliation: '',
        license_number: body.licenseNumber,
      });
      if (doctorError) {
        console.error('Doctor record creation error:', doctorError);
      }
    }

    if (role === 'pharmacy') {
      const { error: pharmacyError } = await supabaseAdmin.from('pharmacies').insert({
        user_id: userData.user.id,
        name: fullName,
        address: '',
        phone: '',
        pharmacy_identification_number: body.pharmacyIdNumber,
      });
      if (pharmacyError) {
        console.error('Pharmacy record creation error:', pharmacyError);
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: otpError } = await supabaseAdmin
      .from('email_verifications')
      .insert({
        email,
        code: otp,
        expires_at: expiresAt,
        verified: false,
      });

    if (otpError) {
      console.error('[SIGNUP] OTP save error:', otpError);
      return NextResponse.json(
        { error: 'Failed to save verification code' },
        { status: 500 }
      );
    }

    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      const msg = emailError instanceof Error ? emailError.message : String(emailError);
      console.error('[SIGNUP] Failed to send OTP email:', msg);
      return NextResponse.json(
        { error: `Failed to send verification email: ${msg}` },
        { status: 500 }
      );
    }

    console.log('[SIGNUP] Account created and OTP sent successfully for:', email);

    return NextResponse.json({
      success: true,
      email,
      role,
      message: 'Account created! Please verify your email.',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
