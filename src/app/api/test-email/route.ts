import { NextRequest, NextResponse } from 'next/server';
import { verifyConnection, sendOTPEmail } from '../../../lib/email';

export async function POST(request: NextRequest) {
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();

  const results: Record<string, unknown> = {
    config: {
      host: process.env.SMTP_HOST || '(not set, default: smtp.gmail.com)',
      port: process.env.SMTP_PORT || '(not set, default: 587)',
      user: smtpUser || '(not set)',
      passConfigured: smtpPass.length > 0,
      passLength: smtpPass.length,
      passHasSpaces: smtpPass.includes(' '),
      passIsPlaceholder: smtpPass === 'your_gmail_app_password',
      userIsPlaceholder: smtpUser === 'your_email@gmail.com',
    },
    connection: null,
    send: null,
  };

  const conn = await verifyConnection();
  results.connection = conn;

  if (!conn.ok) {
    return NextResponse.json({
      ...results,
      status: 'CONNECTION_FAILED',
    }, { status: 500 });
  }

  try {
    let { email } = await request.json();
    email = (email || smtpUser || '').trim();

    if (!email) {
      return NextResponse.json({
        ...results,
        status: 'CONNECTION_OK_NO_EMAIL',
        message: 'SMTP connected. Pass {"email": "you@example.com"} in the request body to test sending.',
      });
    }

    const testOtp = String(Math.floor(100000 + Math.random() * 900000));
    await sendOTPEmail(email, testOtp);
    results.send = { success: true, to: email };

    return NextResponse.json({
      ...results,
      status: 'ALL_OK',
      message: `SMTP OK. Test email sent to ${email}.`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.send = { success: false, error: msg };
    return NextResponse.json({
      ...results,
      status: 'SEND_FAILED',
    }, { status: 500 });
  }
}
